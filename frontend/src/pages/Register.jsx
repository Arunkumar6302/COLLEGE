import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, User, Mail, Key, Bus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        orgName: '',
        adminName: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/auth/register-org`, formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-20">
            <div className="glass w-full max-w-xl p-12 rounded-3xl animate-fade-in shadow-2xl relative overflow-hidden">
                <div className="text-center mb-10">
                    <Bus size={44} className="text-primary inline-block mb-4" />
                    <h2 className="text-4xl font-extrabold gradient-text">Modernize Your Fleet</h2>
                    <p className="text-slate-400 mt-3 text-lg">Create an organization and start tracking</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Organization Name</label>
                        <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                name="orgName"
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
                                placeholder="Imperial College of Technology"
                                value={formData.orgName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Admin Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                name="adminName"
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="John Doe"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Official Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                name="email"
                                type="email" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="admin@college.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Organization Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                name="password"
                                type="password" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full btn-primary py-4 text-base mt-6 col-span-2 shadow-lg shadow-indigo-600/20">
                        Create Organization
                    </button>
                    
                    <p className="text-center text-sm text-slate-500 col-span-2 mt-4 font-medium">
                        Already registered? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">Sign in now</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;
