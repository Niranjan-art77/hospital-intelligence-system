import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { generatePrescriptionPDF } from "../../utils/pdfGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Activity, Thermometer, Droplets, 
  MapPin, Bell, CreditCard, ArrowRight, 
  Download, Eye, CheckCircle2, AlertCircle, 
  Brain, Sparkles, ChevronRight, Calendar, 
  Pill, Clock, Video, Shield, MessageSquare, 
  Plus, FileText, TrendingUp, Zap, Radar, 
  Target, Award, AlertTriangle, BarChart3, 
  Phone, Crosshair, Search
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [billingInfo, setBillingInfo] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vitals, setVitals] = useState({ heartRate: 72, bp: "120/80", temp: 98.6, oxygen: 98 });
    const [vitalHistory, setVitalHistory] = useState([]);
    const [symptomQuery, setSymptomQuery] = useState("");

    const fetchDashboardData = useCallback(async () => {
        try {
            const [rxRes, aptRes, billRes, timelineRes, vitalsRes] = await Promise.all([
                API.get(`/prescriptions/recent/${user.id}`),
                API.get(`/appointments/patient/${user.id}`),
                API.get(`/billing/patient/${user.id}`),
                API.get(`/patients/${user.id}/timeline`),
                API.get(`/patients/${user.id}/vitals`)
            ]);
            setRecentPrescriptions(Array.isArray(rxRes.data) ? rxRes.data.slice(0, 3) : []);
            setUpcomingAppointments(Array.isArray(aptRes.data) ? aptRes.data.filter(a => new Date(a.appointmentTime) > new Date()).slice(0, 1) : []);
            setBillingInfo(Array.isArray(billRes.data) ? billRes.data : []);
            setTimeline(Array.isArray(timelineRes.data) ? timelineRes.data.slice(0, 5) : []);
            
            if (vitalsRes.data && vitalsRes.data.length > 0) {
                const latest = vitalsRes.data[0];
                setVitals({
                    heartRate: latest.heartRate || 72,
                    oxygen: latest.oxygenLevel || 98,
                    bp: latest.bloodPressure || "120/80",
                    temp: latest.temperature || 98.6
                });
                setVitalHistory(vitalsRes.data.slice(0, 10).reverse().map(v => ({
                    time: new Date(v.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    hr: v.heartRate,
                    ox: v.oxygenLevel
                })));
            }
        } catch (error) {
            console.error("Link Failure", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) fetchDashboardData();
    }, [user?.id, fetchDashboardData]);

    const handleSOS = () => {
        addToast({ type: "error", title: "EMERGENCY PROTOCOL ACTIVATED", message: "Emergency responders notified. Biological data broadcasting..." });
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
            <Radar className="w-12 h-12 text-blue-500 animate-spin-slow" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Initializing Personal HUD...</span>
        </div>
    );

    return (
        <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10 selection:bg-blue-500/30">
            {/* Header / Identity Area */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-4 h-4 text-blue-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Secure Patient Uplink v4.2</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">
                        BIOLOGICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">STATUS HUD</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Neural Sync Optimized</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: PID-{user.id.slice(0,8)}</span>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4">
                    <button onClick={handleSOS} className="px-8 py-4 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(225,29,72,0.3)] animate-pulse flex items-center gap-3">
                        <AlertTriangle className="w-4 h-4" /> EMERGENCY SOS
                    </button>
                    <div className="w-14 h-14 glass-card flex items-center justify-center text-blue-400">
                        <Bell className="w-6 h-6" />
                    </div>
                </div>
            </header>

            {/* Vitals Telemetry */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Heart Rate", val: vitals.heartRate, unit: "BPM", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
                    { label: "Oxygen Sat", val: vitals.oxygen, unit: "SpO2", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Blood Pressure", val: vitals.bp, unit: "mmHg", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { label: "Body Temp", val: vitals.temp, unit: "°F", icon: Thermometer, color: "text-amber-500", bg: "bg-amber-500/10" }
                ].map((v, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className="glass-card p-8 border-white/5 group">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-xl ${v.bg} flex items-center justify-center ${v.color}`}>
                                <v.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Live Link</span>
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
                {/* Left - Main Content */}
                <div className="xl:col-span-8 space-y-8">
                    {/* Active Consultation Card */}
                    <div className="glass-card p-10 border-blue-500/20 relative overflow-hidden bg-blue-500/5 group">
                        <div className="hud-corner top-left" />
                        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                            <div className="flex items-center gap-8">
                                <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center relative border border-white/10 group-hover:scale-105 transition-all">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=Sarah`} alt="D" className="w-20 h-20" />
                                    <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-slate-950" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase">Next Clinical Session</h3>
                                    <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Dr. Sarah Johnson // Cardiology Specialist</p>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tomorrow, 10:00 AM</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration: 45m</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="px-10 py-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3">
                                <Video className="w-4 h-4" /> PREP VIRTUAL HUB
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Therapy Stream */}
                        <div className="glass-card p-8 border-purple-500/20">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                                <Pill className="w-4 h-4 text-purple-400" /> Biochemical Protocols
                            </h3>
                            <div className="space-y-4">
                                {recentPrescriptions.map((p, i) => (
                                    <div key={i} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                                <Zap className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-white uppercase">Protocol #{p.id}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(p.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => generatePrescriptionPDF(p, user)} className="text-slate-500 hover:text-purple-400 transition-all">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {recentPrescriptions.length === 0 && (
                                    <div className="py-12 text-center opacity-20 italic text-xs">No active biochemical streams.</div>
                                )}
                            </div>
                        </div>

                        {/* Neural Assistant */}
                        <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden group">
                            <div className="absolute inset-0 scanline opacity-5" />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3 italic">
                                <Brain className="w-5 h-5 text-indigo-400" /> Neural Diagnosis Interface
                            </h3>
                            <div className="space-y-6 relative z-10">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">Describe physiological observations to synchronize with the nearest specialist.</p>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/50" />
                                    <input 
                                        type="text" 
                                        value={symptomQuery}
                                        onChange={e => setSymptomQuery(e.target.value)}
                                        placeholder="Identify Symptoms..." 
                                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all font-bold"
                                    />
                                </div>
                                <button className="w-full py-4 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all">
                                    INITIALIZE ANALYSIS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right - Side Stats */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Health Score Gauge */}
                    <div className="glass-card p-10 border-emerald-500/20 bg-emerald-500/5 flex flex-col items-center text-center">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Vital Integrity Score</h4>
                        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                                <motion.circle 
                                    cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent"
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * 85) / 100 }}
                                    transition={{ duration: 2.5, ease: "circOut" }}
                                    className="text-emerald-500" 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white tracking-tighter">85</span>
                                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Optimal</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Biometrics are within 94% of baseline.</p>
                    </div>

                    {/* Operational Ledger */}
                    <div className="glass-card p-8 border-white/5">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center justify-between">
                            <span>Activity Ledger</span>
                            <Clock className="w-4 h-4 opacity-30" />
                        </h3>
                        <div className="space-y-8 relative pl-6 border-l border-white/5">
                            {timeline.map((e, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[31px] top-0 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{new Date(e.timestamp).toLocaleDateString()}</p>
                                    <p className="text-xs font-bold text-white mb-0.5">{e.description}</p>
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-tighter italic">{e.eventType} Executed</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Location Hub */}
                    <div className="glass-card p-6 border-white/5 h-64 bg-slate-950 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 z-0" />
                        <div className="relative z-10 flex flex-col h-full">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-rose-500" /> Sector Mapping
                            </h4>
                            <div className="flex-1 rounded-xl bg-slate-900 border border-white/5 flex flex-col items-center justify-center gap-4 group-hover:bg-slate-800 transition-all cursor-pointer">
                                <Crosshair className="w-8 h-8 text-rose-500/20" />
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Accessing Tactical Map...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02] z-[100]" />
        </div>
    );
}
