import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, CheckCircle, AlertTriangle, Clock, 
  FlaskConical, Send, Shield, Zap, Search,
  Box, ChevronRight, Activity, Filter
} from "lucide-react";

export default function PharmacyDashboard() {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await API.get("/pharmacy/prescriptions");
            setPrescriptions(res.data);
        } catch (error) {
            console.error("Link Failure", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await API.post("/pharmacy/verify", { prescriptionId: id });
            setActionMsg("PROTOCOL AUTHORIZED: Compound dispensed for billing.");
            fetchPending();
            setTimeout(() => setActionMsg(""), 5000);
        } catch (error) {
            setActionMsg("AUTHORIZATION FAILED: System Override Required.");
        }
    };

    const filtered = prescriptions.filter(p => 
        p.id.toString().includes(searchTerm) || 
        p.patientId?.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10 selection:bg-emerald-500/30">
            {/* Header */}
            <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-3">
                        <FlaskConical className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Biochemical Authorization Stream</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">
                        PHARMACY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">CORE</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{prescriptions.length} Active Protocols</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4 w-full xl:w-auto">
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400/50" />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Identify Protocol ID..." 
                            className="w-full bg-slate-900 border border-white/5 rounded-xl pl-12 pr-4 py-4 text-xs text-white focus:outline-none focus:border-emerald-500/30 transition-all font-bold"
                        />
                    </div>
                    <div className="w-14 h-14 glass-card flex items-center justify-center text-emerald-400">
                        <Filter className="w-6 h-6" />
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {actionMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-[0_0_40px_rgba(16,185,129,0.1)]"
                    >
                        <Shield className="w-6 h-6" /> {actionMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Queue */}
                <div className="xl:col-span-8 space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                            <Activity className="w-10 h-10 animate-spin-slow text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Uplink...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-32 text-center glass-card border-white/5 flex flex-col items-center justify-center gap-4 grayscale opacity-30">
                            <Box className="w-12 h-12" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">All Protocols Authorized</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filtered.map((p, i) => (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={p.id} 
                                    className="glass-card p-8 border-white/5 hover:border-emerald-500/20 group transition-all"
                                >
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-all">
                                                    <FlaskConical className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Protocol #{p.id}</h3>
                                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest border border-amber-500/20 rounded-full">Pending Authorization</span>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Received: {new Date(p.createdAt).toLocaleString()}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {p.items?.map((item, idx) => (
                                                    <div key={idx} className="p-4 bg-slate-950/50 border border-white/5 rounded-xl group/med hover:bg-emerald-500/5 transition-all">
                                                        <p className="text-xs font-black text-white uppercase mb-1">{item.medicineName}</p>
                                                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                                                            <span>{item.dosage}</span>
                                                            <span className="text-emerald-400/50 italic">{item.days} Days Cycle</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-between items-end gap-6">
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Subject Vector</p>
                                                <p className="text-lg font-black text-white uppercase italic tracking-tighter">PID-{p.patientId}</p>
                                            </div>
                                            <button 
                                                onClick={() => handleVerify(p.id)}
                                                className="w-full lg:w-auto px-10 py-5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                            >
                                                <Send className="w-4 h-4" /> AUTHORIZE COMPOUND
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Intelligence Side Column */}
                <div className="xl:col-span-4 space-y-8">
                    {/* Inventory Status */}
                    <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
                        <div className="absolute inset-0 scanline opacity-10" />
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-2 italic">
                            <Box className="w-4 h-4 text-emerald-400" /> Inventory Integrity
                        </h4>
                        <div className="space-y-6">
                            {[
                                { label: 'Critical Antibiotics', val: 92, color: 'bg-emerald-500' },
                                { label: 'Trauma Resuscitation', val: 45, color: 'bg-amber-500' },
                                { label: 'Neuro Blockers', val: 78, color: 'bg-blue-500' }
                            ].map((inv, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                        <span className="text-slate-400">{inv.label}</span>
                                        <span className="text-white">{inv.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${inv.val}%` }} className={`h-full ${inv.color}`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Protocols */}
                    <div className="glass-card p-8 border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
                            <Shield className="w-4 h-4 text-blue-400" /> Security Standards
                        </h4>
                        <div className="space-y-4">
                            {[
                                'Biometric Signature Appended',
                                'Cold Chain Verification Active',
                                'DEA Compliance Synchronized'
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02] z-[100]" />
        </div>
    );
}
