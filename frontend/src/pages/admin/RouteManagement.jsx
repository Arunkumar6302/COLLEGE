import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route as MapRoute, Plus, X, MapPin, Navigation, Trash2, ArrowRight, Activity, Search } from 'lucide-react';

const RouteManagement = () => {
    const [routes, setRoutes] = useState([]);
    const [isAddingRoute, setIsAddingRoute] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [isAddingStop, setIsAddingStop] = useState(null); 
    const [newRoute, setNewRoute] = useState({ name: '', startName: '', startLat: '', startLng: '', endName: '', endLat: '', endLng: '' });
    const [newStop, setNewStop] = useState({ name: '', latitude: '', longitude: '', order: '' });
    const [searchTerm, setSearchTerm] = useState('');

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

    const handleEditRoute = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                name: editingRoute.name,
                startLocation: editingRoute.startLocation,
                endLocation: editingRoute.endLocation
            };
            await axios.put(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route/${editingRoute._id}`, payload, { headers: { 'x-auth-token': token } });
            setEditingRoute(null);
            fetchRoutes();
        } catch (err) { 
            console.error(err); 
            const errorMsg = err.response?.data?.msg || 'Failed to update route. Database validation error.';
            alert(errorMsg); 
        }
    };

    const handleDeleteRoute = async (id) => {
        if (!window.confirm("FATAL ACTION: Deleting this route will unassign it from all active buses and purge all associated nodes. Proceed?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route/${id}`, { headers: { 'x-auth-token': token } });
            fetchRoutes();
        } catch (err) { 
            console.error(err); 
            const errorMsg = err.response?.data?.msg || 'Failed to decommission route. Database sync error.';
            alert(errorMsg); 
        }
    };

    const filteredRoutes = routes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                <div>
                   <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <MapRoute className="text-orange-600" size={28} /> Transit Logistics
                   </h3>
                   <p className="text-slate-500 text-[11px] font-black mt-1 uppercase tracking-widest leading-none">Map infrastructure & route optimization</p>
                </div>
                <button onClick={() => setIsAddingRoute(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-black py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95">
                   <Plus size={18} /> Design New Route
                </button>
            </div>

            {isAddingRoute && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsAddingRoute(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Configure Transit Line</h4>
                        <form onSubmit={handleAddRoute} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block font-sans">Route Moniker</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 font-black outline-none focus:border-orange-500 text-slate-800" placeholder="e.g. North Expressway 01" value={newRoute.name} onChange={(e) => setNewRoute({...newRoute, name: e.target.value})} required />
                            </div>
                            
                            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                                <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Origin Terminal</h5>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 mb-3 text-sm font-bold text-slate-800" placeholder="Location Name" value={newRoute.startName} onChange={(e) => setNewRoute({...newRoute, startName: e.target.value})} required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Latitude" value={newRoute.startLat} onChange={(e) => setNewRoute({...newRoute, startLat: e.target.value})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Longitude" value={newRoute.startLng} onChange={(e) => setNewRoute({...newRoute, startLng: e.target.value})} required />
                                </div>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                                <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Destination Terminal</h5>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 mb-3 text-sm font-bold text-slate-800" placeholder="Location Name" value={newRoute.endName} onChange={(e) => setNewRoute({...newRoute, endName: e.target.value})} required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Latitude" value={newRoute.endLat} onChange={(e) => setNewRoute({...newRoute, endLat: e.target.value})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Longitude" value={newRoute.endLng} onChange={(e) => setNewRoute({...newRoute, endLng: e.target.value})} required />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 shadow-lg shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-widest text-sm">Deploy Transit Matrix</button>
                        </form>
                    </div>
                </div>
            )}

            {isAddingStop && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl">
                        <button onClick={() => setIsAddingStop(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Inject Waypoint</h4>
                        <form onSubmit={handleAddStop} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Waypoint Descriptor</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-black outline-none focus:border-orange-500 text-slate-800" placeholder="e.g. City Junction" value={newStop.name} onChange={(e) => setNewStop({...newStop, name: e.target.value})} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">LAT Coordinate</label>
                                    <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-mono text-xs" value={newStop.latitude} onChange={(e) => setNewStop({...newStop, latitude: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">LNG Coordinate</label>
                                    <input type="number" step="any" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-mono text-xs" value={newStop.longitude} onChange={(e) => setNewStop({...newStop, longitude: e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Indexing Order</label>
                                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-black" placeholder="Sequence Index (e.g. 1)" value={newStop.order} onChange={(e) => setNewStop({...newStop, order: e.target.value})} required />
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Append to Chain</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center text-slate-900 font-bold">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Deployment Matrix</h4>
                    <div className="relative">
                        <input type="text" placeholder="Route filter..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-64 focus:border-orange-500 font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route Profile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Origin</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Destination</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Node Count</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRoutes.length > 0 ? filteredRoutes.map((route) => (
                                <tr key={route._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4">
                                        <p className="font-black text-slate-900 text-sm leading-none mb-1">{route.name}</p>
                                        <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest italic">{route._id.slice(-6)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.4)]"></div>
                                            <span className="text-sm font-bold text-slate-800">{route.startLocation?.name || 'Undefined'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                            <span className="text-sm font-bold text-slate-800">{route.endLocation?.name || 'Undefined'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100 transition-colors">
                                            {route.stops?.length || 0} Nodes
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 transition-all transform">
                                            <button onClick={() => setIsAddingStop(route._id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl whitespace-nowrap text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 border border-orange-100 shadow-sm" title="Append Node"><Plus size={14}/> Node</button>
                                            <button onClick={() => setEditingRoute(route)} className="p-2.5 text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-100 shadow-sm" title="Configure Topology"><Search size={18}/></button>
                                            <button onClick={() => handleDeleteRoute(route._id)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 shadow-sm" title="Purge Record"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Activity className="text-slate-200 mx-auto mb-3" size={44} />
                                        <p className="text-slate-400 font-bold italic">No active transit nodes detected in memory.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {editingRoute && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-6 text-slate-950">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setEditingRoute(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Reconfigure Transit Line</h4>
                        <form onSubmit={handleEditRoute} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block font-sans">Route Moniker</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 font-black outline-none focus:border-orange-500 text-slate-800" value={editingRoute.name} onChange={(e) => setEditingRoute({...editingRoute, name: e.target.value})} required />
                            </div>
                            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                                <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Origin Terminal</h5>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 mb-3 text-sm font-bold text-slate-800" value={editingRoute.startLocation?.name} onChange={(e) => setEditingRoute({...editingRoute, startLocation: { ...editingRoute.startLocation, name: e.target.value }})} required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Latitude" value={editingRoute.startLocation?.latitude} onChange={(e) => setEditingRoute({...editingRoute, startLocation: { ...editingRoute.startLocation, latitude: Number(e.target.value) }})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Longitude" value={editingRoute.startLocation?.longitude} onChange={(e) => setEditingRoute({...editingRoute, startLocation: { ...editingRoute.startLocation, longitude: Number(e.target.value) }})} required />
                                </div>
                            </div>
                            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50">
                                <h5 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={12}/> Destination Terminal</h5>
                                <input type="text" className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 mb-3 text-sm font-bold text-slate-800" value={editingRoute.endLocation?.name} onChange={(e) => setEditingRoute({...editingRoute, endLocation: { ...editingRoute.endLocation, name: e.target.value }})} required />
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Latitude" value={editingRoute.endLocation?.latitude} onChange={(e) => setEditingRoute({...editingRoute, endLocation: { ...editingRoute.endLocation, latitude: Number(e.target.value) }})} required />
                                    <input type="number" step="any" className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-xs font-mono" placeholder="Longitude" value={editingRoute.endLocation?.longitude} onChange={(e) => setEditingRoute({...editingRoute, endLocation: { ...editingRoute.endLocation, longitude: Number(e.target.value) }})} required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 shadow-lg shadow-orange-600/20 active:scale-95 transition-all text-sm tracking-widest uppercase">Sync Configuration</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteManagement;
