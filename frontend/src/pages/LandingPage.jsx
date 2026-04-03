import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, MapPin, Bell, MessageSquare, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md py-5 px-6 md:px-12 flex justify-between items-center animate-fade-in border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                        <Bus className="text-white" size={24} />
                    </div>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">UniTrack<span className="text-orange-600">.</span></span>
                </div>
                <div className="hidden md:flex gap-10 items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <a href="#home" className="hover:text-orange-600 transition-colors">Infrastructure</a>
                    <a href="#about" className="hover:text-orange-600 transition-colors">Technology</a>
                    <a href="#vision" className="hover:text-orange-600 transition-colors">Philosophy</a>
                    <a href="#contact" className="hover:text-orange-600 transition-colors">Liaison</a>
                    <Link to="/login" className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-orange-600/20 active:scale-95 transition-all">Authenticate</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="pt-48 pb-32 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-20">
                <div className="md:w-1/2 space-y-10 animate-fade-in">
                    <div className="space-y-4">
                        <span className="bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full border border-orange-100">Next-Gen Fleet Management</span>
                        <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tighter text-slate-900">
                            Campus <br />
                            <span className="text-orange-600 uppercase">Mobility.</span>
                        </h1>
                    </div>
                    <p className="text-xl text-slate-500 font-bold leading-relaxed max-w-lg">
                        Real-time telemetry, IoT-driven safety protocols, and AI-powered logistics for the modern educational ecosystem.
                    </p>
                    <div className="flex gap-6">
                        <Link to="/register" className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-5 text-lg font-black rounded-2xl flex items-center gap-3 shadow-2xl shadow-orange-600/30 active:scale-95 transition-all">
                            Initialize Domain <ArrowRight size={24} />
                        </Link>
                        <button className="px-10 py-5 rounded-2xl border-2 border-slate-200 hover:bg-slate-50 transition-all font-black text-slate-800 text-lg">
                            System Specs
                        </button>
                    </div>
                </div>
                <div className="md:w-1/2 relative">
                    <div className="w-full aspect-square bg-slate-100 rounded-[60px] overflow-hidden p-6 transform rotate-3 hover:rotate-0 transition-transform duration-700 shadow-2xl border-8 border-white">
                         <div className="w-full h-full bg-white rounded-[40px] flex items-center justify-center border border-slate-200 relative group overflow-hidden shadow-inner">
                              <MapPin className="w-32 h-32 text-orange-600 animate-bounce relative z-10" />
                              <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                         </div>
                    </div>
                    <div className="absolute -z-10 -top-20 -left-20 w-80 h-80 bg-orange-200/30 blur-[120px] rounded-full"></div>
                    <div className="absolute -z-10 -bottom-20 -right-20 w-80 h-80 bg-rose-200/30 blur-[120px] rounded-full"></div>
                </div>
            </header>

            {/* Features */}
            <section id="about" className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-10">
                    <div className="max-w-2xl">
                         <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Core Infrastructure</p>
                         <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">High-Precision <br/> Features.</h2>
                    </div>
                    <p className="text-slate-500 font-bold text-lg max-w-sm mb-2">Engineered for accuracy, safety, and seamless administrative control.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <FeatureCard 
                        icon={<MapPin className="text-orange-600" size={32} />}
                        title="Live Telemetry"
                        description="Ultra-low latency GPS tracking with dual-stream mobile and IoT sensor integration."
                    />
                    <FeatureCard 
                        icon={<Bell className="text-orange-600" size={32} />}
                        title="Geofencing"
                        description="Proximity-based trigger systems for automated student and faculty notifications."
                    />
                    <FeatureCard 
                        icon={<MessageSquare className="text-orange-600" size={32} />}
                        title="Neural Assistant"
                        description="Groq-powered AI logic for complex routing queries and institutional support."
                    />
                </div>
            </section>

            {/* Philosophy Section */}
            <section id="vision" className="py-32 bg-slate-50">
                <div className="max-w-5xl mx-auto text-center px-6">
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-10 leading-tight">"Synchronizing Campus Logistics with the Future of Intelligence."</h2>
                    <p className="text-slate-500 text-xl font-bold leading-relaxed max-w-3xl mx-auto">
                        Our philosophy centers on total operational transparency. By eliminating spatial uncertainty, we empower students to focus on education while ensuring administrative perfection.
                    </p>
                </div>
            </section>

            {/* Liaison Section */}
            <section id="contact" className="py-32 px-6 text-center">
                <div className="bg-white border-2 border-slate-100 max-w-4xl mx-auto p-20 rounded-[60px] space-y-10 shadow-2xl relative overflow-hidden group hover:border-orange-500/20 transition-all">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 blur-[100px] -mr-32 -mt-32 rounded-full transition-all group-hover:bg-orange-100"></div>
                    <div className="relative z-10 space-y-6">
                        <h3 className="text-5xl font-black text-slate-900 tracking-tighter">Ready to Deploy?</h3>
                        <p className="text-slate-500 text-xl font-bold">Join the network of elite institutions scaling with UniTrack logic.</p>
                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-5 text-xl font-black rounded-2xl shadow-xl shadow-orange-600/30 transition-all active:scale-95 uppercase tracking-widest mt-6">
                            Contact Liaison Agent
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t border-slate-100 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <p>&copy; 2026 UniTrack Systems. All Rights Reserved.</p>
                <div className="flex gap-10">
                    <a href="#" className="hover:text-orange-600 transition-colors">Privacy Protocal</a>
                    <a href="#" className="hover:text-orange-600 transition-colors">Terms of Service</a>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white p-10 rounded-[40px] text-left border border-slate-100 hover:border-orange-500/20 transition-all group shadow-xl shadow-slate-200/40">
        <div className="mb-8 p-5 w-fit bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform border border-orange-100 shadow-sm shadow-orange-600/10">
            {icon}
        </div>
        <h4 className="text-2xl font-black mb-4 text-slate-900 tracking-tight">{title}</h4>
        <p className="text-slate-500 font-bold leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
