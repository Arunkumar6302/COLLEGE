import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus as BusIcon, Plus, UserPlus, Settings, Trash2, Edit3, X, Save, Users, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import LiveTracking from '../student/LiveTracking';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [students, setStudents] = useState([]);
    const [facultyProfiles, setFacultyProfiles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [expandedBusId, setExpandedBusId] = useState(null);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [trackingBus, setTrackingBus] = useState(null);

    const [newBus, setNewBus] = useState({ 
        busNumber: '', driverName: '', driverUsername: '', driverPassword: '', driverContact: '' 
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [busRes, studentRes, facultyRes, routeRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/buses`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/users/student`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/users/faculty`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/route`, { headers: { 'x-auth-token': token } })
            ]);
            setBuses(busRes.data);
            setStudents(studentRes.data);
            setFacultyProfiles(facultyRes.data);
            setRoutes(routeRes.data);
        } catch (err) { console.error(err); }
    };

    const [errorMsg, setErrorMsg] = useState('');

    const handleAddBus = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/buses`, newBus, {
                headers: { 'x-auth-token': token }
            });
            setIsAdding(false);
            setNewBus({ busNumber: '', driverName: '', driverUsername: '', driverPassword: '', driverContact: '' });
            fetchData();
        } catch (err) { 
            console.error(err); 
            setErrorMsg(err.response?.data?.msg || 'An error occurred during registration. Please check your connection.');
        }
    };

    const handleEditBusSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/buses/${editingBus._id}`, {
                busNumber: editingBus.busNumber,
                driverName: editingBus.driverId?.name,
                driverContact: editingBus.driverId?.contactNumber,
                routeId: editingBus.route
            }, { headers: { 'x-auth-token': token } });
            setEditingBus(null);
            fetchData();
        } catch (err) { 
            console.error(err); 
            alert('Failed to update details');
        }
    };

    const handleDeleteBus = async (id) => {
        if (!window.confirm('Are you certain? This will PERMANENTLY delete the bus and the associated driver from the database.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/buses/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to delete bus'); }
    };

    const handleAssignStudent = async (busId) => {
        if (!selectedStudentId) return alert('Please select a student first.');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/assign-student`, { studentId: selectedStudentId, busId }, { headers: { 'x-auth-token': token } });
            setSelectedStudentId('');
            fetchData();
        } catch (err) { console.error(err); alert('Failed to assign student'); }
    };

    const handleRemoveStudent = async (studentId, busId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/remove-student`, { studentId, busId }, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to remove student'); }
    };

    const handleAssignFaculty = async (busId) => {
        if (!selectedFacultyId) return alert('Please select a faculty member first.');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/assign-faculty`, { facultyId: selectedFacultyId, busId }, { headers: { 'x-auth-token': token } });
            setSelectedFacultyId('');
            fetchData();
        } catch (err) { console.error(err); alert('Failed to assign faculty'); }
    };

    const handleRemoveFaculty = async (facultyId, busId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/remove-faculty`, { facultyId, busId }, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to remove faculty'); }
    };

    const handleAssignRoute = async (busId) => {
        if (!selectedRouteId) return alert('Please select a route first.');
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/assign-route`, { routeId: selectedRouteId, busId }, { headers: { 'x-auth-token': token } });
            setSelectedRouteId('');
            fetchData();
        } catch (err) { console.error(err); alert('Failed to assign route'); }
    };

    const openEditModal = (bus) => {
        setEditingBus({
            ...bus,
            driverId: {
                ...bus.driverId,
                name: bus.driverId?.name || '',
                contactNumber: bus.driverId?.contactNumber || ''
            },
            route: bus.route?._id || ''
        });
    };

    const unassignedStudents = students.filter(s => !s.assignedBus);
    const unassignedFaculty = facultyProfiles.filter(f => !f.assignedBus);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in">
                <div>
                    <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <BusIcon className="text-orange-600" size={28} /> Fleet Operations
                    </h3>
                    <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Global Resource & Transport Management</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-black py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95">
                    <Plus size={18} /> Deploy New Vehicle
                </button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-white w-full max-w-2xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl overflow-y-auto max-h-[90vh]">
                        <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Configure Fleet Asset</h4>
                        {errorMsg && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-xs font-bold border border-rose-100">{errorMsg}</div>}
                        <form onSubmit={handleAddBus} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Registration Label (Bus #)</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:border-orange-500 font-black text-slate-800" placeholder="e.g. AP-01-TX-2026"
                                        value={newBus.busNumber} onChange={(e) => setNewBus({...newBus, busNumber: e.target.value})} required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Operator Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold" placeholder="Full Name"
                                        value={newBus.driverName} onChange={(e) => setNewBus({...newBus, driverName: e.target.value})} required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Contact #</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold" placeholder="Phone"
                                        value={newBus.driverContact} onChange={(e) => setNewBus({...newBus, driverContact: e.target.value})} required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">System Identifier (User)</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500" placeholder="username"
                                        value={newBus.driverUsername} onChange={(e) => setNewBus({...newBus, driverUsername: e.target.value})} required />
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Security Token (Pass)</label>
                                    <input type="password" name="driverPassword" autoComplete="new-password"  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500" placeholder="••••••••"
                                        value={newBus.driverPassword} onChange={(e) => setNewBus({...newBus, driverPassword: e.target.value})} required />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98]">Authorize Deployment</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Asset Audit</h4>
                    <div className="relative">
                        <input type="text" placeholder="Filter vehicles..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-64 focus:border-orange-500 font-bold text-slate-700" />
                        <Settings className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Serial #</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Operator</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Route</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Load Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {buses.length > 0 ? buses.map((bus) => (
                                <tr key={bus._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4 font-black text-slate-900 tracking-tight text-base">{bus.busNumber}</td>
                                    <td className="px-6 py-4 text-slate-700 text-sm font-bold">{bus.driverId?.name || <span className="text-slate-400 italic">No Pilot</span>}</td>
                                    <td className="px-6 py-4">
                                        {bus.route?.name ? (
                                            <span className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-[10px] font-black border border-orange-100 uppercase tracking-wider">
                                                {bus.route.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Unrouted</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="font-black text-slate-800 text-xs">{(bus.students?.length || 0) + (bus.faculty?.length || 0)} / {bus.capacity || 40}</span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                                <div 
                                                    className="h-full bg-orange-500 shadow-sm" 
                                                    style={{ width: `${Math.min(100, (((bus.students?.length || 0) + (bus.faculty?.length || 0)) / (bus.capacity || 40)) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 transition-all transform">
                                            <button onClick={() => setTrackingBus(bus)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-100 shadow-sm" title="Telemetry"><Settings size={18} /></button>
                                            <button onClick={() => openEditModal(bus)} className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors border border-slate-100 shadow-sm" title="Reconfigure"><Edit3 size={18} /></button>
                                            <button onClick={() => handleDeleteBus(bus._id)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-100 shadow-sm" title="Decommission"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Activity className="text-slate-200 mx-auto mb-3" size={48} />
                                        <p className="text-slate-400 font-bold italic">No active assets registered in the database.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {trackingBus && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
                    <div className="bg-white w-full h-full max-w-6xl rounded-3xl relative border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white">
                            <h4 className="font-black text-slate-800 flex items-center gap-3">
                                <Activity className="text-orange-600" size={24} /> Live Telemetry: {trackingBus.busNumber}
                            </h4>
                            <button onClick={() => setTrackingBus(null)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-all border border-slate-200"><X size={24} /></button>
                        </div>
                        <div className="flex-1">
                            <LiveTracking 
                                profile={{ assignedBus: trackingBus }}
                                busLocation={[trackingBus.lastLocation?.latitude || 12.9716, trackingBus.lastLocation?.longitude || 77.5946]}
                                gpsSource="Internal Ops"
                                eta="Real-time Stream Active"
                            />
                        </div>
                    </div>
                </div>
            )}

            {editingBus && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl">
                        <button onClick={() => setEditingBus(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 leading-tight">Reconfigure Operation</h4>
                        <form onSubmit={handleEditBusSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Asset Label</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-black text-slate-900"
                                    value={editingBus.busNumber} onChange={(e) => setEditingBus({...editingBus, busNumber: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Primary Operator</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-700"
                                    value={editingBus.driverId?.name || ''} onChange={(e) => setEditingBus({...editingBus, driverId: {...editingBus.driverId, name: e.target.value}})} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Route Matrix Assignment</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-black text-slate-800"
                                    value={editingBus.route || ''} onChange={(e) => setEditingBus({...editingBus, route: e.target.value})}>
                                    <option value="">Detached / No Route</option>
                                    {routes.map(r => (<option key={r._id} value={r._id}>{r.name}</option>))}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Submit Asset Changes</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusManagement;
