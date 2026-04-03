import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, Trash2, Plus, X, Bus, CheckCircle, Search, Settings } from 'lucide-react';

const UserManagement = ({ role }) => {
    const [users, setUsers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({ 
        name: '', email: '', password: '', role: role, rollNumber: '', employeeId: '', assignedBus: '', seatNumber: '' 
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
            const res = await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/members`, { 
                ...formData, role 
            }, { headers: { 'x-auth-token': token } });

            if (formData.assignedBus) {
                const endpoint = role === 'faculty' ? 'assign-faculty' : 'assign-student';
                await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/${endpoint}`, {
                    [role === 'faculty' ? 'facultyId' : 'studentId']: res.data._id,
                    busId: formData.assignedBus,
                    seatNumber: formData.seatNumber
                }, { headers: { 'x-auth-token': token } });
            }

            setSuccessMsg(`${role.charAt(0).toUpperCase() + role.slice(1)} successfully registered!`);
            setFormData({ name: '', email: '', password: '', role, rollNumber: '', employeeId: '', assignedBus: '', seatNumber: '' });
            fetchData();
            
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
        if (!window.confirm('Are you sure? This action is permanent.')) return;
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

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const displayUsers = role === 'driver' 
        ? filteredUsers.filter(user => buses.some(b => b.driverId && b.driverId._id === user._id))
        : filteredUsers;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                   <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 capitalize">
                        <UserCheck className="text-orange-600" size={28} /> {role} Console
                   </h3>
                   <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Active Directory for {role} personnel</p>
                </div>
                {role !== 'driver' && (
                    <button onClick={() => setIsAdding(true)} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20 active:scale-95">
                        <Plus size={18} /> Add {role}
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl">
                        <button onClick={() => setIsAdding(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 capitalize">New {role} Profile</h4>
                        
                        {errorMsg && <div className="bg-rose-50 text-rose-600 p-4 rounded-xl mb-6 text-xs font-bold border border-rose-100">{errorMsg}</div>}
                        {successMsg && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl mb-6 text-xs font-bold border border-emerald-100">{successMsg}</div>}

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block font-sans">Full Legal Name</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" placeholder="John Doe" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                    <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" placeholder="j.doe@college.edu" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">System Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                                </div>
                                {['student', 'faculty'].includes(role) && (
                                    <>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{role === 'student' ? 'Roll Number' : 'Employee ID'}</label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-black text-slate-800" value={role === 'student' ? formData.rollNumber : formData.employeeId} onChange={(e) => setFormData({...formData, [role === 'student' ? 'rollNumber' : 'employeeId']: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Seat Number</label>
                                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" value={formData.seatNumber} onChange={(e) => setFormData({...formData, seatNumber: e.target.value})} placeholder="e.g. A1" />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Bus</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" value={formData.assignedBus} onChange={(e) => setFormData({...formData, assignedBus: e.target.value})}>
                                                <option value="">No assignment</option>
                                                {buses.map(bus => <option key={bus._id} value={bus._id}>{bus.busNumber}</option>)}
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-4 shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Save Personnel Data</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">{role} Directory</h4>
                    <div className="relative">
                        <input type="text" placeholder={`Search...`} className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-64 font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Personnel Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{role === 'driver' ? 'Mobile' : 'Assigned Bus'}</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{role === 'student' ? 'Roll #' : role === 'faculty' ? 'Emp ID' : 'Bus ID'}</th>
                                {role !== 'driver' && <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Seat</th>}
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayUsers.length > 0 ? displayUsers.map((user) => (
                                 <tr key={user._id} className="hover:bg-slate-50/80 transition-all group border-b border-slate-100 last:border-0">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 bg-orange-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-transform">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight mb-1">{user.name}</p>
                                                <p className="text-slate-500 text-[11px] font-black uppercase tracking-tight">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        {role === 'driver' ? (
                                            <span className="text-slate-900 font-black text-sm">{user.contactNumber || '--'}</span>
                                        ) : (
                                            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm transition-colors ${user.assignedBus ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-slate-50 text-slate-400 border-slate-200 border-dashed'}`}>
                                                <Bus size={13}/> {user.assignedBus?.busNumber || 'Idle Asset'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-slate-900 text-sm font-black font-mono tracking-tighter">
                                        {role === 'driver' ? (
                                            buses.find(b => b.driverId?._id === user._id)?.busNumber || <span className="text-slate-300 italic font-sans font-bold">Unlinked</span>
                                        ) : (
                                            role === 'student' ? (user.rollNumber || '--') : (user.employeeId || '--')
                                        )}
                                    </td>
                                    {role !== 'driver' && (
                                        <td className="px-6 py-5 text-slate-900 font-black text-sm">{user.seatNumber || <span className="text-slate-300">--</span>}</td>
                                    )}
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 transition-all transform">
                                            <button onClick={() => setEditingUser(user)} className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Reconfigure Profile"><Settings size={18}/></button>
                                            <button onClick={() => handleDeleteUser(user._id)} className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 shadow-sm" title="Terminate Directory"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No matching records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl">
                        <button onClick={() => setEditingUser(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 capitalize leading-tight">Modify {role} Profile</h4>
                        <form onSubmit={handleEditUserSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Personnel Name</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-black text-slate-800" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Official Email</label>
                                <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-600" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} required />
                            </div>
                            {['student', 'faculty'].includes(role) && (
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Seat Number</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 font-bold text-slate-800" value={editingUser.seatNumber || ''} onChange={(e) => setEditingUser({...editingUser, seatNumber: e.target.value})} placeholder="e.g. A1" />
                                </div>
                            )}
                            <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-6 shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Update Information</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
