import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HelpCircle, MessageCircle, ChevronDown, ChevronUp, UserCircle, Info } from 'lucide-react';

const StudentHelp = () => {
    const [faqs, setFaqs] = useState([]);
    const [openIndex, setOpenIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5000`}/api/ai/faqs`);
                setFaqs(res.data);
                setLoading(false);
            } catch (err) {
                console.error("FAQ Fetch Error:", err);
                setLoading(false);
            }
        };
        fetchFaqs();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-orange-600 font-black animate-pulse uppercase tracking-widest text-2xl">Indexing Help Repository...</div>;

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-6 mb-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Support Library</h2>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                         <HelpCircle size={14} className="text-orange-600" /> Curated resolution repository & FAQs
                    </p>
                </div>
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100 shadow-sm">
                    <Info className="text-orange-600" size={32} />
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 max-w-4xl">
                {faqs.length > 0 ? (
                    faqs.map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-[32px] border border-slate-200 overflow-hidden transition-all duration-300 shadow-sm group">
                            <button 
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                className={`w-full p-8 text-left flex justify-between items-center transition-colors ${openIndex === idx ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <span className={`text-lg font-black tracking-tight leading-tight transition-colors ${openIndex === idx ? 'text-orange-600' : 'text-slate-900'}`}>{faq.question}</span>
                                {openIndex === idx ? <ChevronUp className="text-orange-600 shrink-0" size={24} /> : <ChevronDown className="text-slate-300 group-hover:text-slate-500 shrink-0" size={24} />}
                            </button>
                            
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-8 pt-0 border-t border-slate-100 bg-slate-50/30">
                                    <div className="w-full h-px bg-slate-100 mb-8"></div>
                                    <p className="text-base font-black text-slate-700 leading-relaxed tracking-tight">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 bg-white border-dashed border-2 border-slate-200 rounded-[40px] text-center shadow-sm">
                        <HelpCircle className="text-slate-100 mx-auto mb-6" size={64}/>
                        <p className="font-black text-slate-300 text-xs uppercase tracking-widest italic">Knowledge base empty. Resolution required via administrative office.</p>
                    </div>
                )}
            </div>

            <div className="p-10 bg-orange-50 rounded-[48px] border border-orange-100 max-w-4xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-[80px] rounded-full pointer-events-none -mr-32 -mt-32 transition-all group-hover:bg-white/60"></div>
                 <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                      <div className="w-24 h-24 bg-white rounded-[36px] flex items-center justify-center border border-orange-100 shadow-xl shadow-orange-600/10 rotate-3 group-hover:rotate-0 transition-transform">
                           <MessageCircle size={40} className="text-orange-600"/>
                      </div>
                      <div className="text-center md:text-left">
                           <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Extended Assistance?</h3>
                           <p className="text-slate-500 font-black text-[11px] uppercase tracking-widest mt-2 leading-none">Activate the Intelligent Assistant in the control layer below.</p>
                           <p className="text-slate-400 font-black text-[10px] mt-4 uppercase tracking-[0.2em] italic">Instant query resolution active 24/7</p>
                      </div>
                 </div>
            </div>
        </div>
    );
};

export default StudentHelp;
