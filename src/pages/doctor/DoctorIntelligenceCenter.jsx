import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, Users, Calendar, AlertTriangle, Sparkles, Brain, 
    TrendingUp, Heart, Droplets, Zap, Thermometer, Shield,
    Clock, Search, Bell, ChevronRight, MessageSquare, Plus,
    MoreHorizontal, Power, Microscope, FlaskConical, Target,
    Crosshair, Terminal, ZapOff, Radar, Eye, ArrowUpRight
} from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

// --- Mock Data ---
const PATIENT_LOAD_DATA = [
    { name: "08:00", load: 12 }, { name: "10:00", load: 18 }, { name: "12:00", load: 25 },
    { name: "14:00", load: 32 }, { name: "16:00", load: 28 }, { name: "18:00", load: 20 },
];

const EMERGENCY_TRACKER = [
    { id: 1, type: "ICU", label: "Cardiac Unit", status: "Critical", level: 95 },
    { id: 2, type: "ER", label: "Trauma Bay", status: "Active", level: 60 },
    { id: 3, type: "OPD", label: "Neuro Ward", status: "Stable", level: 30 },
];

export default function DoctorIntelligenceCenter() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");
    const [scanning, setScanning] = useState(true);
    const [heartRate, setHeartRate] = useState(72);
    const [aiQuery, setAiQuery] = useState("");
    const [aiResponse, setAiResponse] = useState(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [pRes, aRes] = await Promise.all([
                    API.get("/patients"),
                    API.get("/appointments")
                ]);
                setPatients(Array.isArray(pRes.data) ? pRes.data : []);
                setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
                
                // Simulate neural sync
                setTimeout(() => setScanning(false), 2000);
            } catch (err) {
                console.error("Dashboard failed to sync with neural nodes", err);
                setScanning(false);
            }
        };
        loadDashboard();

        const hrInterval = setInterval(() => {
            setHeartRate(prev => prev + Math.floor(Math.random() * 5 - 2));
        }, 3000);

        return () => clearInterval(hrInterval);
    }, []);

    const highRiskPatients = patients.filter(p => p.riskLevel === "HIGH" || p.chronicConditions);

    const handleAiAnalyze = () => {
        if (!aiQuery.trim()) return;
        setAiResponse({
            status: "ANALYZING",
            confidence: 94,
            recommendation: "Based on biometric drift, patient exhibit 12% probability of metabolic shift. Suggest renal panel escalation."
        });
    };

    return (
        <div className={`min-h-screen medical-grid p-6 md:p-10 space-y-10 selection:bg-cyan-500/30 transition-all duration-1000 ${emergencyMode ? "bg-red-950/20" : ""}`}>
            
            {/* Header / Identity HUD */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-3">
                        <Radar className={`w-4 h-4 ${emergencyMode ? "text-red-500" : "text-cyan-400"} animate-spin-slow`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Clinical Command Node v9.4</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic uppercase">
                        NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">INTELLIGENCE</span> HUB
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${emergencyMode ? "bg-red-500 animate-ping" : "bg-emerald-500"}`} />
                            <span className={`text-[10px] font-bold ${emergencyMode ? "text-red-400" : "text-emerald-400"} uppercase tracking-widest`}>
                                {emergencyMode ? "CRITICAL STATUS ACTIVE" : "Neural Link Established"}
                            </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">DR. {user?.fullName?.toUpperCase()} // STAFF ID: {user?.id?.slice(0,8)}</span>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setEmergencyMode(!emergencyMode)}
                        className={`px-8 py-4 ${emergencyMode ? "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]" : "bg-slate-900 border border-white/10 text-slate-400 hover:border-red-500/50 hover:text-red-500"} text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center gap-3`}
                    >
                        <AlertTriangle className="w-4 h-4" /> EMERGENCY MODE
                    </button>
                    <div className="w-14 h-14 glass-card flex items-center justify-center text-cyan-400 group cursor-pointer hover:border-cyan-500/50 transition-all">
                        <Bell className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </div>
                </div>
            </header>

            {/* Tactical Stats HUD */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Nodes", val: patients.length, unit: "Patients", icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
                    { label: "Daily Queue", val: appointments.length, unit: "Slots", icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "High Risk", val: highRiskPatients.length, unit: "Critical", icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", pulse: highRiskPatients.length > 0 },
                    { label: "System Load", val: "24.8", unit: "Gbps", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" }
                ].map((v, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-8 border-white/5 group relative overflow-hidden">
                        <div className="hud-corner top-left opacity-20" />
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center ${v.color} ${v.pulse ? "animate-pulse" : ""}`}>
                                <v.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Node {i+1}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</p>
                        <div className="text-3xl font-black text-white italic">
                            {v.val} <span className="text-[10px] text-slate-600 not-italic uppercase">{v.unit}</span>
                        </div>
                        <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ x: '-100%' }} animate={{ x: '0%' }} transition={{ duration: 2, repeat: Infinity }} className={`h-full w-1/2 ${v.bg}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Intelligence Grid */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* Live Telemetry Card */}
                    <div className="glass-card p-10 border-cyan-500/20 relative overflow-hidden bg-cyan-500/5 group">
                        <div className="hud-corner top-left" />
                        <div className="hud-corner bottom-right" />
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">WARD TELEMETRY STREAM</h3>
                                <p className="text-sm font-bold text-cyan-400 uppercase tracking-widest">Real-time biometric synchronization across all sectors</p>
                            </div>
                            <div className="text-right">
                                <div className="text-4xl font-black text-white italic">{heartRate} <span className="text-xs text-cyan-500 not-italic">BPM</span></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Ward Pulse</span>
                            </div>
                        </div>
                        
                        <div className="h-[250px] w-full relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={PATIENT_LOAD_DATA}>
                                    <defs>
                                        <linearGradient id="cyanHUD" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area 
                                        type="monotone" 
                                        dataKey="load" 
                                        stroke="#06b6d4" 
                                        strokeWidth={4} 
                                        fill="url(#cyanHUD)" 
                                        animationDuration={2000}
                                    />
                                    <XAxis dataKey="name" hide />
                                    <YAxis hide />
                                    <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '12px' }} />
                                </AreaChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                                <Activity size={100} className="text-cyan-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-8 relative z-10">
                            {['Alpha', 'Beta', 'Gamma', 'Delta'].map((sector, i) => (
                                <div key={i} className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                                    <span className="text-[8px] font-black text-slate-500 uppercase mb-2">Sector {sector}</span>
                                    <span className="text-sm font-black text-white">98.{i*2}%</span>
                                    <span className="text-[8px] font-bold text-emerald-400 uppercase mt-1">Sync</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Priority Triage Queue */}
                        <div className="glass-card p-8 border-rose-500/20">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center justify-between">
                                <span className="flex items-center gap-3"><Clock size={18} className="text-rose-400" /> TACTICAL TRIAGE QUEUE</span>
                                <span className="text-[10px] bg-rose-500/10 text-rose-400 px-3 py-1 rounded-full border border-rose-500/20 italic">LIVE UPDATE</span>
                            </h3>
                            <div className="space-y-4">
                                {highRiskPatients.slice(0, 4).map((p, i) => (
                                    <div key={i} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-rose-500/30 transition-all cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-rose-500/20 p-0.5 relative">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="P" className="w-full h-full rounded-xl" />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-950 animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase">{p.name}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{p.chronicConditions || "General Triage"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[8px] font-black text-rose-400 uppercase bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">CRITICAL</span>
                                            <p className="text-xs font-black text-white mt-1">14:30</p>
                                        </div>
                                    </div>
                                ))}
                                {highRiskPatients.length === 0 && (
                                    <div className="py-12 flex flex-col items-center justify-center text-slate-500 opacity-30 italic">
                                        <Shield size={32} className="mb-2" />
                                        <span className="text-xs uppercase font-black">No Critical Alerts</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* JARVIS Clinical AI Suite */}
                        <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                            <div className="absolute inset-0 scanline opacity-5" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 italic">
                                <Brain className="w-5 h-5 text-indigo-400" /> JARVIS CLINICAL AI
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 min-h-[80px]">
                                    <AnimatePresence mode="wait">
                                        {aiResponse ? (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Analysis Result</span>
                                                    <span className="text-[8px] font-black text-emerald-400 uppercase">94% CONFIDENCE</span>
                                                </div>
                                                <p className="text-[10px] text-slate-300 font-bold leading-relaxed">{aiResponse.recommendation}</p>
                                            </motion.div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                                                <Terminal size={24} className="text-indigo-500 mb-2" />
                                                <p className="text-[9px] font-black uppercase tracking-widest">Awaiting Neural Input...</p>
                                            </div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                                    <input 
                                        type="text" 
                                        value={aiQuery}
                                        onChange={e => setAiQuery(e.target.value)}
                                        placeholder="Enter clinical query..." 
                                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                                    />
                                </div>
                                <button 
                                    onClick={handleAiAnalyze}
                                    className="w-full py-4 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                >
                                    INITIALIZE NEURAL SCAN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tactical Sidebar */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Performance Integrity Gauge */}
                    <div className="glass-card p-10 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center text-center relative overflow-hidden">
                        <div className="hud-corner top-right opacity-20" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Clinical Integrity Score</h4>
                        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                                <motion.circle 
                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * 98.4) / 100 }}
                                    transition={{ duration: 2.5, ease: "circOut" }}
                                    className="text-emerald-500" 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white tracking-tighter">98.4</span>
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Optimal</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Efficiency drift within 0.2% of baseline.</p>
                    </div>

                    {/* Operational Ledger */}
                    <div className="glass-card p-8 border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center justify-between">
                            <span>Activity Ledger</span>
                            <Clock className="w-4 h-4 opacity-30" />
                        </h3>
                        <div className="space-y-6 relative pl-6 border-l border-white/5">
                            {appointments.slice(0, 5).map((e, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{new Date(e.appointmentTime).toLocaleDateString()}</p>
                                    <p className="text-xs font-bold text-white mb-0.5">{e.reason || "Consultation"}</p>
                                    <p className="text-[8px] font-black text-cyan-400 uppercase tracking-tighter italic">Patient PID-{e.patientId?.slice(0,6)}</p>
                                </div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-[10px] font-black text-slate-600 uppercase italic">No recent activities</div>
                            )}
                        </div>
                    </div>

                    {/* Facility Mapping */}
                    <div className="glass-card p-6 border-white/5 h-64 bg-slate-950 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-cyan-500/5 z-0" />
                        <div className="relative z-10 flex flex-col h-full">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Crosshair className="w-3 h-3 text-cyan-500" /> Sector Surveillance
                            </h4>
                            <div className="flex-1 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center gap-4 group-hover:bg-slate-800 transition-all cursor-pointer overflow-hidden relative">
                                <Radar className="w-12 h-12 text-cyan-500/20 animate-pulse" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-32 h-32 rounded-full border border-cyan-500/10 animate-[ping_3s_infinite]" />
                                </div>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Ward Scan...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scanning Overlay */}
            <AnimatePresence>
                {scanning && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-40 h-40 rounded-full border-4 border-cyan-500/10 border-t-cyan-500 animate-spin" />
                            <Brain size={64} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-[0.6em] mt-10 animate-pulse uppercase italic">Synchronizing Neural Hub</h2>
                        <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] mt-4 uppercase">Verifying Medical Credentials • Sector 7-G</p>
                        <div className="mt-12 w-64 h-1 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="h-full bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.03] z-[100]" />
        </div>
    );
}
