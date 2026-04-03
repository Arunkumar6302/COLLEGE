import React from 'react';
import { Bus, Users, ShieldAlert, Activity, MapPin } from 'lucide-react';

const Overview = () => {
    const stats = [
        { label: 'Total Buses', value: '12', icon: <Bus size={22} className="text-orange-600" />, color: 'bg-orange-50' },
        { label: 'Total Drivers', value: '14', icon: <Activity size={22} className="text-orange-600" />, color: 'bg-orange-50' },
        { label: 'Total Students', value: '450', icon: <Users size={22} className="text-orange-600" />, color: 'bg-orange-50' },
        { label: 'Active Trips', value: '4', icon: <Activity size={22} className="text-orange-600" />, color: 'bg-orange-50' },
        { label: 'Complaints', value: '2', icon: <ShieldAlert size={22} className="text-orange-600" />, color: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm group hover:shadow-md transition-all">
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                            {stat.icon}
                        </div>
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</h3>
                        <p className="text-3xl font-extrabold text-slate-800 tabular-nums">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-lg font-bold flex items-center gap-3 text-slate-800">
                            <MapPin className="text-indigo-600" size={20} /> Live Fleet Status
                        </h4>
                        <span className="bg-emerald-50 text-emerald-600 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border border-emerald-100">4 Active Now</span>
                    </div>
                    <div className="w-full h-[300px] bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 border-dashed">
                        <Activity className="text-slate-300 mb-2 animate-pulse" size={32} />
                        <p className="text-slate-400 text-sm font-medium">Map Engine initializing...</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800">
                        <ShieldAlert className="text-pink-600" size={20} /> Incident Alerts
                    </h4>
                    <div className="space-y-4">
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
                            time="Yesterday" 
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
        'Pending': 'text-amber-600 bg-amber-50 border-amber-100',
        'In Progress': 'text-indigo-600 bg-indigo-50 border-indigo-100',
        'Resolved': 'text-emerald-600 bg-emerald-50 border-emerald-100'
    };

    return (
        <div className="flex justify-between items-start p-4 hover:bg-slate-50 rounded-xl transition-all group border border-transparent hover:border-slate-100">
            <div>
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-sm">{user}</p>
                <p className="text-xs text-slate-500 leading-snug mt-0.5">{issue}</p>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">{time}</p>
            </div>
            <span className={`text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border ${statusColors[status]}`}>
                {status}
            </span>
        </div>
    );
};

export default Overview;
