import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Activity, Users, Calendar, AlertTriangle, Sparkles, Brain, 
    TrendingUp, Heart, Droplets, Zap, Thermometer, Shield,
    Clock, Search, Bell, ChevronRight, MessageSquare, Plus,
    MoreHorizontal, Power, Microscope, FlaskConical, Target
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

// Feature 2: AI Diagnosis Preview Mock
const AI_DIAGNOSIS_PREVIEWS = {
    "Chronic Hypertension": { confidence: 92, recommendation: "Increase ACE inhibitor dosage, monitor renal function." },
    "Type 2 Diabetes": { confidence: 88, recommendation: "Metformin adjustment needed, check HbA1c levels." },
    "Asthma": { confidence: 95, recommendation: "Switch to long-acting beta-agonist, avoid environmental triggers." }
};

export default function DoctorIntelligenceCenter() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [aiInsight, setAiInsight] = useState("");
    const [activeTab, setActiveTab] = useState("overview");
    const [scanning, setScanning] = useState(true);

    const [heartRate, setHeartRate] = useState(72);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [pRes, aRes] = await Promise.all([
                    API.get("/patients"),
                    API.get("/appointments")
                ]);
                setPatients(Array.isArray(pRes.data) ? pRes.data : []);
                setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
                setScanning(false);
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

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${emergencyMode ? "bg-red-950/20" : "bg-transparent"}`}>
            
            {/* --- TOP HUD (Header) --- */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-10 relative">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full group-hover:bg-cyan-500/40 transition-all duration-500"></div>
                        <div className="w-20 h-20 rounded-3xl bg-slate-900 border-2 border-cyan-500/30 flex items-center justify-center relative z-10 overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                            <Brain size={40} className="text-cyan-400 animate-pulse" />
                            <div className="scanning-line"></div>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">COMMAND CENTER</span>
                            <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 font-black tracking-[0.2em] uppercase">Alpha v2.0</span>
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full animate-ping ${emergencyMode ? "bg-red-500" : "bg-cyan-500"}`}></div>
                            {emergencyMode ? "CRITICAL EMERGENCY STATUS ACTIVE" : "Neural Link Established • All Systems Optimal"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/40 backdrop-blur-3xl border border-white/5 p-2 rounded-[2rem] shadow-2xl">
                    {[
                        { icon: <Activity size={20} />, label: "Overview", id: "overview" },
                        { icon: <Users size={20} />, label: "Patients", id: "patients" },
                        { icon: <Brain size={20} />, label: "Neural AI", id: "ai" }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 ${activeTab === tab.id ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105" : "text-slate-500 hover:text-cyan-400 hover:bg-white/5"}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                    <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
                    <button 
                        onClick={() => setEmergencyMode(!emergencyMode)}
                        className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${emergencyMode ? "bg-red-600 shadow-[0_0_30px_rgba(220,38,38,0.6)] animate-pulse" : "bg-slate-800 text-slate-500 hover:text-red-500"}`}
                    >
                        <AlertTriangle size={24} />
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white text-[10px] px-3 py-1 rounded-md font-black whitespace-nowrap">TOGGLE EMERGENCY MODE</div>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                
                {/* --- MAIN INTELLIGENCE AREA (Col 8) --- */}
                <div className="xl:col-span-8 space-y-8">
                    
                    {/* --- STATS HUD --- */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { label: "Active Nodes", val: patients.length, sub: "Patients", icon: <Users size={24} />, color: "cyan" },
                            { label: "Consultations", val: appointments.length, sub: "Daily Queue", icon: <Calendar size={24} />, color: "purple" },
                            { label: "Critical Priority", val: highRiskPatients.length, sub: "Action Required", icon: <AlertTriangle size={24} />, color: "red", pulse: true },
                            { label: "Trust Index", val: "98.4", sub: "Patient Success", icon: <Sparkles size={24} />, color: "emerald" }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="hologram-card p-6 group cursor-pointer"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 mb-6 group-hover:scale-110 transition-transform ${stat.pulse ? "animate-pulse" : ""}`}>
                                    {stat.icon}
                                </div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h4 className="text-3xl font-black text-white">{stat.val}</h4>
                                <p className={`text-[10px] font-black text-${stat.color}-400/60 uppercase tracking-tighter mt-1`}>{stat.sub}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* --- LIVE TELEMETRY & APPOINTMENT TIMELINE --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Biometric Stream */}
                        <div className="hologram-card p-8 bg-slate-950/50">
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-white font-black tracking-tight flex items-center gap-3">
                                        <Activity size={20} className="text-cyan-400" /> LIVE NEURAL TELEMETRY
                                    </h3>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">Ward-wide biometric synchronization</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-black text-cyan-400">{heartRate}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase ml-2">BPM</span>
                                </div>
                            </div>
                            
                            <div className="h-48 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={PATIENT_LOAD_DATA}>
                                        <defs>
                                            <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area 
                                            type="monotone" 
                                            dataKey="load" 
                                            stroke="#06b6d4" 
                                            strokeWidth={4} 
                                            fill="url(#cyanGrad)" 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Heart size={80} className="text-cyan-500/5 animate-[pulse_2s_infinite]" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-8">
                                {[
                                    { label: "Sync Status", val: "Optimal", color: "text-cyan-400" },
                                    { label: "Neural Nodes", val: "128/128", color: "text-blue-400" },
                                    { label: "Packet Loss", val: "0.001%", color: "text-emerald-400" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                                        <p className={`text-xs font-black ${item.color}`}>{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Critical Triage Queue */}
                        <div className="hologram-card p-8 bg-slate-950/50">
                            <h3 className="text-white font-black tracking-tight flex items-center justify-between mb-8">
                                <span className="flex items-center gap-3"><Clock size={20} className="text-purple-400" /> PRIORITY TRIAGE</span>
                                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/20">NEXT 4 HOURS</span>
                            </h3>

                            <div className="space-y-4">
                                {highRiskPatients.slice(0, 4).map((patient, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-all group cursor-pointer">
                                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-red-500/30 p-0.5 relative">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${patient.name}`} alt="p" className="w-full h-full rounded-xl" />
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black text-white truncate">{patient.name}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter truncate">{patient.chronicConditions || "General Triage"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-white">14:30</p>
                                            <span className="text-[8px] font-black text-red-400 uppercase bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Critical</span>
                                        </div>
                                    </div>
                                ))}
                                {highRiskPatients.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-500 opacity-50">
                                        <Shield size={40} className="mb-3" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">No Critical Alerts</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- APPOINTMENT MAPPER --- */}
                    <div className="hologram-card p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                                    <Target size={22} className="text-indigo-400" /> APPOINTMENT TRAJECTORY
                                </h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Smart scheduling & load balance prediction</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
                            </div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={PATIENT_LOAD_DATA}>
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ background: '#0a1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="load" radius={[8, 8, 0, 0]}>
                                        {PATIENT_LOAD_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 3 ? '#818cf8' : '#312e81'} />
                                        ))}
                                    </Bar>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: '900'}} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* --- SIDEBAR INTELLIGENCE (Col 4) --- */}
                <div className="xl:col-span-4 space-y-8">
                    
                    {/* AI MEDICAL ASSISTANT PANEL */}
                    <div className="hologram-card p-8 bg-gradient-to-br from-indigo-500/10 to-purple-600/5 border-indigo-500/30">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-white font-black tracking-tight flex items-center gap-3">
                                <Brain size={24} className="text-indigo-400" /> JARVIS MEDICAL AI
                            </h3>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                        </div>

                        <div className="space-y-6 relative">
                            <div className="p-5 bg-slate-900/60 rounded-[2rem] border border-white/5 relative group">
                                <div className="absolute -top-3 -left-3 p-2 rounded-xl bg-indigo-600 text-white shadow-xl">
                                    <Sparkles size={16} />
                                </div>
                                <p className="text-[11px] font-bold text-slate-300 leading-relaxed">
                                    Scanning neural patterns... I have detected a 12% increase in respiratory complaints in Sector 4. Recommending proactive screening for upcoming consultation slots.
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Confidence Index</span>
                                        <span className="text-xs font-black text-white">94%</span>
                                    </div>
                                    <button className="text-[9px] font-black text-indigo-400 uppercase underline hover:text-white transition-colors">Generate Report</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { title: "Risk Prediction", val: "High", color: "rose" },
                                    { title: "Efficiency Delta", val: "+15.2%", color: "emerald" },
                                    { title: "Load Estimate", val: "Moderate", color: "amber" }
                                ].map((pred, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{pred.title}</span>
                                        <span className={`text-xs font-black text-${pred.color}-400 uppercase`}>{pred.val}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95">
                                INITIALIZE NEURAL SCAN
                            </button>
                        </div>
                    </div>

                    {/* LIVE WARD MONITOR */}
                    <div className="hologram-card p-8 bg-slate-950/50">
                        <h3 className="text-white font-black tracking-tight flex items-center gap-3 mb-8">
                            <Microscope size={22} className="text-emerald-400" /> UNIT TRACKER
                        </h3>
                        <div className="space-y-6">
                            {EMERGENCY_TRACKER.map(unit => (
                                <div key={unit.id} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-300">{unit.label}</span>
                                        <span className={unit.status === 'Critical' ? 'text-red-400' : 'text-emerald-400'}>{unit.status}</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${unit.level}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full ${unit.status === 'Critical' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QUICK ACTIONS HUD */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: <Plus />, label: "Add Record" },
                            { icon: <MessageSquare />, label: "Dispatch" },
                            { icon: <FlaskConical />, label: "Lab Test" },
                            { icon: <Power />, label: "Log Out", red: true }
                        ].map((action, i) => (
                            <button 
                                key={i}
                                className={`p-6 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-4 transition-all duration-300 group ${action.red ? 'hover:bg-red-500/10 hover:border-red-500/20 text-red-500/50 hover:text-red-500' : 'bg-slate-900/40 hover:bg-cyan-500/10 hover:border-cyan-500/20 text-slate-500 hover:text-cyan-400 hover:scale-105'}`}
                            >
                                <div className="p-3 rounded-2xl bg-white/5 group-hover:bg-current/10 transition-colors">
                                    {action.icon}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Feature 1: Telemedicine Hub */}
                    <div className="hologram-card p-8 border-cyan-500/30 bg-cyan-500/5">
                        <h3 className="text-white font-black tracking-tight flex items-center gap-3 mb-6 uppercase text-sm">
                            <Target size={20} className="text-cyan-400" /> Telemedicine Hub
                        </h3>
                        <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-cyan-500/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-white uppercase">Active Session: #092</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Waiting: Patient Sarah J.</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyan-600 transition-colors shadow-lg shadow-cyan-500/20">
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SCANNING OVERLAY --- */}
            <AnimatePresence>
                {scanning && (
                    <motion.div 
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
                            <Brain size={48} className="absolute inset-0 m-auto text-cyan-400 animate-pulse" />
                        </div>
                        <h2 className="text-xl font-black text-white tracking-[0.5em] mt-8 animate-pulse">INITIALIZING NEURAL LINK</h2>
                        <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] mt-2">SECURE DOCTOR CREDENTIALS VERIFIED</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
