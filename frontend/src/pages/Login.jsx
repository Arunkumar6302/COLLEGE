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
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="glass w-full max-w-md p-10 rounded-3xl animate-fade-in shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCheck size={80} />
                </div>
                
                <div className="flex flex-col items-center mb-10">
                    <Bus className="text-primary w-12 h-12 mb-4" />
                    <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
                    <p className="text-slate-400 mt-2">Sign in to continue your journey</p>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold tracking-tight text-slate-300 ml-1">Email or Username</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="text" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 pl-10 pr-4 outline-none focus:border-indigo-500 font-medium transition-all"
                                placeholder="name@college.edu or driver_username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                        <div className="relative">
                            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input 
                                type="password" 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full btn-primary py-4 text-base mt-4 shadow-lg shadow-indigo-600/20">
                        Sign In
                    </button>
                    
                    <p className="text-center text-sm text-slate-500">
                        New Organization? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">Register here</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;
