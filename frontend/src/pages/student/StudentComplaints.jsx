import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Send, CheckCircle, Clock } from 'lucide-react';

const StudentComplaints = () => {
    const [complaintForm, setComplaintForm] = useState({ title: '', description: '', category: 'General' });
    const [complaintsList, setComplaintsList] = useState([]);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/student/complaints`, { headers: { 'x-auth-token': token }});
            setComplaintsList(res.data);
        } catch (err) { console.error('Error fetching complaints'); }
    };

    const handleComplaintSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/student/complaint`, complaintForm, { headers: { 'x-auth-token': token }});
            setComplaintForm({ title: '', description: '', category: 'General' });
            fetchComplaints();
        } catch (err) { alert('Failed to submit complaint'); }
    };

    return (
        <div className="space-y-10 animate-fade-in pl-2">
            <header className="mb-4">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 tracking-tighter">Complaint Management</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                     <AlertTriangle size={14} className="text-rose-400" /> Administrative support lines
                </p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                
                {/* RAISE COMPLAINT PANEL */}
                <div className="glass p-10 rounded-[40px] border border-slate-800 shadow-2xl sticky top-10 pointer-events-auto z-10 w-full shrink-0">
                    <h3 className="text-2xl font-bold mb-8 text-slate-100 flex items-center gap-3">
                        <AlertTriangle className="text-rose-400" size={24}/> Raise a Complaint
                    </h3>
                    <form onSubmit={handleComplaintSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Title</label>
                            <input type="text" className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-medium transition-all" 
                                value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} required placeholder="e.g. Bus delayed by 30 mins" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-medium transition-all" 
                                value={complaintForm.category} onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}>
                                <option value="General">General Query</option>
                                <option value="Maintenance">Maintenance / Cleanliness</option>
                                <option value="Driver">Driver Behavior</option>
                                <option value="Schedule">Schedule / Delays</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                            <textarea rows="4" className="w-full bg-slate-900 border border-slate-700/50 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-medium resize-none transition-all" 
                                value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})} required placeholder="Explain the exact issue..." />
                        </div>
                        <button type="submit" className="w-full btn-primary py-5 text-lg font-bold rounded-2xl flex justify-center items-center gap-3 shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                            <Send size={20} /> Submit Complaint
                        </button>
                    </form>
                </div>

                {/* HISTORICAL COMPLAINTS LOG */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-300 uppercase tracking-widest pl-2 mb-4">Your Recent Complaints</h3>
                    {complaintsList.length > 0 ? complaintsList.map(comp => (
                        <div key={comp._id} className="glass p-8 rounded-[36px] bg-slate-900/40 border border-white/5 hover:border-orange-500/30 transition-all hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-extrabold text-slate-100">{comp.title}</h4>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{comp.category} • {new Date(comp.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${
                                    comp.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                }`}>
                                    {comp.status === 'resolved' ? <CheckCircle size={14}/> : <Clock size={14}/>} {comp.status}
                                </span>
                            </div>
                            <div className="p-4 bg-slate-950/50 rounded-2xl mb-4 border border-slate-800">
                                <p className="text-sm font-medium text-slate-400 leading-relaxed italic">"{comp.description}"</p>
                            </div>
                            {comp.adminResponse && (
                                <div className="p-5 bg-gradient-to-r from-indigo-900/40 to-slate-900/40 rounded-2xl border border-indigo-500/20">
                                    <p className="text-[10px] uppercase font-black text-indigo-400 tracking-widest mb-2 flex items-center gap-2"><CheckCircle size={12}/> Official Administrative Response</p>
                                    <p className="text-sm font-semibold text-slate-200">{comp.adminResponse}</p>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="glass p-12 rounded-[40px] border border-dashed border-slate-800 flex items-center justify-center text-center">
                            <div>
                                <AlertTriangle className="text-slate-600 mx-auto mb-4" size={48}/>
                                <p className="font-bold text-slate-500 italic">No complaints historically recorded.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentComplaints;
