import React from 'react';
import { Bus, User, PhoneCall, Settings, Users, ShieldCheck, Mail, UserCircle } from 'lucide-react';

const MyBus = ({ profile }) => {
    if (!profile) {
        return (
            <div className="flex h-96 items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
                <div className="text-center animate-pulse">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 mb-6 mx-auto">
                        <Activity className="text-orange-600" size={32} />
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic leading-none">Fetching Telemetry Profile...</p>
                </div>
            </div>
        );
    }
    const assignedBus = profile?.assignedBus;
    const driver = assignedBus?.driverId;

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-6 mb-4">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm">
                    <Bus className="text-orange-600" size={32} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Vehicle Logistics</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-orange-600" /> Operational details & personnel context
                    </p>
                </div>
            </header>

            {!assignedBus ? (
                <div className="bg-white p-24 rounded-[40px] text-center border-dashed border-2 border-slate-200 mt-10">
                     <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-slate-100">
                         <ShieldCheck className="text-slate-300" size={40} />
                     </div>
                     <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4 uppercase leading-none">Asset Detached</h3>
                     <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto leading-relaxed">System logic confirms no transit asset is currently linked to your unique identifier by the administrative authority.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
                    
                    {/* BUS SPECS CARD */}
                    <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm relative group overflow-hidden">
                        <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-700 -z-10"></div>
                        <h3 className="text-sm font-black mb-10 text-slate-400 uppercase tracking-widest flex items-center gap-3">
                            <Settings className="text-orange-600" size={18}/> Technical Configuration
                        </h3>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex justify-between items-center py-5 border-b border-slate-50">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Asset Serial #</span>
                                <span className="text-2xl font-black text-slate-900 tracking-tighter">{assignedBus.busNumber}</span>
                            </div>
                            <div className="flex justify-between items-center py-5 border-b border-slate-50">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Capacity</span>
                                <span className="text-xl font-black text-slate-800 tracking-tighter">{assignedBus.capacity} Units</span>
                            </div>
                            <div className="flex justify-between items-center py-5 border-b border-slate-50">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Manifest</span>
                                <span className="text-base font-black text-slate-700 flex items-center gap-2 tracking-tight">
                                     <Users size={16} className="text-orange-600"/> {assignedBus.students?.length || 0} Registered
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-5">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Network Status</span>
                                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">{assignedBus.status || 'ONLINE'}</span>
                            </div>
                        </div>
                    </div>

                    {/* DRIVER INFO CARD */}
                    {driver ? (
                        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col">
                            <h3 className="text-sm font-black mb-10 text-slate-400 uppercase tracking-widest flex items-center gap-3">
                                <User className="text-orange-600" size={18}/> Lead Personnel
                            </h3>

                            <div className="flex flex-col items-center mb-10">
                                <div className="w-32 h-32 bg-orange-600 rounded-[32px] flex items-center justify-center text-white shadow-xl shadow-orange-600/20 mb-6 transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                                    <UserCircle size={64} className="text-white/90" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{driver.name}</h4>
                                <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mt-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100 flex items-center gap-1.5">
                                    <Mail size={12}/> {driver.email}
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex justify-between items-center group/btn hover:border-orange-500/20 transition-all mt-auto shadow-sm">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Emergency Comms Channel</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter font-mono">{driver.contactNumber || driver.phone || 'DETACHED'}</p>
                                </div>
                                <button className="bg-orange-600 hover:bg-orange-700 text-white p-5 rounded-2xl transition-all shadow-lg shadow-orange-600/20 group-hover/btn:scale-105 active:scale-95">
                                    <PhoneCall size={28} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-10 rounded-[40px] border border-dashed border-slate-200 flex items-center justify-center">
                            <p className="font-black text-slate-300 text-xs italic uppercase tracking-widest">Personnel mapping incomplete.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyBus;
