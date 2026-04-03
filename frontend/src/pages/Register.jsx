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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20">
            <div className="bg-white w-full max-w-xl p-12 rounded-[40px] animate-fade-in shadow-2xl border border-slate-200 relative overflow-hidden">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100 shadow-sm">
                        <Bus size={32} className="text-orange-600" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Domain Registration</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-4">Initialize Institutional Fleet Cluster</p>
                </div>

                {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-widest text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Organization Legal Identity</label>
                        <div className="relative group">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                name="orgName"
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="Imperial College of Technology"
                                value={formData.orgName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Principal Liaison</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                name="adminName"
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="Administrator Name"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Official Digital Mail</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                name="email"
                                type="email" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="admin@domain.edu"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Master Security Token</label>
                        <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                name="password"
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 text-lg font-black rounded-2xl mt-6 col-span-2 shadow-xl shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-widest">
                        Authorize Domain
                    </button>
                    
                    <div className="col-span-2 pt-6 border-t border-slate-100 mt-4 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Existing Domain? <Link to="/login" className="text-orange-600 font-black hover:underline decoration-2 underline-offset-4">Authenticate Now</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
