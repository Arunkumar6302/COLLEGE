import React from 'react';
import { User, Mail, Hash, Clock, Navigation } from 'lucide-react';

const StudentOverview = ({ profile, eta }) => {
    const assignedBus = profile?.assignedBus;

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="mb-10">
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 tracking-tighter">Overview Dashboard</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                     <User size={14} className="text-orange-400" /> Welcome back, {profile?.name}!
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Card */}
                <div className="glass p-8 rounded-[32px] border border-slate-800 shadow-xl relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-600/10 blur-[60px] rounded-full group-hover:bg-orange-600/20 transition-all"></div>
                   <h3 className="text-xl font-bold mb-6 text-slate-300 flex items-center gap-3"><User size={20} className="text-orange-400"/> My Student Profile</h3>
                   
                   <div className="space-y-4">
                       <div className="flex items-center gap-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                           <Mail className="text-slate-500 shrink-0" size={24}/>
                           <div className="overflow-hidden">
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</p>
                               <p className="text-base font-semibold text-slate-200 truncate">{profile?.email}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                           <Hash className="text-slate-500 shrink-0" size={24}/>
                           <div>
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number</p>
                               <p className="text-base font-semibold text-slate-200 uppercase">{profile?.rollNumber || 'Not Linked'}</p>
                           </div>
                       </div>
                       <div className="flex items-center gap-5 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                           <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                               <span className="text-xs font-black text-rose-500">S</span>
                           </div>
                           <div>
                               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Allocated Seat</p>
                               <p className="text-base font-black text-rose-400 uppercase">{profile?.seatNumber || 'Standing'}</p>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Bus Card Quick Stats */}
                <div className="glass p-8 rounded-[32px] border border-slate-800 shadow-xl relative overflow-hidden group">
                     <h3 className="text-xl font-bold mb-6 text-slate-300 flex items-center gap-3"><Navigation size={20} className="text-indigo-400"/> Current Bus Details</h3>
                     
                     <div className="flex flex-col gap-6 h-full">
                         {assignedBus ? (
                             <>
                                 <div className="glass p-6 rounded-3xl flex items-center justify-between border border-indigo-500/20 bg-slate-900/50">
                                      <div>
                                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bus Number</p>
                                          <p className="text-3xl font-black text-slate-100">{assignedBus.busNumber}</p>
                                      </div>
                                      <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-xl tracking-tighter">
                                          BUS
                                      </div>
                                 </div>

                                 <div className="glass p-6 rounded-3xl flex items-center gap-6 border border-emerald-500/20 bg-slate-900/50 mt-auto mb-6">
                                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                                          <Clock className="text-emerald-400 animate-pulse" size={30} />
                                      </div>
                                      <div>
                                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Expected Arrival (ETA)</p>
                                           <p className="text-3xl font-black text-emerald-400 tabular-nums">{eta}</p>
                                      </div>
                                 </div>
                             </>
                         ) : (
                             <div className="flex-1 flex flex-col items-center justify-center opacity-50 bg-slate-900/50 rounded-2xl border border-dashed border-slate-700 py-10 mb-6 mt-2">
                                  <Navigation size={40} className="mb-4 text-slate-600"/>
                                  <p className="italic font-bold font-mono">No Bus Assigned</p>
                             </div>
                         )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default StudentOverview;
