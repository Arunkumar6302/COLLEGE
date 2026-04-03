import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Send, CheckCircle, Clock, ShieldAlert, MessageSquareText } from 'lucide-react';

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
        <div className="space-y-10 animate-fade-in">
            <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 mb-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
                    <ShieldAlert className="text-rose-600" size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Incident Reporting</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                         <AlertTriangle size={14} className="text-rose-600" /> Administrative support & service audit lines
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                
                {/* RAISE COMPLAINT PANEL */}
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm sticky top-10 z-10 w-full shrink-0">
                    <h3 className="text-sm font-black mb-10 text-slate-400 uppercase tracking-widest flex items-center gap-3">
                        <AlertTriangle className="text-rose-600" size={18}/> Lodge Official Grievance
                    </h3>
                    <form onSubmit={handleComplaintSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Categorical Subject</label>
                            <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-black text-slate-800 transition-all placeholder:text-slate-300" 
                                value={complaintForm.title} onChange={e => setComplaintForm({...complaintForm, title: e.target.value})} required placeholder="e.g. Asset delayed by 30 mins" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Incident Classification Area</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-black text-slate-800 transition-all cursor-pointer" 
                                value={complaintForm.category} onChange={e => setComplaintForm({...complaintForm, category: e.target.value})}>
                                <option value="General">General Inquiries</option>
                                <option value="Maintenance">Asset Utility / Sanitation</option>
                                <option value="Driver">Personnel Conduct</option>
                                <option value="Schedule">Chronological Discrepancies</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 leading-none">Detailed Briefing</label>
                            <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 outline-none focus:border-rose-500 font-black text-slate-800 resize-none transition-all placeholder:text-slate-300" 
                                value={complaintForm.description} onChange={e => setComplaintForm({...complaintForm, description: e.target.value})} required placeholder="Clarify the exact situational context..." />
                        </div>
                        <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white py-5 text-lg font-black rounded-2xl flex justify-center items-center gap-3 shadow-lg shadow-rose-600/20 active:scale-95 transition-all">
                            <Send size={20} /> Transmit Incident Record
                        </button>
                    </form>
                </div>

                {/* HISTORICAL COMPLAINTS LOG */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-4 mb-6">Historical Log Audit</h3>
                    {complaintsList.length > 0 ? complaintsList.map(comp => (
                        <div key={comp._id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:border-orange-500/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -z-10 group-hover:bg-orange-50 transition-colors"></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1.5 pe-4">
                                    <h4 className="text-xl font-black text-slate-900 tracking-tighter leading-tight">{comp.title}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-orange-600">{comp.category}</span> • {new Date(comp.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </p>
                                </div>
                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 shadow-sm ${
                                    comp.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                    {comp.status === 'resolved' ? <CheckCircle size={12}/> : <Clock size={12}/>} {comp.status}
                                </span>
                            </div>
                            <div className="p-5 bg-slate-50/80 rounded-2xl mb-5 border border-slate-100">
                                <p className="text-sm font-black text-slate-600 leading-relaxed italic tracking-tight">"{comp.description}"</p>
                            </div>
                            {comp.adminResponse && (
                                <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100">
                                    <p className="text-[10px] uppercase font-black text-orange-600 tracking-widest mb-3 flex items-center gap-2 underline underline-offset-4 decoration-orange-200"><MessageSquareText size={14}/> Official Resolution Transmission</p>
                                    <p className="text-sm font-black text-slate-900 tracking-tight leading-relaxed">{comp.adminResponse}</p>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="bg-white p-16 rounded-[40px] border border-dashed border-slate-200 flex items-center justify-center text-center">
                            <div>
                                <AlertTriangle className="text-slate-200 mx-auto mb-4" size={56}/>
                                <p className="font-black text-slate-300 text-xs italic uppercase tracking-widest">No incident records detected in index.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentComplaints;
