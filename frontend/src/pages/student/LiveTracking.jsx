import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, Polyline, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';
import { Bus, MapPin, Navigation, Clock, Bell } from 'lucide-react';

// Distance Calculator using Haversine formula
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
};

const mapContainerStyle = { width: '100%', height: '100%' };

const LiveTracking = ({ profile, busLocation, eta, gpsSource }) => {
    const assignedBus = profile?.assignedBus;
    const [selectedStop, setSelectedStop] = useState('');
    const [routeData, setRouteData] = useState(null);
    const [localEta, setLocalEta] = useState(eta || 'Calculating...');
    const [alertTriggered, setAlertTriggered] = useState(false);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [directionsRequested, setDirectionsRequested] = useState(false);
    const [lastRequestPos, setLastRequestPos] = useState(null);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    useEffect(() => {
        if (assignedBus?._id) {
            axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/bus/${assignedBus._id}/route`)
                .then(res => setRouteData(res.data))
                .catch(err => console.error('Route unused or not available:', err));
        }
    }, [assignedBus]);

    // Geo-fencing and ETA logic
    useEffect(() => {
        if (selectedStop && routeData && busLocation) {
            const stop = routeData.stops.find(s => s._id === selectedStop);
            if (stop) {
                const distKm = getDistance(busLocation[0], busLocation[1], stop.latitude, stop.longitude);
                
                // Assuming average speed of 30 km/h in city
                const timeHours = distKm / 30;
                const timeMins = Math.round(timeHours * 60);
                setLocalEta(timeMins > 0 ? `${timeMins} min(s)` : 'Arriving...');

                // Geofence alert: Trigger if within 300 meters
                if (distKm <= 0.3 && !alertTriggered) {
                    alert(`PROXIMITY ALERT: The bus is arriving at ${stop.name} very soon!`);
                    // Use a browser notification if granted
                    if (Notification && Notification.permission === "granted") {
                        new Notification("Bus Proximity Alert", { body: `Bus is arriving at ${stop.name}!` });
                    }
                    setAlertTriggered(true);
                } else if (distKm > 0.3) {
                    // reset alert if goes far away
                    setAlertTriggered(false);
                }
            }
        } else {
            setLocalEta(eta || 'Select a stop to view ETA');
        }
    }, [busLocation, selectedStop, routeData]);

    const polylinePath = useMemo(() => {
        if (!routeData) return [];
        const path = [];
        if (routeData.startLocation) path.push({ lat: routeData.startLocation.latitude, lng: routeData.startLocation.longitude });
        if (routeData.stops && routeData.stops.length > 0) {
            const sortedStops = [...routeData.stops].sort((a,b) => a.order - b.order);
            sortedStops.forEach(st => path.push({ lat: st.latitude, lng: st.longitude }));
        }
        if (routeData.endLocation) path.push({ lat: routeData.endLocation.latitude, lng: routeData.endLocation.longitude });
        return path;
    }, [routeData]);



    const routeConnectionPath = useMemo(() => {
        if (!busLocation || !busLocation[0] || !busLocation[1] || polylinePath.length === 0) return [];
        let closestPoint = polylinePath[0];
        let minDistance = Infinity;
        polylinePath.forEach(point => {
            if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') return;
            const dLat = point.lat - busLocation[0];
            const dLng = point.lng - busLocation[1];
            const dist = dLat * dLat + dLng * dLng;
            if (dist < minDistance) {
                minDistance = dist;
                closestPoint = point;
            }
        });
        if (!closestPoint) return [];
        return [{ lat: Number(busLocation[0]), lng: Number(busLocation[1]) }, closestPoint];
    }, [busLocation, polylinePath]);



    const directionsCallback = useCallback((response, status) => {
        if (status === 'OK' && response !== null) {
            setDirectionsResponse(response);
            setLastRequestPos(busLocation);
        } else {
            console.error('Directions request failed due to ' + status);
        }
        setDirectionsRequested(true);
    }, [busLocation]);

    const directionsOptions = useMemo(() => {
        if (!routeData?.endLocation || !busLocation || !busLocation[0]) return null;
        
        // Dynamic Pruning: Find the next logical stop
        // We find the stop with the smallest 'order' that the bus hasn't passed yet.
        // For simplicity, we find the stop closest to the bus and treat it as the 'current' or 'next' target.
        let closestStopOrder = 0;
        let minDistance = Infinity;
        
        if (routeData.stops && routeData.stops.length > 0) {
            routeData.stops.forEach(s => {
                const dist = getDistance(busLocation[0], busLocation[1], s.latitude, s.longitude);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestStopOrder = s.order;
                }
            });
        }

        const waypts = routeData.stops
            ?.filter(stop => stop.order >= closestStopOrder)
            .sort((a,b) => a.order - b.order)
            .map(stop => ({
                location: { lat: stop.latitude, lng: stop.longitude },
                stopover: true
            })) || [];

        // Throttling: Only return new options if bus moved significantly (> 50 meters)
        if (lastRequestPos) {
            const moveDist = getDistance(busLocation[0], busLocation[1], lastRequestPos[0], lastRequestPos[1]);
            if (moveDist < 0.05 && directionsResponse) return null; 
        }

        return {
            origin: { lat: busLocation[0], lng: busLocation[1] },
            destination: { lat: routeData.endLocation.latitude, lng: routeData.endLocation.longitude },
            waypoints: waypts,
            travelMode: 'DRIVING'
        };
    }, [routeData, busLocation, lastRequestPos, directionsResponse]);

    const center = React.useMemo(() => ({
        lat: busLocation[0],
        lng: busLocation[1]
    }), [busLocation[0], busLocation[1]]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in relative w-full pl-2">
            <header className="flex justify-between items-center bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/5 blur-[100px] pointer-events-none"></div>
                <div className="flex items-center gap-10">
                     <div className="w-24 h-24 bg-orange-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_50px_rgba(249,115,22,0.3)] border-2 border-white/20">
                          <Bus size={48} className="text-white" strokeWidth={1.5} />
                     </div>
                     <div>
                          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Live Tracking</h2>
                          <div className="flex items-center gap-4">
                               <span className="text-orange-600 font-black uppercase tracking-[0.2em] text-[10px] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">Asset: {assignedBus?.busNumber || 'PENDING'}</span>
                               <span className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center gap-2">
                                    <MapPin size={14} className="text-orange-600" /> Signal: {gpsSource || 'INITIALIZING'}
                               </span>
                          </div>
                     </div>
                </div>
            </header>

            <div className="flex-1 bg-white rounded-[40px] overflow-hidden border border-slate-200 shadow-sm relative">
                {assignedBus && isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={14}
                        options={{ disableDefaultUI: true }}
                    >
                        {directionsOptions && (
                            <DirectionsService
                                options={directionsOptions}
                                callback={directionsCallback}
                            />
                        )}

                        {directionsResponse && (
                            <DirectionsRenderer
                                options={{
                                    directions: directionsResponse,
                                    suppressMarkers: true,
                                    polylineOptions: {
                                        strokeColor: '#ea580c', // UniTrack Orange
                                        strokeOpacity: 0.9,
                                        strokeWeight: 6,
                                    }
                                }}
                            />
                        )}
                        
                        {/* Dynamic Connection rendered via DirectionsRenderer origin */}
                        
                        {routeData?.stops?.map(stop => (
                            <Marker 
                                key={stop._id} 
                                position={{ lat: stop.latitude, lng: stop.longitude }} 
                                label={{ text: `${stop.order}`, color: 'white', fontWeight: 'bold' }}
                            />
                        ))}

                        <Marker 
                            position={center} 
                            icon={{
                                url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
                                scaledSize: new window.google.maps.Size(40, 40)
                            }}
                        />
                    </GoogleMap>
                ) : !assignedBus ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 flex-col gap-6">
                         <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                             <Bus size={48} className="text-slate-300"/>
                         </div>
                         <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs italic">Asset linkage required from directory</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10 flex-col gap-4">
                         <p className="text-orange-600 font-black uppercase tracking-widest text-xs animate-pulse">Initializing Geospatial Engine...</p>
                    </div>
                )}

                {assignedBus && (
                    <>
                        <div className="absolute top-8 left-8 z-[100] p-6 bg-white/90 border border-slate-200 rounded-3xl shadow-2xl backdrop-blur-xl pointer-events-none">
                            <div className="flex items-center gap-4 text-orange-600 mb-4">
                                <Navigation size={24} fill="currentColor" />
                                <span className="font-extrabold uppercase tracking-widest leading-none">Global Navigation</span>
                            </div>
                            <div className="space-y-4 font-mono text-xs font-black">
                                <div className="flex justify-between gap-10">
                                    <span className="text-slate-400">LATITUDE</span>
                                    <span className="text-slate-900 tabular-nums">{busLocation[0]?.toFixed(6) || '---.------'}</span>
                                </div>
                                <div className="flex justify-between gap-10">
                                    <span className="text-slate-400">LONGITUDE</span>
                                    <span className="text-slate-900 tabular-nums">{busLocation[1]?.toFixed(6) || '---.------'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-8 right-8 z-[100] bg-white px-6 py-4 rounded-3xl border border-orange-100 flex items-center gap-4 shadow-xl backdrop-blur-xl pointer-events-none">
                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
                                <Clock className="text-orange-600 animate-pulse" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Arrival Window</p>
                                <span className="text-2xl font-black tracking-tighter text-slate-900 tabular-nums">{localEta}</span>
                            </div>
                        </div>
                    </>
                )}

                {assignedBus && routeData && (
                    <div className="absolute bottom-8 left-8 right-8 z-[100] bg-white p-6 rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-lg mx-auto flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 leading-none"><Bell size={14} className="text-orange-600"/> Geo-Spatial Alert Target</label>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none bg-orange-50 px-2 py-1 rounded border border-orange-100">Geofence Active</span>
                        </div>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 text-sm font-black shadow-inner appearance-none cursor-pointer"
                            value={selectedStop}
                            onChange={(e) => setSelectedStop(e.target.value)}
                        >
                            <option value="">Select waypoint for proximity tracking...</option>
                            {routeData.stops?.sort((a,b)=>a.order-b.order).map(stop => (
                                 <option key={stop._id} value={stop._id}>{stop.name} (Terminal #{stop.order})</option>
                            ))}
                        </select>
                        <p className="text-[9px] uppercase font-black text-slate-400 text-center tracking-[0.2em] leading-none">System triggers notification within &le; 300m range</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTracking;
