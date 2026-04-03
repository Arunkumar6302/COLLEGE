import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Overview from './admin/Overview';
import BusManagement from './admin/BusManagement';
import UserManagement from './admin/UserManagement';
import RouteManagement from './admin/RouteManagement';
import ComplaintManagement from './admin/ComplaintManagement';

const AdminDashboard = () => {
    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-12 bg-slate-950 text-slate-100">
                <header className="mb-12 flex justify-between items-center animate-fade-in">
                    <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Admin Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Admin Control</p>
                            <p className="text-sm font-semibold truncate max-w-[150px]">College Admin Panel</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-600/30">
                            AC
                        </div>
                    </div>
                </header>
                
                <div className="animate-fade-in-delayed">
                    <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/buses" element={<BusManagement />} />
                        <Route path="/drivers" element={<UserManagement role="driver" />} />
                        <Route path="/routes" element={<RouteManagement />} />
                        <Route path="/students" element={<UserManagement role="student" />} />
                        <Route path="/faculty" element={<UserManagement role="faculty" />} />
                        <Route path="/complaints" element={<ComplaintManagement />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
