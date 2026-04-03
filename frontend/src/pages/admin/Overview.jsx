import React from 'react';
import { Bus, Users, ShieldAlert, Activity, MapPin } from 'lucide-react';

const Overview = () => {
    const stats = [
        { label: 'Total Buses', value: '12', icon: <Bus size={24} className="text-indigo-400" />, color: 'bg-indigo-400/10' },
        { label: 'Total Drivers', value: '14', icon: <Activity size={24} className="text-blue-400" />, color: 'bg-blue-400/10' },
        { label: 'Total Students', value: '450', icon: <Users size={24} className="text-pink-400" />, color: 'bg-pink-400/10' },
        { label: 'Active Trips', value: '4', icon: <Activity size={24} className="text-emerald-400" />, color: 'bg-emerald-400/10' },
        { label: 'Complaints', value: '2', icon: <ShieldAlert size={24} className="text-amber-400" />, color: 'bg-amber-400/10' },
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="glass p-8 rounded-3xl group hover:border-indigo-500/50 transition-all shadow-xl hover:-translate-y-1 duration-300">
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">{stat.label}</h3>
                        <p className="text-4xl font-extrabold text-slate-100 tabular-nums">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="glass p-10 rounded-3xl min-h-[400px] border border-slate-800 shadow-2xl relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-8">
                        <h4 className="text-xl font-bold flex items-center gap-3">
                            <MapPin className="text-indigo-500" /> Live Fleet Tracking
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold animate-pulse">4 Moving</span>
                    </div>
                    {/* Placeholder for map */}
                    <div className="w-full h-[300px] bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:scale-[1.01] transition-transform duration-700">
                        <p className="text-slate-500 font-medium italic">Interactive Map View Rendering...</p>
                    </div>
                </div>

                <div className="glass p-10 rounded-3xl min-h-[400px] border border-slate-800 shadow-2xl overflow-hidden group">
                    <h4 className="text-xl font-bold mb-8 flex items-center gap-3">
                        <ShieldAlert className="text-pink-500" /> Recent Complaints
                    </h4>
                    <div className="space-y-6">
                        <ComplaintItem 
                            user="Rahul Sharma" 
                            issue="Bus 4 approached 10 mins late" 
                            time="2 hours ago" 
                            status="Pending" 
                        />
                        <ComplaintItem 
                            user="Ananya Rao" 
                            issue="AC not working in Bus 7" 
                            time="5 hours ago" 
                            status="In Progress" 
                        />
                         <ComplaintItem 
                            user="Vikram Singh" 
                            issue="Driver skipped Stop 4" 
                            time="昨天" 
                            status="Resolved" 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const ComplaintItem = ({ user, issue, time, status }) => {
    const statusColors = {
        'Pending': 'text-amber-400 bg-amber-400/10',
        'In Progress': 'text-indigo-400 bg-indigo-400/10',
        'Resolved': 'text-emerald-400 bg-emerald-400/10'
    };

    return (
        <div className="flex justify-between items-start p-4 hover:bg-slate-800/50 rounded-2xl transition-all group scale-x-105 border border-transparent hover:border-slate-700">
            <div>
                <p className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{user}</p>
                <p className="text-sm text-slate-400 leading-snug mt-1">{issue}</p>
                <p className="text-xs text-slate-500 mt-2 font-medium">{time}</p>
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-extrabold px-3 py-1 rounded-lg ${statusColors[status]}`}>
                {status}
            </span>
        </div>
    );
};

export default Overview;
