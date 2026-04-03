import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bus, Users, Route as MapRoute, MessageSquare, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ role }) => {
    const { logout, user } = useAuth();
    
    const adminLinks = [
        { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
        { name: 'Buses', path: '/admin/buses', icon: <Bus size={20} /> },
        { name: 'Drivers', path: '/admin/drivers', icon: <Users size={20} /> },
        { name: 'Routes', path: '/admin/routes', icon: <MapRoute size={20} /> },
        { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
        { name: 'Faculty', path: '/admin/faculty', icon: <Users size={20} /> },
        { name: 'Complaints', path: '/admin/complaints', icon: <MessageSquare size={20} /> },
    ];

    const driverLinks = [
        { name: 'My Trip', path: '/driver', icon: <Bus size={20} /> },
        { name: 'Route Map', path: '/driver/route', icon: <MapRoute size={20} /> },
    ];

    const studentLinks = [
        { name: 'Dashboard', path: '/student', icon: <LayoutDashboard size={20} /> },
        { name: 'My Bus', path: '/student/bus', icon: <Bus size={20} /> },
        { name: 'Live Tracking', path: '/student/tracking', icon: <MapRoute size={20} /> },
        { name: 'Complaints', path: '/student/complaints', icon: <MessageSquare size={20} /> },
        { name: 'Help Center', path: '/student/help', icon: <Settings size={20} /> },
    ];

    const links = role === 'admin' ? adminLinks : (role === 'driver' ? driverLinks : studentLinks);

    return (
        <aside className="w-68 bg-white h-screen sticky top-0 flex flex-col p-6 border-r border-slate-200 shadow-sm z-50">
            <div className="flex items-center gap-3 mb-10 px-2 cursor-default">
                <div className="bg-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-600/20">
                    <Bus className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-black tracking-tighter text-slate-900">UniTrack</h1>
            </div>

            <nav className="flex-1 space-y-1.5">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                                isActive 
                                ? 'bg-orange-50 text-orange-600 border-orange-100 font-bold' 
                                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:translate-x-1'
                            }`
                        }
                    >
                        <span className="transition-transform group-hover:scale-110">{link.icon}</span>
                        <span className="text-sm tracking-tight">{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-100 pt-6">
                <div className="mb-6 px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Campus Hub</p>
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.orgName || 'Smart Tech'}</p>
                </div>
                <button 
                    onClick={logout}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-all font-bold w-full text-left group"
                >
                    <LogOut className="group-hover:rotate-12 transition-transform" size={20} />
                    <span className="text-sm">Sign Out Personnel</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
