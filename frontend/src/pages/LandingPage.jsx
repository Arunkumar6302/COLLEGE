import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Shield, Bell, MessageSquare, MapPin, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full z-50 glass py-4 px-6 md:px-12 flex justify-between items-center animate-fade-in">
                <div className="flex items-center gap-2">
                    <Bus className="text-primary w-8 h-8" />
                    <span className="text-2xl font-bold gradient-text">UniTrack</span>
                </div>
                <div className="hidden md:flex gap-8 items-center text-sm font-medium">
                    <a href="#home" className="hover:text-primary transition-colors">Home</a>
                    <a href="#about" className="hover:text-primary transition-colors">About</a>
                    <a href="#vision" className="hover:text-primary transition-colors">Vision</a>
                    <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    <Link to="/login" className="btn-primary ml-4">Login</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="home" className="pt-32 pb-20 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto">
                <div className="md:w-1/2 space-y-6 animate-fade-in">
                    <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
                        Revolutionizing <br />
                        <span className="gradient-text">College Commute</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-md">
                        Real-time tracking, IoT-powered safety, and AI-driven assistance for a smarter campus experience.
                    </p>
                    <div className="flex gap-4">
                        <Link to="/register" className="btn-primary flex items-center gap-2">
                            Get Started <ArrowRight size={20} />
                        </Link>
                        <button className="px-6 py-2 rounded-lg border border-slate-700 hover:bg-slate-900 transition-all font-semibold">
                            Request Demo
                        </button>
                    </div>
                </div>
                <div className="md:w-1/2 mt-12 md:mt-0 relative">
                    <div className="w-full h-[400px] bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 rounded-3xl overflow-hidden glass p-4 transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Placeholder for map mock or image */}
                        <div className="w-full h-full bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800">
                             <MapPin className="w-20 h-20 text-indigo-500 animate-bounce" />
                        </div>
                    </div>
                    {/* Decorative Blobs */}
                    <div className="absolute -z-10 top-0 left-0 w-64 h-64 bg-indigo-600/30 blur-[100px] rounded-full"></div>
                    <div className="absolute -z-10 bottom-0 right-0 w-64 h-64 bg-pink-600/30 blur-[100px] rounded-full"></div>
                </div>
            </header>

            {/* Features */}
            <section id="about" className="py-20 px-6 md:px-12 text-center max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-bold mb-16">Smart Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<MapPin className="text-indigo-500" size={32} />}
                        title="Live Tracking"
                        description="Real-time bus location updates using mobile GPS and IoT sensors."
                    />
                    <FeatureCard 
                        icon={<Bell className="text-pink-500" size={32} />}
                        title="Geo-fenced Alerts"
                        description="Get notified immediately when the bus is approaching your selected stop."
                    />
                    <FeatureCard 
                        icon={<MessageSquare className="text-purple-500" size={32} />}
                        title="AI Chatbot"
                        description="Groq-powered assistant for all your route and timing queries."
                    />
                </div>
            </section>

            {/* Vision & Mission */}
            <section id="vision" className="py-20 bg-slate-900/50">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <h2 className="text-3xl font-bold mb-6 italic">"Empowering Institutions with Seamless Transit Solutions"</h2>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Our vision is to eliminate wait-time anxiety and enhance student safety through cutting-edge IoT and SaaS technology. 
                        We believe that efficient logistics are the backbone of a stress-free educational environment.
                    </p>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="py-20 px-6 text-center">
                <div className="glass max-w-2xl mx-auto p-12 rounded-3xl space-y-6">
                    <h3 className="text-2xl font-bold">Ready to modernize your fleet?</h3>
                    <p className="text-slate-400">Join 50+ colleges already using UniTrack.</p>
                    <button className="btn-secondary">Contact Sales Today</button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-900 px-6 md:px-12 text-center text-slate-500 text-sm">
                <p>&copy; 2026 UniTrack SaaS. Built for Smarter Colleges.</p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="glass p-8 rounded-2xl text-left hover:border-slate-600 transition-all group">
        <div className="mb-6 p-4 w-fit bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h4 className="text-xl font-bold mb-3">{title}</h4>
        <p className="text-slate-400">{description}</p>
    </div>
);

export default LandingPage;
