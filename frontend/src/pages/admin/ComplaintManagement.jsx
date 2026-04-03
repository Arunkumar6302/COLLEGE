import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, Trash2, X, Send } from 'lucide-react';

const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [isResponding, setIsResponding] = useState(null);
    const [responseBody, setResponseBody] = useState({ status: '', adminResponse: '' });

    useEffect(() => { fetchComplaints(); }, []);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/complaints`);
            setComplaints(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpdate = async (id) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/admin/complaints/${id}`, responseBody);
            setIsResponding(null);
            fetchComplaints();
        } catch (err) { console.error(err); }
    };

    return (
        <div className="space-y-12">
            <div className="flex justify-between items-center bg-amber-600/5 p-8 rounded-3xl border border-amber-500/10">
                <div>
                   <h3 className="text-3xl font-extrabold flex items-center gap-4">
                        <MessageSquare className="text-amber-400" size={36} /> Student feedback
                   </h3>
                   <p className="text-slate-400 mt-2 font-medium italic">View and respond to safety & service complaints</p>
                </div>
            </div>

            {isResponding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="glass w-full max-w-xl p-12 rounded-3xl relative border border-slate-700 shadow-2xl scale-110">
                        <button onClick={() => setIsResponding(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X size={28} /></button>
                        <h4 className="text-3xl font-bold mb-8 gradient-text">Resolution Console</h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Status</label>
                                <select 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 outline-none focus:border-amber-500"
                                    onChange={(e) => setResponseBody({...responseBody, status: e.target.value})}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Feedback</label>
                                <textarea 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-5 resize-none h-40" 
                                    placeholder="Outline the steps taken or response..."
                                    onChange={(e) => setResponseBody({...responseBody, adminResponse: e.target.value})}
                                ></textarea>
                            </div>
                            <button onClick={() => handleUpdate(isResponding)} className="w-full btn-secondary py-5 text-xl font-bold mt-4 flex items-center justify-center gap-3">
                                <Send size={24} /> Submit Response
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {complaints.map((c) => (
                    <div key={c._id} className="glass p-8 rounded-[36px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border border-white/5 hover:border-amber-500/20 transition-all hover:translate-x-1 shadow-2xl">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-4">
                                <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest ${
                                    c.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>{c.status}</span>
                                <h4 className="text-xl font-extrabold text-slate-100">{c.title}</h4>
                            </div>
                            <p className="text-slate-400 italic text-sm font-medium">{c.description}</p>
                            <p className="text-xs text-slate-600 font-bold tracking-tight">Raised by: {c.studentId?.name || 'Anonymous Student'} • {new Date(c.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-6">
                             <div className="text-right hidden lg:block">
                                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Feedback Status</p>
                                  <p className="text-sm font-bold text-slate-200">{c.adminResponse ? 'Responded' : 'No Response Yet'}</p>
                             </div>
                             <button onClick={() => setIsResponding(c._id)} className="p-5 bg-slate-800 hover:bg-amber-600/20 hover:text-amber-100/100 rounded-2xl transition-all shadow-xl group border border-slate-700">
                                  <CheckCircle size={28} className="transition-transform group-hover:scale-110" />
                             </button>
                             <button className="p-5 bg-slate-800 text-slate-500 hover:text-red-500 rounded-2xl transition-all border border-slate-700"><Trash2 size={24}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComplaintManagement;
