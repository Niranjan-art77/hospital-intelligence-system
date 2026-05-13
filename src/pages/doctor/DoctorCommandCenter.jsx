import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Clock, FileText, Pill, AlertCircle,
    TrendingUp, Activity, Brain, Shield, Bell, LogOut,
    User, Search, Filter, Plus, ChevronRight, Zap,
    Target, BarChart3, Stethoscope, Heart, MessageSquare,
    DollarSign, CheckCircle, XCircle, MoreVertical,
    Send, Info, Sparkles, Pill, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function DoctorCommandCenter({ activeTab: propTab }) {
    const { user, logout } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState(propTab || 'overview');
    const [loading, setLoading] = useState(true);
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [consultation, setConsultation] = useState({ 
        problem: "", 
        resolution: "", 
        billingAmount: 500,
        medicines: [{ medicineName: "", dosage: "", morning: true, afternoon: false, night: true }]
    });
    const [showProfile, setShowProfile] = useState(false);
    const [bills, setBills] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pRes, aRes, bRes] = await Promise.all([
                API.get("/patients"),
                API.get("/appointments"),
                API.get("/billing/all")
            ]);
            setPatients(pRes.data || []);
            setAppointments(aRes.data || []);
            setBills(bRes.data || []);
        } catch (err) {
            console.error("Link failure", err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsultationSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) return addToast({ type: "error", title: "ERROR", message: "No patient selected." });
        
        try {
            setLoading(true);
            // 1. Create Billing Record
            if (consultation.billingAmount > 0) {
                await API.post("/billing/add", {
                    patientId: selectedPatient.id,
                    amount: consultation.billingAmount,
                    description: `Consultation + Pharmacy Protocol: ${consultation.resolution}`
                });
            }

            // 2. Create Prescription if medicines added
            const validMeds = consultation.medicines.filter(m => m.medicineName && m.dosage);
            if (validMeds.length > 0) {
                await API.post("/prescriptions/add", {
                    patientId: selectedPatient.id,
                    doctorId: user?.id || 1,
                    diagnosis: consultation.problem,
                    notes: consultation.resolution,
                    items: validMeds
                });
            }

            addToast({
                type: "success",
                title: "CONSULTATION RESOLVED",
                message: "Biometric protocols updated and billing dispatched."
            });
            setConsultation({ 
                problem: "", 
                resolution: "", 
                billingAmount: 500,
                medicines: [{ medicineName: "", dosage: "", morning: true, afternoon: false, night: true }]
            });
            setActiveTab('overview');
            fetchData();
        } catch (err) {
            addToast({ type: "error", title: "UPLINK FAILED", message: "Could not finalize consultation." });
        } finally {
            setLoading(false);
        }
    };

    const addMedicine = () => {
        setConsultation({
            ...consultation,
            medicines: [...consultation.medicines, { medicineName: "", dosage: "", morning: true, afternoon: false, night: true }]
        });
    };

    const removeMedicine = (index) => {
        const newMeds = [...consultation.medicines];
        newMeds.splice(index, 1);
        setConsultation({ ...consultation, medicines: newMeds });
    };

    const updateMedicine = (index, field, value) => {
        const newMeds = [...consultation.medicines];
        newMeds[index][field] = value;
        setConsultation({ ...consultation, medicines: newMeds });
    };

    const solvedCases = appointments.filter(a => a.status === 'COMPLETED').length;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 relative">
                    <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-black text-white tracking-[0.5em] animate-pulse">SYNCHRONIZING NEURAL HUB</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col">
            {/* Background HUD Layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 medical-grid opacity-[0.03]" />
                <div className="absolute inset-0 scanline opacity-[0.02]" />
            </div>

            {/* Top Navigation HUD */}
            <header className="h-20 border-b border-white/5 backdrop-blur-xl bg-slate-950/40 px-10 flex items-center justify-between z-20 sticky top-0">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">NOVA <span className="text-cyan-400">HEALTH</span></h1>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Specialty: {user?.specialty || "General Medicine"}</p>
                        </div>
                    </div>
                    <div className="hidden lg:flex items-center gap-6 border-l border-white/10 pl-8">
                        {['OVERVIEW', 'CONSULTATION', 'BIO-PROFILES', 'SCHEDULE', 'BILLING'].map((t) => (
                            <button 
                                key={t}
                                onClick={() => setActiveTab(t.toLowerCase().replace(' ', '').replace('-', ''))}
                                className={`text-[10px] font-black tracking-widest transition-all ${
                                    activeTab === t.toLowerCase().replace(' ', '').replace('-', '') ? 'text-cyan-400 border-b border-cyan-400' : 'text-slate-500 hover:text-white'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white uppercase">{user?.fullName}</p>
                            <div className="flex items-center gap-1 justify-end">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-emerald-400 uppercase">{user?.specialty || "Synchronized"}</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-400 font-black">
                            {user?.fullName?.[0]}
                        </div>
                    </div>
                    <button onClick={logout} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                        <LogOut size={18} />
                    </button>
                </div>
            </header>

            <main className="flex-1 p-10 overflow-y-auto custom-scroll relative z-10">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-10"
                        >
                            {/* Hero Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {[
                                    { label: "Active Subjects", val: patients.length, icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                                    { label: "Pending Slots", val: appointments.filter(a => a.status === 'PENDING').length, icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" },
                                    { label: "Cases Solved", val: solvedCases, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                                    { label: "Revenue Node", val: "₹45.2k", icon: DollarSign, color: "text-purple-400", bg: "bg-purple-400/10" }
                                ].map((stat, i) => (
                                    <div key={i} className="glass-card p-8 border-white/5 relative group hover:border-white/10 transition-all">
                                        <div className="hud-corner top-left opacity-20" />
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                                                <stat.icon size={24} />
                                            </div>
                                            <TrendingUp size={16} className="text-emerald-500" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{stat.val}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-8 glass-card p-10 border-white/5">
                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                            <Activity className="text-cyan-400" /> Neural Activity Stream
                                        </h3>
                                        <div className="flex gap-2">
                                            <button className="px-4 py-2 bg-white/5 rounded-lg text-[9px] font-black uppercase text-slate-400 hover:text-white">Day</button>
                                            <button className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-[9px] font-black uppercase text-cyan-400">Week</button>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={appointments.slice(-7)}>
                                                <defs>
                                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="appointmentTime" hide />
                                                <YAxis stroke="#475569" fontSize={10} fontVariant="all-small-caps" />
                                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                                                <Area type="monotone" dataKey="id" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Urgent Actions */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="glass-card p-8 border-rose-500/20 bg-rose-500/5">
                                        <h4 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                            <AlertCircle size={14} /> Critical Triage Queue
                                        </h4>
                                        <div className="space-y-4">
                                            {patients.filter(p => p.riskLevel === 'HIGH').slice(0, 3).map((p, i) => (
                                                <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-rose-500/20 p-0.5">
                                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="P" className="w-full h-full rounded-xl" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase">{p.name}</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase">Emergency Sector-G</p>
                                                    </div>
                                                    <ChevronRight size={14} className="ml-auto text-slate-600" />
                                                </div>
                                            ))}
                                            {patients.filter(p => p.riskLevel === 'HIGH').length === 0 && (
                                                <p className="text-[10px] text-slate-600 italic text-center py-4">No critical subjects detected.</p>
                                            )}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setActiveTab('consultation')}
                                        className="w-full py-6 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-3xl text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                    >
                                        <Stethoscope size={18} /> Open Consultation HUD
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'consultation' && (
                        <motion.div 
                            key="consultation"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                        >
                            <div className="lg:col-span-8 space-y-8">
                                <div className="glass-card p-10 border-cyan-500/20">
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic mb-10 flex items-center gap-4">
                                        <Stethoscope className="text-cyan-400" /> ACTIVE CONSULTATION VECTOR
                                    </h3>
                                    
                                    <form onSubmit={handleConsultationSubmit} className="space-y-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Neural Subject</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/50" />
                                                <select 
                                                    onChange={(e) => setSelectedPatient(patients.find(p => p.id === e.target.value))}
                                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-5 text-white font-bold appearance-none cursor-pointer focus:border-cyan-500/50 transition-all"
                                                >
                                                    <option value="">-- Identify Subject --</option>
                                                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Complaint / Symptoms</label>
                                            <textarea 
                                                value={consultation.problem}
                                                onChange={(e) => setConsultation({...consultation, problem: e.target.value})}
                                                placeholder="Ask patient about their problem..."
                                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-white text-sm font-medium focus:border-cyan-500/50 transition-all min-h-[120px]"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clinical Resolution / Advice</label>
                                            <textarea 
                                                value={consultation.resolution}
                                                onChange={(e) => setConsultation({...consultation, resolution: e.target.value})}
                                                placeholder="Provide resolution or treatment advice..."
                                                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-6 text-white text-sm font-medium focus:border-emerald-500/50 transition-all min-h-[120px]"
                                            />
                                        </div>

                                        {/* Biochemical Prescription Section */}
                                        <div className="space-y-6 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Pill size={14} /> Biochemical Protocol
                                                </h4>
                                                <button 
                                                    type="button" 
                                                    onClick={addMedicine}
                                                    className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase rounded-xl hover:bg-cyan-500/20 transition-all"
                                                >
                                                    + Add Compound
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {consultation.medicines.map((med, idx) => (
                                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-5 bg-slate-950/50 rounded-2xl border border-white/5 group/med hover:border-cyan-500/20 transition-all">
                                                        <div className="md:col-span-5">
                                                            <input 
                                                                placeholder="Medicine Name"
                                                                className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                                                                value={med.medicineName}
                                                                onChange={(e) => updateMedicine(idx, 'medicineName', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3">
                                                            <input 
                                                                placeholder="Dosage (e.g. 500mg)"
                                                                className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                                                                value={med.dosage}
                                                                onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="md:col-span-3 flex items-center gap-4 px-2">
                                                            {['M', 'A', 'N'].map((time, tIdx) => (
                                                                <button 
                                                                    key={time}
                                                                    type="button"
                                                                    onClick={() => updateMedicine(idx, tIdx === 0 ? 'morning' : tIdx === 1 ? 'afternoon' : 'night', !med[tIdx === 0 ? 'morning' : tIdx === 1 ? 'afternoon' : 'night'])}
                                                                    className={`w-6 h-6 rounded-lg text-[8px] font-black transition-all border ${
                                                                        med[tIdx === 0 ? 'morning' : tIdx === 1 ? 'afternoon' : 'night'] 
                                                                        ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                                                                        : 'bg-slate-900 border-white/10 text-slate-500'
                                                                    }`}
                                                                >
                                                                    {time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className="md:col-span-1 flex items-center justify-end">
                                                            {consultation.medicines.length > 1 && (
                                                                <button type="button" onClick={() => removeMedicine(idx)} className="text-slate-600 hover:text-rose-500">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Billing Authorization (₹)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
                                                    <input 
                                                        type="number"
                                                        value={consultation.billingAmount}
                                                        onChange={(e) => setConsultation({...consultation, billingAmount: e.target.value})}
                                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-white font-black"
                                                        placeholder="500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-end">
                                                <button 
                                                    type="submit"
                                                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                                >
                                                    <CheckCircle size={18} /> FINALIZE & DISPATCH PROTOCOL
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                {selectedPatient ? (
                                    <div className="glass-card p-10 border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden">
                                        <div className="hud-corner top-right" />
                                        <div className="flex flex-col items-center text-center space-y-6">
                                            <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-cyan-500/30 p-1 relative">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedPatient.name}`} alt="P" className="w-full h-full rounded-2xl" />
                                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center">
                                                    <Activity size={12} className="text-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-white uppercase italic">{selectedPatient.name}</h4>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bio-Profile ID: {selectedPatient.id?.slice(0,8)}</p>
                                            </div>
                                            
                                            <div className="w-full grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Blood Vector</p>
                                                    <p className="text-sm font-black text-cyan-400">{selectedPatient.bloodGroup || 'O+'}</p>
                                                </div>
                                                <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Heart Pulse</p>
                                                    <p className="text-sm font-black text-rose-400">72 BPM</p>
                                                </div>
                                            </div>

                                            <div className="w-full space-y-4 text-left">
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Chronic Conditions</p>
                                                    <p className="text-[10px] font-bold text-white uppercase">{selectedPatient.chronicConditions || 'None Reported'}</p>
                                                </div>
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                                    <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Allergies</p>
                                                    <p className="text-[10px] font-bold text-amber-400 uppercase">{selectedPatient.allergies || 'No Contraindications'}</p>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={() => setShowProfile(true)}
                                                className="text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] border-b border-cyan-400/20 hover:border-cyan-400 transition-all pb-1"
                                            >
                                                View Full Bio-Archive
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center glass-card border-white/5 grayscale opacity-20 p-10 text-center">
                                        <Brain size={64} className="mb-6" />
                                        <p className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Subject Synchronization...</p>
                                    </div>
                                )}

                                <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5">
                                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <Zap size={14} /> AI Clinical Insights
                                    </h4>
                                    <p className="text-[11px] text-slate-300 font-medium leading-relaxed italic">
                                        "Based on the patient's history and current biometrics, there is a 12% probability of a secondary inflammation node. Suggest monitoring renal markers."
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'bioprofiles' && (
                        <motion.div 
                            key="profiles"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-10"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Subject <span className="text-cyan-400">Database</span></h2>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Search subjects..." 
                                        className="bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/50 transition-all w-80"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {patients.map((p, i) => (
                                    <div 
                                        key={i} 
                                        onClick={() => { setSelectedPatient(p); setShowProfile(true); }}
                                        className="glass-card p-6 border-white/5 group hover:border-cyan-500/30 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="hud-corner top-left opacity-10" />
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5">
                                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="P" className="w-full h-full rounded-xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-white uppercase">{p.name}</h4>
                                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Age: {p.age || '??'}</p>
                                            </div>
                                            <div className={`ml-auto w-2 h-2 rounded-full ${p.riskLevel === 'HIGH' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'billing' && (
                        <motion.div 
                            key="billing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Financial <span className="text-amber-400">Ledger</span></h2>
                            
                            <div className="glass-card overflow-hidden border-white/5">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/5">
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol ID</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {bills.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-10 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">No active billing nodes detected</td>
                                            </tr>
                                        ) : (
                                            bills.map((bill, i) => (
                                                <tr key={i} className="hover:bg-white/5 transition-all group">
                                                    <td className="px-8 py-6 text-xs font-black text-white">TX-{bill.id}</td>
                                                    <td className="px-8 py-6 text-xs font-black text-slate-300">{patients.find(p => p.id === bill.patientId)?.name || bill.patientId}</td>
                                                    <td className="px-8 py-6 text-xs font-black text-amber-400">₹{bill.amount}</td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                            bill.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                                        }`}>
                                                            {bill.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        {bill.status === 'PENDING' && (
                                                            <button 
                                                                onClick={async () => {
                                                                    try {
                                                                        await API.post(`/billing/pay/${bill.id}`, { method: 'NEURAL_LINK' });
                                                                        addToast({ type: "success", title: "PAYMENT AUTHORIZED", message: "Transaction completed successfully." });
                                                                        fetchData();
                                                                    } catch (e) {
                                                                        addToast({ type: "error", title: "AUTH FAILURE", message: "Could not process payment." });
                                                                    }
                                                                }}
                                                                className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[8px] font-black text-amber-400 uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                                                            >
                                                                Settle Node
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'schedule' && (
                        <motion.div 
                            key="schedule"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-10"
                        >
                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Clinical <span className="text-blue-400">Schedule</span></h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {appointments.map((apt, i) => (
                                    <div key={i} className="glass-card p-8 border-white/5 relative group">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                                <Clock size={20} />
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                                apt.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {apt.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{new Date(apt.appointmentTime).toLocaleDateString()}</p>
                                        <h4 className="text-lg font-black text-white uppercase italic mb-4">{new Date(apt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</h4>
                                        
                                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl mb-6">
                                            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-[10px] font-black text-cyan-400">
                                                {apt.patientName?.[0] || 'P'}
                                            </div>
                                            <p className="text-xs font-black text-slate-300 uppercase">{apt.patientName || `Subject ${apt.patientId?.slice(0,4)}`}</p>
                                        </div>

                                        <button 
                                            onClick={() => { setSelectedPatient(patients.find(p => p.id === apt.patientId) || {id: apt.patientId, name: apt.patientName}); setActiveTab('consultation'); }}
                                            className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-cyan-500/20 hover:text-white transition-all"
                                        >
                                            Initialize Uplink
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Profile Modal Overlay */}
            <AnimatePresence>
                {showProfile && selectedPatient && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-10"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-[#020617] border border-white/10 rounded-[3rem] w-full max-w-5xl h-[80vh] overflow-hidden flex shadow-2xl shadow-cyan-500/10"
                        >
                            <div className="w-1/3 bg-slate-900/50 border-r border-white/5 p-12 flex flex-col items-center text-center">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-slate-950 border border-cyan-500/30 p-1 mb-8 shadow-2xl shadow-cyan-500/10">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedPatient.name}`} alt="P" className="w-full h-full rounded-[2rem]" />
                                </div>
                                <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic mb-2">{selectedPatient.name}</h3>
                                <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.4em] mb-10">Subject PID-{selectedPatient.id?.slice(0,8)}</p>
                                
                                <div className="w-full space-y-4">
                                    <div className="p-6 bg-slate-950 rounded-3xl border border-white/5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Neural Status</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                            <span className="text-sm font-black text-white uppercase italic">Stable Condition</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Bio-Sector</p>
                                            <p className="text-[10px] font-black text-white uppercase italic">Sector 7-G</p>
                                        </div>
                                        <div className="p-4 bg-slate-950 rounded-2xl border border-white/5">
                                            <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Access Level</p>
                                            <p className="text-[10px] font-black text-white uppercase italic">Class-A</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => setShowProfile(false)}
                                    className="mt-auto w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Terminate Bio-Link
                                </button>
                            </div>

                            <div className="flex-1 p-12 overflow-y-auto custom-scroll space-y-12">
                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-4">
                                        <span className="w-10 h-px bg-white/5" /> Biometric Analysis Hub
                                    </h4>
                                    <div className="grid grid-cols-3 gap-6">
                                        {[
                                            { label: 'O2 Saturation', val: '98%', color: 'text-cyan-400' },
                                            { label: 'Core Temp', val: '98.6°F', color: 'text-emerald-400' },
                                            { label: 'Metabolic Node', val: 'Stable', color: 'text-purple-400' }
                                        ].map((m, i) => (
                                            <div key={i} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 relative group">
                                                <div className="hud-corner top-left opacity-20" />
                                                <p className="text-[8px] font-black text-slate-500 uppercase mb-2">{m.label}</p>
                                                <p className={`text-xl font-black ${m.color} italic tracking-tighter`}>{m.val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-4">
                                        <span className="w-10 h-px bg-white/5" /> Clinical Timeline
                                    </h4>
                                    <div className="space-y-4">
                                        {[
                                            { date: 'MAY 12, 2024', event: 'Biometric Drift Detected', type: 'System Alert' },
                                            { date: 'APR 28, 2024', event: 'Neural Scan Initialized', type: 'Clinical Procedure' },
                                            { date: 'MAR 15, 2024', event: 'Metabolic Baseline Set', type: 'Initial Sync' }
                                        ].map((e, i) => (
                                            <div key={i} className="flex items-center justify-between p-6 bg-slate-900/40 rounded-2xl border border-white/5 hover:border-cyan-500/20 transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-150 transition-all shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                                    <div>
                                                        <p className="text-[8px] font-black text-slate-600 uppercase mb-1">{e.date}</p>
                                                        <p className="text-sm font-black text-white uppercase italic">{e.event}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase italic opacity-50">{e.type}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-10 right-10 z-50">
                <button className="w-16 h-16 bg-cyan-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-cyan-600/40 hover:scale-110 active:scale-95 transition-all">
                    <Sparkles size={24} />
                </button>
            </div>
        </div>
    );
}
