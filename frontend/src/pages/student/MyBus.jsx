import React from 'react';
import { Bus, User, PhoneCall, Settings, Users } from 'lucide-react';

const MyBus = ({ profile }) => {
    const assignedBus = profile?.assignedBus;
    const driver = assignedBus?.driverId;

    return (
        <div className="space-y-10 animate-fade-in pl-2">
            <header className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-orange-600/20 rounded-2xl flex items-center justify-center border border-orange-500/20">
                    <Bus className="text-orange-500" size={30} />
                </div>
                <div>
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 tracking-tighter">My Assigned Bus</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-widest mt-1">Bus details and driver context</p>
                </div>
            </header>

            {!assignedBus ? (
                <div className="glass p-12 rounded-[40px] text-center border-dashed border-2 border-slate-800">
                     <p className="text-slate-500 font-extrabold text-xl font-mono uppercase tracking-widest">No Bus Assigned by Administrator.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                    
                    {/* BUS SPECS CARD */}
                    <div className="glass p-10 rounded-[40px] border border-slate-800 shadow-2xl relative group overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-slate-800/50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-10"></div>
                        <h3 className="text-2xl font-bold mb-8 text-slate-100 flex items-center gap-3">
                            <Settings className="text-rose-400" size={24}/> Bus Details & Capacity
                        </h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Bus Number</span>
                                <span className="text-xl font-extrabold text-white">{assignedBus.busNumber}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Bus Capacity</span>
                                <span className="text-xl font-extrabold text-white">{assignedBus.capacity} passengers</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-white/5">
                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Assigned Students</span>
                                <span className="text-lg font-bold text-slate-200 flex items-center gap-2">
                                     <Users size={18} className="text-slate-400"/> {assignedBus.students?.length || 0} enrolled
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Bus Status</span>
                                <span className="text-md font-bold text-orange-400 uppercase tracking-wider">{assignedBus.status || 'Active'}</span>
                            </div>
                        </div>
                    </div>

                    {/* DRIVER INFO CARD */}
                    {driver ? (
                        <div className="glass p-10 rounded-[40px] border border-slate-800 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950">
                            <h3 className="text-2xl font-bold mb-8 text-slate-100 flex items-center gap-3">
                                <User className="text-indigo-400" size={24}/> Driver Details
                            </h3>

                            <div className="flex flex-col items-center mb-8">
                                <div className="w-28 h-28 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-[30px] flex items-center justify-center text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] mb-6 transform rotate-3">
                                    <User size={48} />
                                </div>
                                <h4 className="text-3xl font-black text-slate-50">{driver.name}</h4>
                                <p className="text-slate-500 font-bold uppercase tracking-widest mt-2 truncate max-w-[200px]">{driver.email}</p>
                            </div>

                            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex justify-between items-center group/btn hover:border-orange-500/30 transition-colors">
                                <div>
                                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Driver Contact Number</p>
                                    <p className="text-xl font-mono font-medium text-slate-300">{driver.contactNumber || driver.phone || 'Not Available'}</p>
                                </div>
                                <button className="bg-slate-800 hover:bg-orange-500 text-white p-5 rounded-2xl transition-all shadow-lg group-hover/btn:scale-105">
                                    <PhoneCall size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass p-10 rounded-[40px] border border-dashed border-slate-800 flex items-center justify-center">
                            <p className="font-bold text-slate-500 italic">No Driver configured for this bus yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBus;
