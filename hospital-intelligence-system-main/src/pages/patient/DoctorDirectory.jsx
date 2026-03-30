import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API from "../../services/api";
import { Search, MapPin, Star, AlertCircle, ArrowRight, Brain, Clock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorDirectory() {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const symptoms = searchParams.get("symptoms");

    useEffect(() => {
        const fetchDoctors = async () => {
            setLoading(true);
            try {
                let res;
                if (symptoms) {
                    res = await API.get(`/appointments/recommendations?symptoms=${encodeURIComponent(symptoms)}`);
                } else {
                    res = await API.get("/doctors");
                }
                setDoctors(res.data);
            } catch (error) {
                console.error("Failed to load doctors", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [symptoms]);

    const handleBook = (docId) => {
        navigate(`/patient/appointments?doctor=${docId}`);
    };

    return (
        <div className="p-4 md:p-8 min-h-screen text-slate-100 font-sans relative z-10 w-full max-w-7xl mx-auto">
            <div className="mb-10 text-center relative z-10">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    Specialist <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] to-[#818cf8]">Network</span>
                </h1>
                <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto">Access world-class medical professionals and book your consultation instantly.</p>
            </div>

            {symptoms && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-6 bg-indigo-500/10 border border-indigo-500/30 rounded-3xl shadow-[0_0_30px_rgba(99,102,241,0.1)] flex flex-col md:flex-row items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                            <Brain size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Neural Analysis Active</h3>
                            <p className="text-sm text-slate-400">Filtering specialists based on your query: <span className="text-indigo-400 font-bold italic">"{symptoms}"</span></p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/patient/directory')} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-colors border border-white/5">
                        Clear Analysis
                    </button>
                </motion.div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-10 h-10 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : doctors.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/50 rounded-[3rem] border border-white/5 border-dashed">
                    <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Specialists Found</h3>
                    <p className="text-slate-400">Modify your search criteria or neural analysis to find available doctors.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {doctors.map((doc, idx) => (
                            <motion.div 
                                key={doc.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="glass-card-glowing border-white/5 p-6 rounded-[2rem] shadow-2xl relative group overflow-hidden flex flex-col"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#38bdf8]/20 transition-all duration-700 pointer-events-none" />
                                
                                <div className="text-center border-b border-white/5 pb-6 mb-6 relative z-10">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-slate-800 p-1 border-2 border-[#38bdf8]/30 shadow-[0_0_15px_rgba(56,189,248,0.2)] group-hover:border-[#38bdf8]/60 transition-colors">
                                        <img src={doc.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${doc.name}`} alt={doc.name} className="w-full h-full rounded-full object-cover" />
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1 group-hover:text-[#38bdf8] transition-colors">{doc.name}</h3>
                                    <p className="text-[10px] text-[#38bdf8] font-bold uppercase tracking-widest">{doc.specialization}</p>
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between relative z-10">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center bg-slate-800/20 p-2.5 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-400 flex items-center gap-2"><Clock size={12} /> Exp</span>
                                            <span className="text-xs font-bold text-white">{doc.experience} Years</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-slate-800/20 p-2.5 rounded-xl border border-white/5">
                                            <span className="text-xs text-slate-400 flex items-center gap-2"><Star size={12} /> Rating</span>
                                            <span className="text-xs font-bold text-amber-400">{doc.rating?.toFixed(1) || "4.8"}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleBook(doc.id)} 
                                            className="flex-1 py-3 bg-gradient-to-r from-[#38bdf8] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] text-white font-bold rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <Plus size={14} /> Book
                                        </button>
                                        <button 
                                            onClick={() => navigate(`/patient/messages?doctor=${doc.id}`)} 
                                            className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all border border-white/10 shadow-lg active:scale-95"
                                        >
                                            💬
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
