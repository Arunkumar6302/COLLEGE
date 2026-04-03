import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, CheckCircle, Clock, Trash2, X, Send, Activity, Search, AlertCircle } from 'lucide-react';

const ComplaintManagement = () => {
    const [complaints, setComplaints] = useState([]);
    const [isResponding, setIsResponding] = useState(null);
    const [responseBody, setResponseBody] = useState({ status: '', adminResponse: '' });
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredComplaints = complaints.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-slate-200 shadow-sm animate-fade-in text-slate-900 font-bold">
                <div>
                   <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900">
                        <MessageSquare className="text-orange-600" size={28} /> Feedback Console
                   </h3>
                   <p className="text-slate-500 text-[11px] font-black mt-1 uppercase tracking-widest leading-none">Security monitoring & incident resolution</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Open Cases</p>
                        <p className="text-xl font-black text-slate-900 leading-none">{complaints.filter(c => c.status !== 'resolved').length}</p>
                    </div>
                </div>
            </div>

            {isResponding && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-6">
                    <div className="bg-white w-full max-w-xl p-10 rounded-3xl relative border border-slate-200 shadow-2xl">
                        <button onClick={() => setIsResponding(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
                        <h4 className="text-2xl font-black mb-6 text-slate-800 tracking-tight">Incident Resolution</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Resolution State</label>
                                <select 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 px-4 outline-none focus:border-orange-500 font-black text-slate-800"
                                    onChange={(e) => setResponseBody({...responseBody, status: e.target.value})}
                                >
                                    <option value="pending">Pending Review</option>
                                    <option value="in-progress">In Active Progress</option>
                                    <option value="resolved">Resolved & Closed</option>
                                    <option value="closed">Closed (No Action)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Official Response</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 h-32 resize-none font-bold text-slate-700 placeholder:text-slate-300" 
                                    placeholder="Briefly describe the resolution trajectory..."
                                    onChange={(e) => setResponseBody({...responseBody, adminResponse: e.target.value})}
                                ></textarea>
                            </div>
                            <button onClick={() => handleUpdate(isResponding)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black py-4 rounded-xl mt-4 shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm uppercase tracking-widest">
                                <Send size={18} /> Transmit Response
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in font-bold text-slate-900">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h4 className="font-black text-slate-800 uppercase tracking-tight">Service Audit</h4>
                    <div className="relative">
                        <input type="text" placeholder="Filter incidents..." className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none w-64 focus:border-orange-500 font-bold text-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Details</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter Profile</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
                                <tr key={c._id} className="hover:bg-slate-50/80 transition-all group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                <AlertCircle size={18} className="text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 text-sm leading-tight mb-1 truncate w-64">{c.title}</p>
                                                <p className="text-[11px] text-slate-500 font-bold italic truncate w-64 leading-none uppercase tracking-tight">{c.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{c.studentId?.name || 'External Agent'}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">@{c.studentId?.username || 'anon'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                            c.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-black uppercase tracking-tighter">
                                            <Clock size={12} />
                                            {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 transition-all transform">
                                            <button onClick={() => setIsResponding(c._id)} className="p-2.5 text-orange-600 hover:bg-orange-50 rounded-xl border border-slate-100 shadow-sm transition-all" title="Dispatch Response"><CheckCircle size={18} /></button>
                                            <button className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 shadow-sm transition-all" title="Purge Record"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <Activity className="text-slate-200 mx-auto mb-3" size={44} />
                                        <p className="text-slate-400 font-black italic">No feedback entries detected in telemetry.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ComplaintManagement;
