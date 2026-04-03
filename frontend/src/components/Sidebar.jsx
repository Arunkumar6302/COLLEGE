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
    ];

    const links = role === 'admin' ? adminLinks : (role === 'driver' ? driverLinks : studentLinks);

    return (
        <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col p-6 border-r border-slate-800 shadow-xl z-50">
            <div className="flex items-center gap-3 mb-10 px-2 transition-transform transform active:scale-95 cursor-default">
                <div className="bg-indigo-600 p-2 rounded-lg shadow-lg">
                    <Bus className="text-white" size={24} />
                </div>
                <h1 className="text-xl font-bold tracking-tight gradient-text">UniTrack</h1>
            </div>

            <nav className="flex-1 space-y-1">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                isActive 
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800 hover:translate-x-1'
                            }`
                        }
                    >
                        <span className="transition-transform group-hover:scale-110">{link.icon}</span>
                        <span className="font-medium text-sm">{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-slate-800 pt-6">
                <div className="mb-6 px-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Organization</p>
                    <p className="text-sm font-semibold text-slate-300 truncate">{user?.orgName || 'Campus Tech'}</p>
                </div>
                <button 
                    onClick={logout}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium w-full text-left group"
                >
                    <LogOut className="group-hover:rotate-12 transition-transform" size={20} />
                    <span className="text-sm">Log out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
