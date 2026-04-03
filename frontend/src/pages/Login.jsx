import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bus, Key, Mail, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'driver') navigate('/driver');
            else navigate('/student');
        } catch (err) {
            if (err.message === "Network Error") {
                 setError('Server offline. Is backend running?');
            } else if (err.response && err.response.data && err.response.data.msg) {
                 setError(err.response.data.msg);
            } else {
                 setError('Invalid credentials or Server Error');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="bg-white w-full max-w-md p-12 rounded-[40px] animate-fade-in shadow-2xl border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <ShieldCheck size={80} className="text-orange-600" />
                </div>
                
                <div className="flex flex-col items-center mb-10">
                    <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-orange-100">
                        <Bus className="text-orange-600 w-10 h-10" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Access Console</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-4">Authorized Personnel Only</p>
                </div>

                {error && <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl mb-8 text-[11px] font-black uppercase tracking-widest text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Security Identifier (Email/UID)</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="name@college.edu or driver_id"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 leading-none">Cryptographic Token (Pass)</label>
                        <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-600 transition-colors" size={20} />
                            <input 
                                type="password" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4.5 pl-12 pr-5 outline-none focus:border-orange-500 font-black text-slate-800 transition-all placeholder:text-slate-300 shadow-inner"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 text-lg font-black rounded-2xl mt-4 shadow-xl shadow-orange-600/20 active:scale-95 transition-all uppercase tracking-widest">
                        Authorize Access
                    </button>
                    
                    <div className="pt-6 border-t border-slate-100 mt-6 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            New Organization? <Link to="/register" className="text-orange-600 font-extrabold hover:underline underline-offset-4 decoration-2">Register Domain</Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
