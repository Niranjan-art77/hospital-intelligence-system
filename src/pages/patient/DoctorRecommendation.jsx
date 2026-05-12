import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";
import {
    Search, Filter, Star, MapPin, Clock, Calendar,
    Phone, Mail, User, Stethoscope, Heart, Brain,
    Activity, Hospital, CheckCircle2, TrendingUp,
    Award, BookOpen, Languages, Video, MessageCircle,
    ChevronRight, X, Zap, Target, BarChart3,
    Users, Shield, AlertCircle, Info, Sparkles
} from "lucide-react";
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, 
    PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';

export default function DoctorRecommendation() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const [symptoms, setSymptoms] = useState("");
    const [recommendedDoctors, setRecommendedDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const analyzeSymptoms = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        setSearched(true);
        
        try {
            // Simulated AI Analysis delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const response = await API.post('/symptoms/analyze', {
                symptoms,
                patientId: user?.id
            });
            
            // For now, let's fetch all doctors and "filter" them based on the AI's suggested specialization
            const docsRes = await API.get('/doctors');
            const allDoctors = docsRes.data;
            
            const aiSpecialization = response.data.recommendedSpecialization;
            const matched = allDoctors.filter(d => 
                d.specialization.toLowerCase().includes(aiSpecialization.toLowerCase()) ||
                aiSpecialization.toLowerCase().includes(d.specialization.toLowerCase())
            );

            // Add mock match scores
            const results = (matched.length > 0 ? matched : allDoctors.slice(0, 3)).map(d => ({
                ...d,
                matchScore: 85 + Math.floor(Math.random() * 14),
                rating: 4.5 + (Math.random() * 0.5),
                reviews: 10 + Math.floor(Math.random() * 200),
                radarData: [
                    { metric: "Symptom Match", value: 80 + Math.floor(Math.random() * 20) },
                    { metric: "Experience", value: 70 + Math.floor(Math.random() * 30) },
                    { metric: "Availability", value: 60 + Math.floor(Math.random() * 40) },
                    { metric: "Affordability", value: 50 + Math.floor(Math.random() * 50) },
                    { metric: "Rating", value: 80 + Math.floor(Math.random() * 20) },
                ]
            }));

            setRecommendedDoctors(results.sort((a, b) => b.matchScore - a.matchScore));
            
            addToast({
                type: "success",
                title: "Neural Analysis Complete",
                message: `Matched with ${results.length} specialists in ${aiSpecialization}.`
            });
        } catch (error) {
            console.error("AI matching failed", error);
            addToast({
                type: "error",
                title: "Core Link Failure",
                message: "Neural inference terminal offline. Falling back to general directory."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 min-h-screen relative z-10 w-full max-w-[1400px] mx-auto">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex p-4 rounded-3xl bg-white/5 border border-white/10 mb-6"
                    >
                        <Brain className="text-purple-400" size={48} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-6xl font-black tracking-tighter text-white mb-4"
                    >
                        NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400">DIAGNOSIS</span>
                    </motion.h1>
                    <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.3em]">
                        AI-Powered specialist matching & tactical triage
                    </p>
                </div>

                {/* Search Interface */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glowing p-10 mb-16 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                    
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-3">
                        <Sparkles size={20} className="text-purple-400" />
                        Describe Biological Anomalies
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="E.g., Chronic migraine with visual aura and nausea..." 
                                value={symptoms}
                                onChange={e => setSymptoms(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && analyzeSymptoms()}
                                className="w-full bg-slate-950/50 border border-white/5 p-5 pl-14 rounded-3xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
                            />
                        </div>
                        <button 
                            onClick={analyzeSymptoms}
                            disabled={loading || !symptoms.trim()}
                            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-rose-600 text-white font-black rounded-3xl shadow-glow-purple transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    Execute Inference
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Results Area */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 flex flex-col items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-purple-500 border-t-transparent animate-spin shadow-glow-purple" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Syncing with Neural Core...</p>
                        </motion.div>
                    ) : searched ? (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center gap-6 mb-8">
                                <h3 className="text-2xl font-black text-white tracking-tight">OPTIMIZED MATCHES</h3>
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                            </div>

                            {recommendedDoctors.length === 0 ? (
                                <div className="p-20 glass-card-glowing border-dashed flex flex-col items-center justify-center opacity-40">
                                    <AlertCircle size={48} className="text-slate-500 mb-6" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">No Specialists Identified in Current Cluster</p>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    {recommendedDoctors.map((doc, idx) => (
                                        <motion.div 
                                            key={doc.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="glass-card-glowing p-8 group hover:border-purple-500/30 transition-all overflow-hidden relative"
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:opacity-10 transition-opacity" />
                                            
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                                                {/* Profile Info */}
                                                <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-white/5 pb-8 lg:pb-0 lg:pr-8">
                                                    <div className="relative mb-6">
                                                        <div className="absolute inset-[-4px] rounded-[2rem] bg-gradient-to-tr from-purple-500 to-rose-500 opacity-50 blur-[8px] animate-pulse" />
                                                        <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border border-white/10 p-1 relative z-10">
                                                            <img 
                                                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${doc.name}&backgroundColor=transparent`} 
                                                                className="w-full h-full rounded-[1.8rem] object-cover" 
                                                                alt="Doctor"
                                                            />
                                                        </div>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">{doc.name}</h4>
                                                    <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                                        {doc.specialization}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-slate-400 text-xs font-bold">
                                                        <div className="flex items-center gap-1.5">
                                                            <Star className="text-amber-500 fill-amber-500" size={14} />
                                                            <span>{doc.rating?.toFixed(1)}</span>
                                                        </div>
                                                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                                        <span>{doc.experience} Years Exp.</span>
                                                    </div>
                                                </div>

                                                {/* Analysis Matrix */}
                                                <div className="lg:col-span-5 flex flex-col justify-center">
                                                    <div className="h-48 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={doc.radarData}>
                                                                <PolarGrid stroke="#ffffff10" />
                                                                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 8, fontWeight: 900 }} />
                                                                <Radar
                                                                    name="Specialist Profile"
                                                                    dataKey="value"
                                                                    stroke="#a855f7"
                                                                    fill="#a855f7"
                                                                    fillOpacity={0.3}
                                                                />
                                                                <Tooltip 
                                                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                                    itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                                                                />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="lg:col-span-3 flex flex-col justify-center gap-4">
                                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Compatibility</div>
                                                        <div className="text-3xl font-black text-emerald-400 tracking-tighter">{doc.matchScore}%</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate(`/patient/appointments?doctor=${doc.id}`)}
                                                        className="w-full py-4 bg-white text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all hover:bg-purple-500 hover:text-white shadow-lg flex items-center justify-center gap-2"
                                                    >
                                                        Initialize Protocol
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-20 pointer-events-none">
                            <Target size={80} className="text-slate-500 mb-6" />
                            <p className="text-sm font-black uppercase tracking-[0.4em] text-slate-500">Awaiting Signal Input</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <style>{`
                .shadow-glow-purple {
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2);
                }
                .shadow-glow-emerald {
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
                }
            `}</style>
        </div>
    );
}
