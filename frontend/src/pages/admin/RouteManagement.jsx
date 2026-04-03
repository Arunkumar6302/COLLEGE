import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route as MapRoute, Plus, X, MapPin, Navigation, Trash2, ArrowRight } from 'lucide-react';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [isAddingRoute, setIsAddingRoute] = useState(false);
    const [isAddingStop, setIsAddingStop] = useState(null); // Will hold route ID
    const [newRoute, setNewRoute] = useState({ name: '', startName: '', startLat: '', startLng: '', endName: '', endLat: '', endLng: '' });
    const [newStop, setNewStop] = useState({ name: '', latitude: '', longitude: '', order: '' });

    useEffect(() => { fetchRoutes(); }, []);

    const fetchRoutes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route`, { headers: { 'x-auth-token': token } });
            setRoutes(res.data);
        } catch (err) { console.error(err); }
    };

    const handleAddRoute = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: newRoute.name,
                startLocation: { name: newRoute.startName, latitude: Number(newRoute.startLat), longitude: Number(newRoute.startLng) },
                endLocation: { name: newRoute.endName, latitude: Number(newRoute.endLat), longitude: Number(newRoute.endLng) }
            };
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route`, payload, { headers: { 'x-auth-token': token } });
            setIsAddingRoute(false);
            setNewRoute({ name: '', startName: '', startLat: '', startLng: '', endName: '', endLat: '', endLng: '' });
            fetchRoutes();
        } catch (err) { console.error(err); alert('Failed to create route'); }
    };

    const handleAddStop = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: newStop.name,
                latitude: Number(newStop.latitude),
                longitude: Number(newStop.longitude),
                order: Number(newStop.order)
            };
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route/${isAddingStop}/stops`, payload, { headers: { 'x-auth-token': token } });
            setIsAddingStop(null);
            setNewStop({ name: '', latitude: '', longitude: '', order: '' });
            fetchRoutes();
        } catch (err) { console.error(err); alert('Failed to add stop'); }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center bg-indigo-600/5 p-8 rounded-3xl border border-indigo-500/10 backdrop-blur-sm">
                <div>
                   <h3 className="text-3xl font-extrabold flex items-center gap-4">
                        <MapRoute className="text-indigo-400" size={36} /> Logistics & Routes
                   </h3>
                   <p className="text-slate-400 mt-2 font-medium italic">Define your college transit lines and stops</p>
                </div>
                <button onClick={() => setIsAddingRoute(true)} className="btn-primary flex items-center gap-3 px-8 py-4 shadow-xl">
                   <Plus size={22} strokeWidth={3} /> Create Route
                </button>
            </div>

            {isAddingRoute && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="glass w-full max-w-xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setIsAddingRoute(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text">Configure New Route</h4>
                        <form onSubmit={handleAddRoute} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Route Identifier</label>
                                <input type="text" className="w-full bg-white border border-slate-300 rounded-2xl py-4 px-5 font-bold text-lg text-black placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. South Campus Line" value={newRoute.name} onChange={(e) => setNewRoute({...newRoute, name: e.target.value})} required />
                            </div>
                            
                            <div className="pt-4 border-t border-slate-800">
                                <h5 className="text-sm font-bold text-indigo-400 mb-4">Start Location</h5>
                                <div className="mb-3">
                                    <input type="text" className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="Start Point Name (e.g. Main Gate)" value={newRoute.startName} onChange={(e) => setNewRoute({...newRoute, startName: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" step="any" className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="Latitude" value={newRoute.startLat} onChange={(e) => setNewRoute({...newRoute, startLat: e.target.value})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="Longitude" value={newRoute.startLng} onChange={(e) => setNewRoute({...newRoute, startLng: e.target.value})} required />
                                </div>
                            </div>
                            <div className="border-t border-slate-800 pt-4">
                                <h5 className="text-sm font-bold text-pink-400 mb-4">End Location</h5>
                                <div className="mb-3">
                                    <input type="text" className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="End Point Name (e.g. Science Block)" value={newRoute.endName} onChange={(e) => setNewRoute({...newRoute, endName: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" step="any" className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="Latitude" value={newRoute.endLat} onChange={(e) => setNewRoute({...newRoute, endLat: e.target.value})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="Longitude" value={newRoute.endLng} onChange={(e) => setNewRoute({...newRoute, endLng: e.target.value})} required />
                                </div>
                            </div>

                            <button type="submit" className="w-full btn-primary py-5 text-xl font-bold mt-8 shadow-2xl">Confirm Configuration</button>
                        </form>
                    </div>
                </div>
            )}

            {isAddingStop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in relative">
                    <div className="glass w-full max-w-xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setIsAddingStop(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text">Add New Point/Stop</h4>
                        <form onSubmit={handleAddStop} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Stop Name</label>
                                <input type="text" className="w-full bg-white border border-slate-300 rounded-2xl py-4 px-5 font-bold text-lg text-black placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500" placeholder="e.g. City Center Mall" value={newStop.name} onChange={(e) => setNewStop({...newStop, name: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Latitude</label>
                                    <input type="number" step="any" className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold" value={newStop.latitude} onChange={(e) => setNewStop({...newStop, latitude: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Longitude</label>
                                    <input type="number" step="any" className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold" value={newStop.longitude} onChange={(e) => setNewStop({...newStop, longitude: e.target.value})} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Sequence Order Number</label>
                                <input type="number" className="w-full bg-white border border-slate-300 rounded-xl py-3 px-4 text-black font-bold placeholder:text-slate-400" placeholder="e.g. 1 (first stop)" value={newStop.order} onChange={(e) => setNewStop({...newStop, order: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full btn-secondary py-5 text-xl font-bold mt-8 shadow-2xl tracking-widest border-2 border-indigo-500">Inject Stop</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {routes.map((route) => (
                    <div key={route._id} className="glass p-10 rounded-3xl transition-all border border-slate-800 hover:border-indigo-500/50 hover:scale-[1.02] shadow-2xl relative overflow-hidden group">
                         <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full"></div>
                         <div className="flex justify-between items-start mb-10">
                              <div className="text-xs uppercase font-extrabold tracking-[0.2em] bg-slate-800 text-indigo-400 px-4 py-1.5 rounded-full">{route.stops?.length || 0} Stops Configured</div>
                              <button className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-xl"><Trash2 size={20}/></button>
                         </div>
                         <h4 className="text-2xl font-extrabold text-slate-50 tracking-tighter mb-6 group-hover:text-indigo-400 transition-colors">{route.name}</h4>
                         
                         {/* Location coordinates summary */}
                         <div className="space-y-4 mb-8">
                              <div className="flex items-center gap-4 text-slate-400">
                                   <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shrink-0"></div>
                                   <div className="text-xs font-mono">
                                       <span className="block text-slate-500 font-bold mb-1">STR: {route.startLocation?.name || 'N/A'}</span>
                                       {route.startLocation?.latitude}, {route.startLocation?.longitude}
                                   </div>
                              </div>
                               <div className="flex items-center gap-4 text-slate-400">
                                   <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce shrink-0"></div>
                                   <div className="text-xs font-mono">
                                        <span className="block text-slate-500 font-bold mb-1">END: {route.endLocation?.name || 'N/A'}</span>
                                       {route.endLocation?.latitude}, {route.endLocation?.longitude}
                                   </div>
                              </div>
                         </div>

                         {/* Listed mapped stops order */}
                         {route.stops && route.stops.length > 0 && (
                             <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4 max-h-[150px] overflow-y-auto">
                                 {route.stops.sort((a,b)=>a.order-b.order).map(stop => (
                                     <div key={stop._id} className="flex justify-between items-center mb-2 last:mb-0">
                                         <div className="flex flex-col">
                                             <span className="text-slate-300 truncate w-40 text-sm font-bold">{stop.name}</span>
                                             <span className="text-slate-500 text-[10px] tabular-nums tracking-tighter">{stop.latitude}, {stop.longitude}</span>
                                         </div>
                                         <span className="bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-xs font-bold">Seq: {stop.order}</span>
                                     </div>
                                 ))}
                             </div>
                         )}

                         <button onClick={() => setIsAddingStop(route._id)} className="w-full py-4 bg-slate-800/20 border border-slate-700 hover:bg-slate-800 rounded-2xl text-xs font-extrabold transition-all duration-300 flex items-center justify-center gap-6 group-hover:shadow-2xl hover:text-white">
                              Add Waypoint Sequence <Plus size={16} />
                         </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RouteManagement;
