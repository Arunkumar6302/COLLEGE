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
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            <Sidebar role="admin" />
            <main className="flex-1 overflow-y-auto p-10 bg-slate-50 text-slate-900 border-l border-slate-100">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">College Administration</h1>
                        <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">Global Fleet & Personnel Control</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none mb-1">System Verified</p>
                            <p className="text-sm font-black text-slate-800">Administrator Console</p>
                        </div>
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-orange-600/20">
                            AC
                        </div>
                    </div>
                </header>
                
                <div className="animate-fade-in">
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
