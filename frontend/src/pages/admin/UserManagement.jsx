import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, Trash2, Plus, X, Bus, CheckCircle } from 'lucide-react';

const UserManagement = ({ role }) => {
    const [users, setUsers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: role, rollNumber: '', assignedBus: '', seatNumber: '' 
    });

    useEffect(() => { 
        fetchData(); 
    }, [role]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [usersRes, busesRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/users/${role}`, { headers: { 'x-auth-token': token } }),
                axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/buses`, { headers: { 'x-auth-token': token } })
            ]);
            setUsers(usersRes.data);
            setBuses(busesRes.data);
        } catch (err) { console.error(err); }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const token = localStorage.getItem('token');
            // Create User (Student or Faculty)
            const res = await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/members`, { 
                ...formData, role 
            }, { headers: { 'x-auth-token': token } });

            // If a bus was selected during student creation, safely link the relationship.
            if (formData.assignedBus) {
                const endpoint = role === 'faculty' ? 'assign-faculty' : 'assign-student';
                await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/${endpoint}`, {
                    [role === 'faculty' ? 'facultyId' : 'studentId']: res.data._id,
                    busId: formData.assignedBus,
                    seatNumber: formData.seatNumber
                }, { headers: { 'x-auth-token': token } });
            }

            setSuccessMsg(`${role.charAt(0).toUpperCase() + role.slice(1)} successfully registered and saved!`);
            setFormData({ name: '', email: '', password: '', role, rollNumber: '', employeeId: '', assignedBus: '', seatNumber: '' });
            fetchData(); // Refresh list to show mapped bus
            
            // Close modal automatically after brief delay so user can see success msg
            setTimeout(() => {
                setIsAdding(false);
                setSuccessMsg('');
            }, 2000);
            
        } catch (err) { 
            console.error(err); 
            setErrorMsg(err.response?.data?.msg || 'An error occurred during registration.');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you heavily sure? This will remove the selected user forever.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/users/${id}`, { headers: { 'x-auth-token': token } });
            fetchData();
        } catch (err) { console.error(err); alert('Failed to remove user'); }
    };

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/users/${editingUser._id}`, editingUser, { headers: { 'x-auth-token': token } });
            setEditingUser(null);
            fetchData();
        } catch (err) { console.error(err); alert('Failed to update user'); }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center bg-pink-600/5 p-8 rounded-3xl border border-pink-500/10 backdrop-blur-sm">
                <div>
                   <h3 className="text-3xl font-extrabold flex items-center gap-4 capitalize">
                        <UserCheck className="text-pink-400" size={36} /> {role} Management
                   </h3>
                   <p className="text-slate-400 mt-2 font-medium">Manage all {role}s and their seat allocations</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="btn-secondary flex items-center gap-3 px-8 py-4 shadow-xl shadow-pink-600/20">
                   <Plus size={22} strokeWidth={3} /> Add {role}
                </button>
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in relative">
                    <div className="glass w-full max-w-2xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text capitalize">Register New {role}</h4>
                        
                        {errorMsg && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-6 font-bold flex items-center gap-3">
                                <X size={20} className="shrink-0" /><p>{errorMsg}</p>
                            </div>
                        )}
                        {successMsg && (
                            <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 p-4 rounded-xl mb-6 font-bold flex items-center gap-3 animate-pulse">
                                <CheckCircle size={20} className="shrink-0" /><p>{successMsg}</p>
                            </div>
                        )}

                        <form onSubmit={handleAddUser} className="grid grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Login)</label>
                                <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 text-slate-100" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                            </div>

                            {['student', 'faculty'].includes(role) && (
                                <>
                                    {role === 'student' ? (
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                                            <input type="text" placeholder="2026-CS-001" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 font-mono" value={formData.rollNumber || ''} onChange={(e) => setFormData({...formData, rollNumber: e.target.value})} />
                                        </div>
                                    ) : (
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
                                            <input type="text" placeholder="FAC-901" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 font-mono" value={formData.employeeId || ''} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
                                        </div>
                                    )}

                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Assign to Bus</label>
                                        <select className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 appearance-none text-slate-200" 
                                            value={formData.assignedBus} onChange={(e) => setFormData({...formData, assignedBus: e.target.value})}>
                                            <option value="">Select a Bus...</option>
                                            {buses.map(bus => (
                                                <option key={bus._id} value={bus._id}>{bus.busNumber} {bus.driverId ? `(${bus.driverId.name})` : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Allocated Seat #</label>
                                        <input type="text" placeholder="e.g. 12A" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500" value={formData.seatNumber} onChange={(e) => setFormData({...formData, seatNumber: e.target.value})} />
                                    </div>
                                </>
                            )}
                            <button type="submit" className="w-full btn-secondary py-5 text-xl font-bold mt-4 col-span-2 capitalize transition-transform hover:scale-[1.02] active:scale-95 shadow-xl flex justify-center items-center gap-3">
                                <UserPlus size={22} /> Confirm Registration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in relative">
                    <div className="glass w-full max-w-xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text capitalize">Edit {role} Details</h4>
                        
                        <form onSubmit={handleEditUserSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email (Login)</label>
                                <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 text-slate-100" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required />
                            </div>
                            {role === 'driver' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                    <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-pink-500 text-slate-100" value={editingUser.contactNumber || ''} onChange={(e) => setEditingUser({...editingUser, contactNumber: e.target.value})} />
                                </div>
                            )}
                            <button type="submit" className="w-full btn-secondary py-4 text-xl font-bold mt-4 shadow-xl flex justify-center items-center gap-3">
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {(() => {
                     const displayUsers = role === 'driver' 
                        ? users.filter(user => buses.some(b => b.driverId && b.driverId._id === user._id))
                        : users;
                     
                     if (displayUsers.length === 0) return (
                         <div className="col-span-full py-20 border-2 border-dashed border-slate-800 rounded-3xl flex items-center justify-center bg-slate-900/30">
                              <p className="text-slate-500 italic font-bold">No {role === 'driver' ? 'active ' : ''}{role}s registered yet.</p>
                         </div>
                     );

                     return displayUsers.map((user) => (
                         <div key={user._id} className="glass p-8 rounded-3xl group border-2 border-transparent hover:border-pink-500/30 transition-all shadow-xl hover:shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-600/10 blur-[40px] rounded-full group-hover:bg-pink-600/20 transition-colors pointer-events-none"></div>
                        
                        <div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center font-bold text-2xl text-pink-400 shadow-inner">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingUser(user)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-xl"><UserPlus size={18} className="rotate-12"/></button>
                                    <button onClick={() => handleDeleteUser(user._id)} className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/></button>
                                </div>
                            </div>
                            <h4 className="text-2xl font-extrabold text-slate-100 mb-1 truncate">{user.name}</h4>
                            <p className="text-slate-500 text-sm mb-2 truncate font-mono">{user.email}</p>
                            {role === 'driver' && user.contactNumber && (
                                <p className="text-slate-400 text-xs font-bold tracking-widest">{user.contactNumber}</p>
                            )}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-800/50 mt-auto">
                            {['student', 'faculty'].includes(role) && (
                                <>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1"><Bus size={14}/> Bus</span>
                                        <span className={`px-3 py-1 rounded-lg ${user.assignedBus ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                            {user.assignedBus ? user.assignedBus.busNumber : 'Unassigned'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">Seat #</span>
                                        <span className="text-pink-500">{user.seatNumber || '--'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs font-bold">
                                        <span className="text-slate-500 uppercase tracking-widest">{role === 'student' ? 'Roll #' : 'Emp ID'}</span>
                                        <span className="text-slate-400 font-mono">{role === 'student' ? (user.rollNumber || '--') : (user.employeeId || '--')}</span>
                                    </div>
                                </>
                            )}
                            
                            {role === 'driver' && (() => {
                                const driverBus = buses.find(b => b.driverId && b.driverId._id === user._id);
                                return (
                                    <>
                                        <div className="flex items-center justify-between text-xs font-bold">
                                            <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1"><Bus size={14}/> Duty Bus</span>
                                            <span className={`px-3 py-1 rounded-lg ${driverBus ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>
                                                {driverBus ? driverBus.busNumber : 'Idle'}
                                            </span>
                                        </div>
                                        {driverBus ? (
                                            <>
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-widest">Students Loaded</span>
                                                    <span className="text-indigo-400">{driverBus.students?.length || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-widest">Faculty Loaded</span>
                                                    <span className="text-pink-500">{driverBus.faculty?.length || 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs font-bold">
                                                    <span className="text-slate-500 uppercase tracking-widest">Occupancy Status</span>
                                                    <span className="text-slate-300">{(driverBus.students?.length || 0) + (driverBus.faculty?.length || 0)} / {driverBus.capacity || 40}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs uppercase bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 font-extrabold tracking-widest py-3 rounded-xl text-center">
                                                 Unassigned (Standby)
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                     ));
                })()}


            </div>
        </div>
    );
};

export default UserManagement;
