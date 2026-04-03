import React from 'react';
import { User, Mail, Hash, Clock, Navigation, Bus, UserCircle } from 'lucide-react';

const StudentOverview = ({ profile, eta }) => {
    const assignedBus = profile?.assignedBus;

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="mb-10 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Student Console</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                         <User size={14} className="text-orange-600" /> Welcome back to high-accuracy tracking, {profile?.name}
                    </p>
                </div>
                <div className="w-14 h-14 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-center">
                    <UserCircle className="text-orange-600" size={32} />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-50 blur-[60px] rounded-full group-hover:bg-orange-100 transition-all"></div>
                   <h3 className="text-sm font-black mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-3"><User size={18} className="text-orange-600"/> Identity Registry</h3>
                   
                   <div className="space-y-4">
                       <div className="flex items-center gap-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                           <Mail className="text-slate-400 shrink-0" size={24}/>
                           <div className="overflow-hidden">
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Email</p>
                               <p className="text-base font-black text-slate-800 truncate">{profile?.email}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl">
                           <Hash className="text-slate-400 shrink-0" size={24}/>
                           <div>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Registration Identifier</p>
                               <p className="text-base font-black text-slate-800 uppercase tracking-tighter">{profile?.rollNumber || 'Unassigned'}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-5 bg-orange-50 border border-orange-100 p-5 rounded-2xl">
                           <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/20">
                               <span className="text-xs font-black text-white">S</span>
                           </div>
                           <div>
                               <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">Assigned Position</p>
                               <p className="text-base font-black text-slate-900 uppercase tracking-tighter">Seat: {profile?.seatNumber || 'Dynamic'}</p>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Bus Card Quick Stats */}
                <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                     <h3 className="text-sm font-black mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-3"><Navigation size={18} className="text-orange-600"/> Resource Telemetry</h3>
                     
                     <div className="flex flex-col gap-6 h-full">
                         {assignedBus ? (
                             <>
                                 <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-slate-100">
                                      <div>
                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operational ID</p>
                                          <p className="text-4xl font-black text-slate-900 tracking-tighter">{assignedBus.busNumber}</p>
                                      </div>
                                      <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-orange-600 text-xl tracking-tighter shadow-sm">
                                          <Bus size={32}/>
                                      </div>
                                 </div>

                                 <div className="bg-orange-50 p-6 rounded-3xl flex items-center gap-6 border border-orange-100 mt-auto mb-6">
                                      <div className="w-16 h-16 bg-white rounded-full border border-orange-200 flex items-center justify-center shrink-0 shadow-sm">
                                          <Clock className="text-orange-600 animate-pulse" size={30} />
                                      </div>
                                      <div>
                                           <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Calculated Arrival</p>
                                           <p className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter">{eta}</p>
                                      </div>
                                 </div>
                             </>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 py-10 mb-6 mt-2">
                                  <Navigation size={40} className="mb-4 text-slate-300"/>
                                  <p className="italic font-black text-slate-400 uppercase tracking-widest text-xs">No active asset assigned</p>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOverview;
