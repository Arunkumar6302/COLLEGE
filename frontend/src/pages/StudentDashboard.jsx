import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axios from 'axios';
import io from 'socket.io-client';
import { MessageCircle, Send, X, Bus } from 'lucide-react';

import StudentOverview from './student/StudentOverview';
import MyBus from './student/MyBus';
import LiveTracking from './student/LiveTracking';
import StudentComplaints from './student/StudentComplaints';

const socket = io(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}`);

const StudentDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [busLocation, setBusLocation] = useState([28.6139, 77.2090]); // Default coordinates for fallback
    const [gpsSource, setGpsSource] = useState('Searching...');
    const [eta, setEta] = useState('Wait...');
    
    // Global Chatbot UI
    const [showChat, setShowChat] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        fetchProfile();

        socket.on('busLocationUpdate', (data) => {
            // We are already inside the secured bus socket room
            if (data.latitude && data.longitude) {
                setBusLocation([data.latitude, data.longitude]);
                setGpsSource(data.source === 'thingspeak' ? 'Live via IoT' : 'Live via Driver');
                setEta('10 mins'); // Simulated eta recalculation
            }
        });
        
        return () => {
            socket.off('busLocationUpdate');
        };
    }, [profile?.assignedBus?._id]); 

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/student/profile`, {
                headers: { 'x-auth-token': token }
            });
            setProfile(res.data);
            
            if (res.data.assignedBus) {
                socket.emit('join_bus', res.data.assignedBus._id);
            }
        } catch (err) {
            console.error('Error fetching student profile:', err);
        }
    };

    const sendMessage = async () => {
        if (!chatInput) return;
        const newMsg = { role: 'user', content: chatInput };
        setMessages([...messages, newMsg]);
        setChatInput('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/ai/ask`, { 
                question: chatInput,
                userContext: { orgId: profile?.organizationId } 
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "AI routing busy. Try again." }]);
        }
    };

    if (!profile) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-orange-400 font-bold animate-pulse text-2xl tracking-widest uppercase">Initializing Interface...</div>;

    return (
        <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
            <Sidebar role="student" />
            
            <main className="flex-1 overflow-y-auto p-12 bg-slate-950 text-slate-100 flex flex-col relative z-0">
                 <Routes>
                      <Route path="/" element={<StudentOverview profile={profile} eta={eta} />} />
                      <Route path="/bus" element={<MyBus profile={profile} />} />
                      <Route path="/tracking" element={<LiveTracking profile={profile} busLocation={busLocation} eta={eta} gpsSource={gpsSource} />} />
                      <Route path="/complaints" element={<StudentComplaints />} />
                 </Routes>

                {/* AI CHATBOT SYSTEM - GLOBALLY ACCESSIBLE FROM ANY STUDENT TAB */}
                <button 
                    onClick={() => setShowChat(!showChat)}
                    className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-tr from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 rounded-[28px] flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)] transition-all hover:scale-110 active:scale-95 z-[1000] border-[4px] border-slate-950"
                >
                    {showChat ? <X size={32} className="text-white" /> : <MessageCircle size={32} className="text-white fill-white/20" />}
                </button>

                {showChat && (
                    <div className="fixed bottom-36 right-10 w-[420px] h-[600px] glass rounded-[32px] shadow-[0_30px_100px_rgba(0,0,0,0.5)] flex flex-col border border-slate-700/50 z-[1000] animate-fade-in overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-orange-600 to-rose-600 flex justify-between items-center shadow-lg relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 blur-[20px] rounded-full pointer-events-none"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                 <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20"><Bus className="text-white" size={24}/></div>
                                 <div>
                                      <p className="text-white font-black tracking-tighter text-lg leading-none">Smart Assistant</p>
                                      <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest mt-1">Groq AI Powered</p>
                                 </div>
                            </div>
                            <span className="text-[10px] bg-emerald-400/20 text-emerald-100 font-extrabold px-3 py-1.5 rounded-full uppercase border border-emerald-400/30 flex items-center gap-1">
                                 <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> Active
                            </span>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-slate-950/50">
                            {messages.length === 0 && (
                                <div className="text-center py-20 flex flex-col items-center gap-4 opacity-50 px-6">
                                    <MessageCircle size={48} className="text-slate-600"/>
                                    <p className="italic font-medium text-sm text-slate-500">
                                        "I analyze real-time fleets and schedules. Ask me about timings, routes, or delays!"
                                    </p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-semibold shadow-xl leading-relaxed ${
                                        m.role === 'user' 
                                        ? 'bg-gradient-to-tr from-orange-600 to-rose-600 text-white rounded-br-sm' 
                                        : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-slate-700 backdrop-blur-md'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-5 bg-slate-900 border-t border-slate-800 flex gap-3 relative z-10">
                            <input 
                                className="flex-1 bg-slate-950 border border-slate-700/50 rounded-2xl px-5 py-4 outline-none focus:border-orange-500 text-sm font-medium transition-all text-slate-200"
                                placeholder="Type a query..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            />
                            <button 
                                onClick={sendMessage}
                                className="w-14 bg-orange-600 hover:bg-orange-500 rounded-2xl transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center hover:scale-105 active:scale-95 shrink-0"
                            >
                                <Send size={20} className="text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default StudentDashboard;
