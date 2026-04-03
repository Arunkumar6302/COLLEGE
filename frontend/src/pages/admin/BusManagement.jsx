import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bus as BusIcon, Plus, UserPlus, Settings, Trash2, Edit3, X, Save, Users, ChevronDown, ChevronUp } from 'lucide-react';

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
        <div className="space-y-12">
            <div className="flex justify-between items-center bg-indigo-600/5 p-8 rounded-3xl border border-indigo-500/10 backdrop-blur-sm">
                <div>
                   <h3 className="text-3xl font-extrabold flex items-center gap-4">
                        <BusIcon className="text-indigo-400" size={36} /> Fleet Management
                   </h3>
                   <p className="text-slate-400 mt-2 font-medium">Manage your buses and assign drivers & students.</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-3 px-8 py-4 shadow-xl shadow-indigo-600/20">
                   <Plus size={22} strokeWidth={3} /> Add New Bus
                </button>
            </div>

            {/* ADD MODAL */}
            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in transition-all">
                    <div className="glass w-full max-w-2xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text">Configure New Bus & Driver</h4>
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
                                <X size={20} className="shrink-0" /><p>{errorMsg}</p>
                            </div>
                        )}
                        <form onSubmit={handleAddBus} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Official Bus Number</label>
                                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 font-bold tracking-widest text-lg" placeholder="UP-32-BT-2026"
                                        value={newBus.busNumber} onChange={(e) => setNewBus({...newBus, busNumber: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver's Full Name</label>
                                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500" placeholder="Rahman Khan"
                                        value={newBus.driverName} onChange={(e) => setNewBus({...newBus, driverName: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Contact #</label>
                                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500" placeholder="+91 98765-43210"
                                        value={newBus.driverContact} onChange={(e) => setNewBus({...newBus, driverContact: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Username</label>
                                    <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500" placeholder="rkhan_2026"
                                        value={newBus.driverUsername} onChange={(e) => setNewBus({...newBus, driverUsername: e.target.value})} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Password</label>
                                    <input type="password" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500" placeholder="••••••••"
                                        value={newBus.driverPassword} onChange={(e) => setNewBus({...newBus, driverPassword: e.target.value})} required />
                                </div>
                            </div>
                            <button type="submit" className="w-full btn-primary py-5 text-xl font-bold mt-8 shadow-2xl flex items-center justify-center gap-3 lowercase transform active:scale-95 transition-all">
                                <Save size={24} /> confirm configuration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingBus && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in transition-all">
                    <div className="glass w-full max-w-xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setEditingBus(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text">Edit Bus & Driver</h4>
                        <form onSubmit={handleEditBusSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Bus Number</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 font-bold tracking-widest text-lg"
                                    value={editingBus.busNumber} onChange={(e) => setEditingBus({...editingBus, busNumber: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Name</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500"
                                    value={editingBus.driverId?.name || ''} onChange={(e) => setEditingBus({...editingBus, driverId: {...editingBus.driverId, name: e.target.value}})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Driver Contact #</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500"
                                    value={editingBus.driverId?.contactNumber || ''} onChange={(e) => setEditingBus({...editingBus, driverId: {...editingBus.driverId, contactNumber: e.target.value}})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Assigned Route Line</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-indigo-500 font-bold"
                                    value={editingBus.route || ''} onChange={(e) => setEditingBus({...editingBus, route: e.target.value})}>
                                    <option value="">No Route Assigned</option>
                                    {routes.map(r => (<option key={r._id} value={r._id}>{r.name}</option>))}
                                </select>
                            </div>
                            <button type="submit" className="w-full btn-primary py-5 text-xl font-bold mt-8 shadow-2xl flex items-center justify-center gap-3">
                                <Save size={24} /> Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {buses.length > 0 ? buses.map((bus) => {
                    const isExpanded = expandedBusId === bus._id;
                    return (
                        <div key={bus._id} className="glass p-10 rounded-3xl transition-all group relative border-2 border-transparent hover:border-indigo-500/30 hover:scale-[1.01] shadow-2xl overflow-hidden cursor-default flex flex-col justify-between">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-600/10 blur-[60px] rounded-full group-hover:bg-indigo-600/20 transition-colors pointer-events-none"></div>
                            
                            <div>
                                <div className="flex justify-between items-start mb-10 relative z-10">
                                    <div className="text-xs uppercase font-extrabold tracking-[0.2em] bg-slate-800 text-indigo-400 px-4 py-1.5 rounded-full border border-slate-700 shadow-inner">Active</div>
                                    <div className="flex gap-4">
                                        <button onClick={() => openEditModal(bus)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl"><Edit3 size={20}/></button>
                                        <button onClick={() => handleDeleteBus(bus._id)} className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-xl"><Trash2 size={20}/></button>
                                    </div>
                                </div>
                                <h4 className="text-3xl font-extrabold text-slate-50 tracking-tighter mb-4 group-hover:text-indigo-400 transition-colors">{bus.busNumber}</h4>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <UserPlus size={18} className="text-indigo-500" />
                                            <span className="text-sm font-semibold truncate">Driver: {bus.driverId?.name || 'Not Assigned'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <BusIcon size={18} className="text-emerald-500" />
                                            <span className="text-sm font-semibold truncate">Route: <span className="text-slate-100">{bus.route?.name || 'Unassigned'}</span></span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400 bg-slate-900 border border-slate-800 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Users size={18} className="text-pink-500" />
                                            <span className="text-sm font-semibold">Capacity: <span className="text-slate-100 font-bold">{ (bus.students?.length || 0) + (bus.faculty?.length || 0)}</span> / {bus.capacity || 40}</span>
                                        </div>
                                        <button onClick={() => setExpandedBusId(isExpanded ? null : bus._id)} className="text-indigo-400 hover:text-white flex items-center gap-1 font-bold text-xs bg-slate-800 px-2 py-1 rounded-md transition-colors">
                                            {isExpanded ? <><ChevronUp size={14}/> Hide</> : <><ChevronDown size={14}/> View</>}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* EXPANDED MEMBER LIST VIEW (STUDENTS & FACULTY) */}
                            {isExpanded && (
                                <div className="mt-2 mb-8 bg-slate-900 rounded-2xl p-6 border border-slate-800 animate-fade-in relative z-10 shadow-inner overflow-hidden">
                                    
                                    {/* FACULTY SECTION */}
                                    <h5 className="text-[11px] font-black text-rose-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Users size={12}/> Faculty Members ({bus.faculty?.length || 0})</h5>
                                    <div className="space-y-2 mb-6 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {bus.faculty?.length > 0 ? bus.faculty.map(fac => (
                                            <div key={fac._id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 transition-colors hover:border-red-500/30 group/student">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 font-bold text-sm w-44 truncate">{fac.name}</span>
                                                    <span className="text-slate-500 text-[10px] font-mono tracking-wider">{fac.employeeId || 'No Emp ID'}</span>
                                                </div>
                                                <button onClick={() => handleRemoveFaculty(fac._id, bus._id)} className="text-slate-600 hover:text-red-500 bg-slate-900 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover/student:opacity-100">
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest italic py-2 pl-2">No Faculty Assigned.</p>
                                        )}
                                    </div>

                                    {/* STUDENT SECTION */}
                                    <h5 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><Users size={12}/> Students ({bus.students?.length || 0})</h5>
                                    <div className="space-y-2 mb-6 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {bus.students?.length > 0 ? bus.students.map(student => (
                                            <div key={student._id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 transition-colors hover:border-red-500/30 group/student">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 font-bold text-sm w-44 truncate">{student.name}</span>
                                                    <span className="text-slate-500 text-[10px] font-mono tracking-wider">{student.rollNumber || student.email}</span>
                                                </div>
                                                <button onClick={() => handleRemoveStudent(student._id, bus._id)} className="text-slate-600 hover:text-red-500 bg-slate-900 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover/student:opacity-100">
                                                    <X size={14}/>
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-slate-600 text-[11px] font-bold uppercase tracking-widest italic py-2 pl-2">No Students Assigned.</p>
                                        )}
                                    </div>

                                    {/* ASSIGNMENT FORMS */}
                                    <div className="space-y-3 pt-4 border-t border-slate-800/80">
                                        <form onSubmit={(e) => { e.preventDefault(); handleAssignRoute(bus._id); }} className="flex gap-2 mb-4">
                                            <select value={selectedRouteId} onChange={(e) => setSelectedRouteId(e.target.value)} 
                                                className="flex-1 bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-400 rounded-lg px-3 py-2.5 outline-none focus:border-emerald-500 appearance-none font-bold">
                                                <option value="">+ Assign Bus Route...</option>
                                                {routes.map(r => (<option key={r._id} value={r._id}>{r.name}</option>))}
                                            </select>
                                            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-lg font-bold shadow-lg text-xs shrink-0 transition-transform active:scale-95">Link Route</button>
                                        </form>

                                        <form onSubmit={(e) => { e.preventDefault(); handleAssignFaculty(bus._id); }} className="flex gap-2">
                                            <select value={selectedFacultyId} onChange={(e) => setSelectedFacultyId(e.target.value)} 
                                                className="flex-1 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-rose-500 appearance-none font-bold">
                                                <option value="">+ Assign Faculty...</option>
                                                {unassignedFaculty.map(f => (<option key={f._id} value={f._id}>{f.name} ({f.employeeId})</option>))}
                                            </select>
                                            <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-4 rounded-lg font-bold shadow-lg text-xs shrink-0 transition-transform active:scale-95">Assign</button>
                                        </form>

                                        <form onSubmit={(e) => { e.preventDefault(); handleAssignStudent(bus._id); }} className="flex gap-2">
                                            <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} 
                                                className="flex-1 bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-indigo-500 appearance-none font-bold">
                                                <option value="">+ Assign Student...</option>
                                                {unassignedStudents.map(s => (<option key={s._id} value={s._id}>{s.name} ({s.rollNumber})</option>))}
                                            </select>
                                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 rounded-lg font-bold shadow-lg text-xs shrink-0 transition-transform active:scale-95">Assign</button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <button className="w-full py-4 mt-auto bg-slate-800/10 border border-slate-700 hover:bg-indigo-600 hover:border-transparent rounded-2xl text-sm font-extrabold transition-all duration-300 group-hover:shadow-2xl">
                                Track Real-time
                            </button>
                        </div>
                    );
                }) : (
                    <div className="col-span-3 text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800 animate-pulse flex items-center justify-center">
                         <p className="text-2xl text-slate-500 font-bold italic tracking-wide flex items-center gap-4"><BusIcon className="opacity-50"/> No Buses Registered Yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusManagement;
