import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { Play, Square, MapPin, Navigation, Bus, Clock, Wifi, Users, UserCircle, ShieldCheck, Activity } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, Polyline, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const socket = io(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}`);
const mapContainerStyle = { width: '100%', height: '100%' };

const DriverDashboard = () => {
    const { user } = useAuth();
    const [bus, setBus] = useState(null);
    const [isTripActive, setIsTripActive] = useState(false);
    const [location, setLocation] = useState(null);
    const [stops, setStops] = useState([]);
    const [gpsSource, setGpsSource] = useState('offline');
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [directionsRequested, setDirectionsRequested] = useState(false);

    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "" });

    useEffect(() => {
        fetchAssignedBus();
    }, []);

    const fetchAssignedBus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/driver/mybus`, { headers: { 'x-auth-token': token } });
            setBus(res.data);
            if (res.data?.route?.stops) setStops(res.data.route.stops);
        } catch (err) { console.error(err); }
    };

    const polylinePath = useMemo(() => {
        if (!bus?.route) return [];
        const path = [];
        if (bus.route.startLocation) path.push({ lat: bus.route.startLocation.latitude, lng: bus.route.startLocation.longitude });
        if (stops.length > 0) {
            const sortedStops = [...stops].filter(s => s && typeof s.order === 'number').sort((a,b) => a.order - b.order);
            sortedStops.forEach(st => path.push({ lat: st.latitude, lng: st.longitude }));
        }
        if (bus.route.endLocation) path.push({ lat: bus.route.endLocation.latitude, lng: bus.route.endLocation.longitude });
        return path;
    }, [bus, stops]);



    // Active connection between bus location and the nearest route node
    const routeConnectionPath = useMemo(() => {
        if (!location || !location.latitude || !location.longitude || polylinePath.length === 0) return [];
        let closestPoint = polylinePath[0];
        let minDistance = Infinity;
        polylinePath.forEach(point => {
            if (!point || typeof point.lat !== 'number') return;
            const dLat = point.lat - location.latitude;
            const dLng = point.lng - location.longitude;
            const dist = dLat * dLat + dLng * dLng;
            if (dist < minDistance) {
                minDistance = dist;
                closestPoint = point;
            }
        });
        if (!closestPoint) return [];
        return [{ lat: Number(location.latitude), lng: Number(location.longitude) }, closestPoint];
    }, [location, polylinePath]);
    useEffect(() => {
        let watchId;

        if (isTripActive) {
            if ("geolocation" in navigator) {
                setGpsSource('mobile_gps');
                watchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        setLocation({ latitude, longitude });
                        // Emit continuous driver location using new priority architecture
                        socket.emit('driverLocation', { busId: bus?._id, lat: latitude, lng: longitude });
                    },
                    (err) => {
                        console.warn('Primary GPS Watch Lost. Attempting coarse location...', err);
                        navigator.geolocation.getCurrentPosition(
                             (pos) => {
                                  const { latitude, longitude } = pos.coords;
                                  setLocation({ latitude, longitude });
                                  setGpsSource('mobile_gps_coarse');
                                  socket.emit('driverLocation', { busId: bus?._id, lat: latitude, lng: longitude });
                             },
                             (err2) => {
                                  setGpsSource('offline');
                             },
                             { enableHighAccuracy: false, timeout: 10000 }
                        );
                    },
                    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
                );
            } else {
                setGpsSource('offline');
            }
        } else {
            setGpsSource('offline');
        }

        return () => {
            if (watchId && navigator.geolocation) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTripActive, bus]);

    const toggleTrip = async () => {
        const newStatus = isTripActive ? 'idle' : 'running';
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/driver/trip`, { busId: bus?._id, status: newStatus });
            setIsTripActive(!isTripActive);
        } catch (err) { setIsTripActive(!isTripActive); }
    };

    const center = useMemo(() => {
        if (location) return { lat: location.latitude, lng: location.longitude };
        if (bus?.route?.startLocation) return { lat: bus.route.startLocation.latitude, lng: bus.route.startLocation.longitude };
        return { lat: 12.9716, lng: 77.5946 };
    }, [location, bus]);

    const directionsCallback = useCallback((response, status) => {
        if (status === 'OK' && response !== null) {
            setDirectionsResponse(response);
        } else {
            console.error('Directions request failed due to ' + status);
        }
        setDirectionsRequested(true);
    }, []);

    const directionsOptions = useMemo(() => {
        if (!bus?.route?.startLocation || !bus?.route?.endLocation || !isTripActive) return null;
        
        const waypts = stops.filter(s => s && typeof s.latitude === 'number').map(stop => ({
            location: { lat: stop.latitude, lng: stop.longitude },
            stopover: true
        }));

        return {
            origin: { lat: bus.route.startLocation.latitude, lng: bus.route.startLocation.longitude },
            destination: { lat: bus.route.endLocation.latitude, lng: bus.route.endLocation.longitude },
            waypoints: waypts,
            travelMode: 'DRIVING'
        };
    }, [bus, stops, isTripActive]);



    if (!bus || !bus._id) return (
        <div className="flex h-screen bg-slate-50 items-center justify-center font-black text-orange-600 animate-pulse text-2xl uppercase tracking-widest">
            Fetching Mission Parameters...
        </div>
    );

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar role="driver" />
            <main className="flex-1 overflow-y-auto p-12 bg-slate-50 text-slate-900 flex flex-col gap-12">
                <header className="flex justify-between items-center bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center gap-10">
                         <div className="w-24 h-24 bg-orange-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-2 border-white/20">
                              <Bus size={48} className="text-white" strokeWidth={1.5} />
                         </div>
                         <div>
                              <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{bus?.busNumber || 'AUTH PENDING...'}</h2>
                              <div className="flex items-center gap-4">
                                   <span className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Route: {bus?.route?.name || '--'}</span>
                                   <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                        <Wifi size={14} className="text-orange-600" /> System Link: {gpsSource.replace('_', ' ')}
                                   </span>
                              </div>
                         </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        {!isTripActive ? (
                            <button onClick={toggleTrip} className="group flex items-center gap-4 bg-orange-600 hover:bg-orange-700 text-white px-8 py-5 rounded-2xl font-black shadow-lg shadow-orange-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                <Play size={20} fill="currentColor" /> Initiate Mission
                            </button>
                        ) : (
                            <button onClick={toggleTrip} className="group flex items-center gap-4 bg-rose-600 hover:bg-rose-700 text-white px-8 py-5 rounded-2xl font-black shadow-lg shadow-rose-600/20 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                <Square size={20} fill="currentColor" /> Cease Tracking
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 flex-1">
                    <div className="xl:col-span-8 flex flex-col gap-12">
                        {/* Interactive Large Map */}
                        <div className="bg-white h-[500px] rounded-[50px] relative border border-slate-200 shadow-2xl overflow-hidden group">
                             {isLoaded ? (
                                 <GoogleMap
                                     mapContainerStyle={mapContainerStyle}
                                     center={center}
                                     zoom={14}
                                     options={{ disableDefaultUI: true }}
                                 >
                                     {directionsOptions && !directionsResponse && !directionsRequested && (
                                         <DirectionsService options={directionsOptions} callback={directionsCallback} />
                                     )}
                                     {directionsResponse && isTripActive && (
                                         <DirectionsRenderer
                                             options={{
                                                 directions: directionsResponse,
                                                 suppressMarkers: true,
                                                 polylineOptions: { strokeColor: '#ea580c', strokeOpacity: 0.8, strokeWeight: 6 }
                                             }}
                                         />
                                     )}
                                     {routeConnectionPath.length > 0 && (
                                         <Polyline path={routeConnectionPath} options={{ strokeColor: '#ea580c', strokeOpacity: 1.0, strokeWeight: 5 }} />
                                     )}
                                     {stops.map(stop => (
                                         <Marker key={stop._id} position={{ lat: stop.latitude, lng: stop.longitude }} label={{ text: `${stop.order}`, color: 'white', fontWeight: 'bold' }} />
                                     ))}
                                     {location && (
                                         <Marker position={center} icon={{ url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", scaledSize: new window.google.maps.Size(40, 40) }} />
                                     )}
                                 </GoogleMap>
                             ) : (
                                 <div className="absolute inset-0 flex items-center justify-center animate-pulse text-orange-600 font-black tracking-widest uppercase">Initializing Core Telemetry...</div>
                             )}

                             <div className="absolute top-8 left-8 z-[100] p-6 bg-white/90 border border-slate-200 rounded-3xl shadow-2xl backdrop-blur-xl">
                                  <div className="flex items-center gap-4 text-orange-600 mb-4">
                                       <Navigation size={24} fill="currentColor" />
                                       <span className="font-extrabold uppercase tracking-widest">Global Navigation</span>
                                  </div>
                                  <div className="space-y-4 font-mono text-xs font-black">
                                       <div className="flex justify-between gap-10">
                                            <span className="text-slate-400">LATITUDE</span>
                                            <span className="text-slate-900 tabular-nums">{location?.latitude?.toFixed(6) || '---.------'}</span>
                                       </div>
                                       <div className="flex justify-between gap-10">
                                            <span className="text-slate-400">LONGITUDE</span>
                                            <span className="text-slate-900 tabular-nums">{location?.longitude?.toFixed(6) || '---.------'}</span>
                                       </div>
                                  </div>
                             </div>
                        </div>

                        {/* Passenger Manifests - Table View */}
                        <div className="grid grid-cols-1 gap-12">
                             {/* Student Manifest Table */}
                             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                       <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 rounded-xl border border-orange-100"><Users className="text-orange-600" size={20} /></div>
                                            Student Manifest
                                       </h4>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{bus?.students?.length || 0} Total Active Students</span>
                                  </div>
                                  <div className="overflow-x-auto">
                                       <table className="w-full text-left">
                                            <thead>
                                                 <tr className="bg-slate-50">
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Identifier</th>
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Manifest Details</th>
                                                 </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                 {bus?.students?.filter(s => s).length > 0 ? bus.students.filter(s => s).map(s => (
                                                     <tr key={s._id} className="hover:bg-slate-50/80 transition-all group">
                                                          <td className="px-8 py-6">
                                                               <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-lg shadow-orange-600/10 group-hover:scale-105 transition-transform">
                                                                         {s.name?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div>
                                                                         <p className="font-black text-slate-900 text-sm leading-tight">{s.name}</p>
                                                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{s.email}</p>
                                                                    </div>
                                                               </div>
                                                          </td>
                                                          <td className="px-8 py-6">
                                                               <span className="font-mono text-xs font-black text-slate-700 tracking-tighter">{s.rollNumber}</span>
                                                          </td>
                                                          <td className="px-8 py-6 text-right">
                                                               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-black rounded-full border border-orange-100 uppercase tracking-widest">
                                                                    Seat {s.seatNumber || 'N/A'}
                                                               </span>
                                                          </td>
                                                     </tr>
                                                 )) : (
                                                     <tr>
                                                          <td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-bold italic text-sm">No student data detected in this directory segment.</td>
                                                     </tr>
                                                 )}
                                            </tbody>
                                       </table>
                                  </div>
                             </div>

                             {/* Faculty Manifest Table */}
                             <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                                       <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 rounded-xl border border-orange-100"><ShieldCheck className="text-orange-600" size={20} /></div>
                                            Faculty Manifest
                                       </h4>
                                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">{bus?.faculty?.length || 0} Official Personnel</span>
                                  </div>
                                  <div className="overflow-x-auto">
                                       <table className="w-full text-left">
                                            <thead>
                                                 <tr className="bg-slate-50">
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Officer Identity</th>
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Serial</th>
                                                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Clearance Level</th>
                                                 </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                 {bus?.faculty?.filter(f => f).length > 0 ? bus.faculty.filter(f => f).map(f => (
                                                     <tr key={f._id} className="hover:bg-slate-50/80 transition-all group">
                                                          <td className="px-8 py-6">
                                                               <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-xl shadow-slate-900/10 group-hover:scale-105 transition-transform">
                                                                         {f.name?.charAt(0) || '?'}
                                                                    </div>
                                                                    <div>
                                                                         <p className="font-black text-slate-900 text-sm leading-tight">{f.name}</p>
                                                                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{f.email}</p>
                                                                    </div>
                                                               </div>
                                                          </td>
                                                          <td className="px-8 py-6">
                                                               <span className="font-mono text-xs font-black text-slate-700 tracking-tighter">{f.employeeId}</span>
                                                          </td>
                                                          <td className="px-8 py-6 text-right">
                                                                <div className="flex flex-col items-end gap-1">
                                                                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[9px] font-black rounded-full shadow-lg shadow-orange-600/20 uppercase tracking-[0.2em]">
                                                                          Executive
                                                                     </span>
                                                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Seat {f.seatNumber || 'N/A'}</span>
                                                                </div>
                                                           </td>
                                                     </tr>
                                                 )) : (
                                                     <tr>
                                                          <td colSpan="3" className="px-8 py-20 text-center text-slate-300 font-bold italic text-sm">No official personnel linked to this resource.</td>
                                                     </tr>
                                                 )}
                                            </tbody>
                                       </table>
                                  </div>
                             </div>
                        </div>
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-10">
                         <div className="bg-white p-10 rounded-[50px] flex-1 border border-slate-200 shadow-2xl flex flex-col">
                              <div className="flex justify-between items-center mb-10">
                                   <h4 className="text-2xl font-black tracking-tighter flex items-center gap-4 text-slate-900">
                                       <Clock className="text-orange-600" /> TIMELINE
                                   </h4>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stops.length} ACTIVE NODES</span>
                              </div>
                               <div className="space-y-10 relative overflow-y-auto flex-1 pr-6 pb-6 custom-scrollbar">
                                   <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-100 rounded-full"></div>
                                   {stops.length > 0 ? [...stops].filter(s => s && typeof s.order === 'number').sort((a,b)=>a.order-b.order).map((stop) => (
                                       <div key={stop._id} className="flex gap-10 relative group">
                                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 shadow-sm z-10 transition-all bg-white border-slate-100 group-hover:border-orange-500/50">
                                                 <div className="text-[10px] font-black text-slate-400 italic">{stop.order}</div>
                                            </div>
                                            <div className="pt-1">
                                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">ETA: Active Update</p>
                                                 <p className="text-xl font-black text-slate-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{stop.name}</p>
                                            </div>
                                       </div>
                                   )) : (
                                       <div className="text-center py-20 bg-slate-50 rounded-[40px] border-dashed border-2 border-slate-100 flex items-center justify-center">
                                            <p className="text-slate-300 font-black italic text-xs uppercase tracking-widest opacity-50">Empty Route Matrix</p>
                                       </div>
                                   )}
                              </div>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DriverDashboard;
