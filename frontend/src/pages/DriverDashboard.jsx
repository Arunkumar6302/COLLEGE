import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { Play, Square, MapPin, Navigation, Bus, Clock, Wifi } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const socket = io(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}`);
const mapContainerStyle = { width: '100%', height: '100%' };

const DriverDashboard = () => {
    const { user } = useAuth();
    const [bus, setBus] = useState(null);
    const [isTripActive, setIsTripActive] = useState(false);
    const [location, setLocation] = useState(null);
    const [stops, setStops] = useState([]);
    const [gpsSource, setGpsSource] = useState('offline');

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
            const sortedStops = [...stops].sort((a,b) => a.order - b.order);
            sortedStops.forEach(st => path.push({ lat: st.latitude, lng: st.longitude }));
        }
        if (bus.route.endLocation) path.push({ lat: bus.route.endLocation.latitude, lng: bus.route.endLocation.longitude });
        return path;
    }, [bus, stops]);

    // Primary Mobile GPS Logic (Fallback relative to IoT Priority)
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

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
            <Sidebar role="driver" />
            <main className="flex-1 overflow-y-auto p-12 bg-slate-950 text-slate-100 flex flex-col gap-12">
                <header className="flex justify-between items-center bg-indigo-600/5 p-10 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
                    <div className="flex items-center gap-10">
                         <div className="w-24 h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-2 border-white/10">
                              <Bus size={48} className="text-white" strokeWidth={1.5} />
                         </div>
                         <div>
                              <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{bus?.busNumber || 'FETCHING BUS...'}</h2>
                              <div className="flex items-center gap-4">
                                   <span className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-sm">Active Route: {bus?.route?.name || '--'}</span>
                                   <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                   <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                                        <Wifi size={14}/> GPS Link: {gpsSource.replace('_', ' ')}
                                   </span>
                              </div>
                         </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 flex-1">
                    <div className="xl:col-span-8 flex flex-col gap-12">
                        {/* Interactive Large Map via Google Maps API */}
                        <div className="glass h-[500px] rounded-[50px] relative border-4 border-slate-900 shadow-2xl overflow-hidden group">
                             {isLoaded ? (
                                 <GoogleMap
                                     mapContainerStyle={mapContainerStyle}
                                     center={center}
                                     zoom={14}
                                     options={{ disableDefaultUI: true, styles: [
                                          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                                          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                                          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                                          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                                          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] }
                                     ]}}
                                 >
                                     <Polyline path={polylinePath} options={{ strokeColor: '#f43f5e', strokeOpacity: 0.8, strokeWeight: 5 }} />
                                     {stops.map(stop => (
                                         <Marker key={stop._id} position={{ lat: stop.latitude, lng: stop.longitude }} label={{ text: `${stop.order}`, color: 'white' }} />
                                     ))}
                                     {location && (
                                         <Marker position={center} icon={{ url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png", scaledSize: new window.google.maps.Size(40, 40) }} />
                                     )}
                                 </GoogleMap>
                             ) : (
                                 <div className="absolute inset-0 flex items-center justify-center animate-pulse text-indigo-400 font-extrabold tracking-widest uppercase">Loading Core Engine...</div>
                             )}

                             <div className="absolute top-8 left-8 z-[100] p-6 glass border border-white/10 rounded-3xl shadow-2xl backdrop-blur-xl bg-slate-950/80">
                                  <div className="flex items-center gap-4 text-emerald-400 mb-4">
                                       <Navigation size={24} fill="currentColor" />
                                       <span className="font-extrabold uppercase tracking-widest">Global Navigation ({gpsSource.toUpperCase()})</span>
                                  </div>
                                  <div className="space-y-4 font-mono text-xs font-black">
                                       <div className="flex justify-between gap-10">
                                            <span className="text-slate-500">LAT:</span>
                                            <span className="text-slate-100 tabular-nums">{location?.latitude?.toFixed(6) || 'STANDBY'}</span>
                                       </div>
                                       <div className="flex justify-between gap-10">
                                            <span className="text-slate-500">LNG:</span>
                                            <span className="text-slate-100 tabular-nums">{location?.longitude?.toFixed(6) || 'STANDBY'}</span>
                                       </div>
                                  </div>
                             </div>
                        </div>

                        {/* Mission Control Panel */}
                        <div className="glass p-12 rounded-[50px] flex items-center justify-center gap-20 border border-white/5 relative overflow-hidden group">
                             <div className="absolute inset-0 bg-indigo-600/5 rotate-12 -translate-y-1/2 scale-150 blur-[100px] transition-all group-hover:bg-indigo-600/10"></div>
                             {!isTripActive ? (
                                 <button onClick={toggleTrip} className="flex flex-col items-center gap-8 group/btn relative z-10">
                                      <div className="w-40 h-40 rounded-full bg-emerald-600 hover:bg-emerald-500 border-[12px] border-emerald-950 flex items-center justify-center shadow-[0_30px_100px_rgba(16,185,129,0.3)] transition-all hover:scale-110 active:scale-95">
                                           <Play fill="white" size={48} className="text-white ml-2" />
                                      </div>
                                      <p className="text-2xl font-black uppercase tracking-[.4em] text-emerald-500">INITIATE MISSION</p>
                                 </button>
                             ) : (
                                 <button onClick={toggleTrip} className="flex flex-col items-center gap-8 group/btn relative z-10">
                                      <div className="w-40 h-40 rounded-full bg-red-600 hover:bg-red-500 border-[12px] border-red-950 flex items-center justify-center shadow-[0_30px_100px_rgba(239,68,68,0.3)] transition-all hover:scale-110 active:scale-95">
                                           <Square fill="white" size={48} className="text-white" />
                                      </div>
                                      <p className="text-2xl font-black uppercase tracking-[.4em] text-red-500">CEASE TRACKING</p>
                                 </button>
                             )}
                        </div>
                    </div>

                    <div className="xl:col-span-4 flex flex-col gap-10">
                         <div className="glass p-10 rounded-[50px] flex-1 border border-white/5 shadow-2xl flex flex-col">
                              <div className="flex justify-between items-center mb-10">
                                   <h4 className="text-2xl font-black tracking-tighter flex items-center gap-4">
                                       <Clock className="text-indigo-400" /> TIMELINE
                                   </h4>
                                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stops.length} STOPS TOTAL</span>
                              </div>
                              <div className="space-y-10 relative overflow-y-auto flex-1 pr-6 pb-6 custom-scrollbar">
                                   <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-slate-800 rounded-full"></div>
                                   {stops.length > 0 ? [...stops].sort((a,b)=>a.order-b.order).map((stop) => (
                                       <div key={stop._id} className="flex gap-10 relative group">
                                            <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center border-4 shadow-xl z-10 transition-all bg-slate-900 border-slate-800 group-hover:border-indigo-500/50">
                                                 <div className="text-xs font-bold text-slate-500 italic">{stop.order}</div>
                                            </div>
                                            <div className="pt-1">
                                                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">ETA: Active Update</p>
                                                 <p className="text-xl font-extrabold text-slate-100 group-hover:text-indigo-400 transition-colors">{stop.name}</p>
                                            </div>
                                       </div>
                                   )) : (
                                       <div className="text-center py-20 bg-slate-900/30 rounded-[40px] border-dashed border-slate-800 flex items-center justify-center">
                                            <p className="text-slate-500 font-black italic lowercase tracking-widest opacity-50">No Route</p>
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
