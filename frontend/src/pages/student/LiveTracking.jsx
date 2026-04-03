import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
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

    const center = React.useMemo(() => ({
        lat: busLocation[0],
        lng: busLocation[1]
    }), [busLocation[0], busLocation[1]]);

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] animate-fade-in relative w-full pl-2">
            <header className="mb-8 shrink-0 flex justify-between items-end">
                <div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 tracking-tighter">Live Journey Tracking</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                         <Navigation size={14} className="text-indigo-400" /> Powered by Google Maps API Engine
                    </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300">
                    Source: <span className="text-indigo-400">{gpsSource || 'Pending'}</span>
                </div>
            </header>

            <div className="flex-1 glass rounded-[40px] overflow-hidden border border-slate-800 shadow-2xl relative">
                {assignedBus && isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={15}
                        options={{ disableDefaultUI: true, styles: [
                            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
                            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
                            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
                            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
                            { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] }
                        ]}}
                    >
                        <Polyline path={polylinePath} options={{ strokeColor: '#f43f5e', strokeOpacity: 0.8, strokeWeight: 5 }} />
                        
                        {routeData?.stops?.map(stop => (
                            <Marker 
                                key={stop._id} 
                                position={{ lat: stop.latitude, lng: stop.longitude }} 
                                label={{ text: `${stop.order}`, color: 'white' }}
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
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 flex-col gap-4">
                         <Bus size={64} className="text-slate-800"/>
                         <p className="text-slate-500 font-extrabold uppercase tracking-widest text-lg">No Bus Assigned Yet</p>
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10 flex-col gap-4">
                         <p className="text-slate-500 font-extrabold uppercase tracking-widest text-lg animate-pulse">Loading Map Engine...</p>
                    </div>
                )}

                {assignedBus && (
                    <>
                        <div className="absolute top-6 left-6 z-[100] glass px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-4 shadow-2xl backdrop-blur-xl bg-slate-950/60 pointer-events-none">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                            <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Fleet</p>
                                <span className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-2">Bus <span className="text-orange-400">{assignedBus.busNumber}</span></span>
                            </div>
                        </div>

                        <div className="absolute top-6 right-6 z-[100] glass px-6 py-4 rounded-3xl border border-emerald-500/20 flex items-center gap-4 shadow-2xl backdrop-blur-xl bg-slate-950/80 pointer-events-none">
                            <Clock className="text-emerald-400 animate-pulse" size={24} />
                            <div>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Calculated ETA</p>
                                <span className="text-xl font-black tracking-tight text-emerald-400 tabular-nums">{localEta}</span>
                            </div>
                        </div>
                    </>
                )}

                {assignedBus && routeData && (
                    <div className="absolute bottom-6 left-6 right-6 z-[100] glass p-4 rounded-3xl border border-indigo-500/30 shadow-2xl backdrop-blur-xl bg-slate-950/90 w-full max-w-lg mx-auto">
                        <label className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Bell size={14}/> Geo-Fenced Proximity Alert</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-sm font-bold shadow-inner"
                            value={selectedStop}
                            onChange={(e) => setSelectedStop(e.target.value)}
                        >
                            <option value="">Select a Stop to track precise ETA & trigger alerts...</option>
                            {routeData.stops?.sort((a,b)=>a.order-b.order).map(stop => (
                                 <option key={stop._id} value={stop._id}>{stop.name} (Stop #{stop.order})</option>
                            ))}
                        </select>
                        <p className="text-[10px] uppercase font-bold text-slate-500 mt-3 text-center tracking-widest">System will alert when bus is &le; 300m away</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiveTracking;
