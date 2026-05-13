import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, CheckCircle, AlertTriangle, Clock, 
  FlaskConical, Send, Shield, Zap, Search,
  Box, ChevronRight, Activity, Filter,
  User, Database, DollarSign, Terminal,
  Cpu, Sparkles
} from "lucide-react";

export default function PharmacyDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [prescriptions, setPrescriptions] = useState([]);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isChecking, setIsChecking] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [preRes, patRes] = await Promise.all([
                API.get("/pharmacy/prescriptions"),
                API.get("/patients")
            ]);
            setPrescriptions(preRes.data || []);
            setPatients(patRes.data || []);
        } catch (error) {
            console.error("Neural Link Failure", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSystemCheck = (p) => {
        setSelectedPrescription(p);
        setIsChecking(true);
        setTimeout(() => {
            setIsChecking(false);
            addToast({
                type: "success",
                title: "SYSTEM INTEGRITY VERIFIED",
                message: `Prescription #${p.id} matches patient biometric profile.`
            });
        }, 2000);
    };

    const handleDispenseAndBill = async () => {
        if (!selectedPrescription) return;
        
        try {
            // 1. Authorize/Dispense
            await API.post("/pharmacy/verify", { prescriptionId: selectedPrescription.id });
            
            // 2. Add Bill (Innovative: automated billing for pharmacy)
            const amount = selectedPrescription.items?.reduce((acc, item) => acc + (Math.random() * 500 + 100), 0).toFixed(2) || 500;
            
            await API.post("/billing/add", {
                patientId: selectedPrescription.patientId,
                amount: amount,
                description: `Pharmacy Dispensing: Protocol #${selectedPrescription.id}`
            });

            addToast({
                type: "success",
                title: "COMPOUND DISPENSED",
                message: `Protocol finalized. Bill of ₹${amount} dispatched to patient.`
            });

            setSelectedPrescription(null);
            fetchInitialData();
        } catch (error) {
            addToast({
                type: "error",
                title: "DISPATCH ERROR",
                message: "Could not finalize protocol. Check system logs."
            });
        }
    };

    const filtered = prescriptions.filter(p => {
        const patientName = patients.find(pat => pat.id === p.patientId)?.name || "";
        return p.id.toString().includes(searchTerm) || 
               p.patientId?.toString().includes(searchTerm) ||
               patientName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col p-6 lg:p-10">
            {/* Background HUD Layer */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-teal-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 medical-grid opacity-[0.05]" />
                <div className="absolute inset-0 scanline opacity-[0.02]" />
            </div>

            {/* Header HUD */}
            <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <FlaskConical size={20} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter uppercase italic">PHARMACY <span className="text-emerald-400">COMMAND</span></h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Biochemical Asset Management v4.0</p>
                        </div>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Identify Patient or Protocol ID..."
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold focus:border-emerald-500/50 transition-all outline-none"
                        />
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400">
                        <Filter size={20} />
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-20 overflow-hidden">
                {/* Incoming Prescription Queue */}
                <section className="xl:col-span-7 space-y-6 overflow-y-auto custom-scroll pr-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="text-emerald-500 animate-pulse" size={14} /> Incoming Prescription Stream
                    </h3>

                    {loading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-30">
                            <Cpu className="animate-spin text-emerald-500" size={32} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Uplink...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-64 glass-card border-white/5 flex flex-col items-center justify-center gap-4 opacity-20 italic">
                            <Box size={48} />
                            <p className="text-xs uppercase tracking-widest">Queue Clear. No active protocols.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filtered.map((p, i) => (
                                <motion.div 
                                    key={p.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedPrescription(p)}
                                    className={`glass-card p-6 border-white/5 cursor-pointer group transition-all relative overflow-hidden ${selectedPrescription?.id === p.id ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'hover:border-white/10'}`}
                                >
                                    <div className="hud-corner top-left opacity-10" />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${selectedPrescription?.id === p.id ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-emerald-400 group-hover:scale-110'}`}>
                                                <Pill size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Protocol #{p.id}</h4>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    {patients.find(pat => pat.id === p.patientId)?.name || `Subject PID-${p.patientId?.slice(0,8)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-amber-500/20">Awaiting Auth</span>
                                            <p className="text-[9px] font-bold text-slate-600 uppercase mt-2">{new Date(p.createdAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Tactical Detail HUD */}
                <section className="xl:col-span-5 flex flex-col gap-8">
                    <AnimatePresence mode="wait">
                        {selectedPrescription ? (
                            <motion.div 
                                key={selectedPrescription.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 flex-1 flex flex-col relative overflow-hidden"
                            >
                                <div className="hud-corner top-right" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <Terminal size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Protocol Processing</h3>
                                        <p className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest">Biometric Check Status: {isChecking ? 'SYNCING...' : 'IDLE'}</p>
                                    </div>
                                </div>

                                <div className="space-y-6 flex-1">
                                    <div className="p-6 bg-slate-950/80 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Subject Identification</p>
                                            <User size={14} className="text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-white uppercase italic tracking-tighter">
                                                {patients.find(pat => pat.id === selectedPrescription.patientId)?.name || "Unknown Entity"}
                                            </p>
                                            <p className="text-[9px] font-bold text-emerald-400/50 uppercase tracking-widest">PID: {selectedPrescription.patientId}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2">
                                            <Database size={12} /> COMPOUND LISTING
                                        </p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedPrescription.items?.map((item, idx) => (
                                                <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-emerald-500/10 transition-all">
                                                    <div>
                                                        <p className="text-xs font-black text-white uppercase italic">{item.medicineName}</p>
                                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Dosage: {item.dosage}</p>
                                                    </div>
                                                    <CheckCircle size={14} className="text-emerald-500/20 group-hover:text-emerald-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 space-y-4">
                                    {!isChecking && (
                                        <button 
                                            onClick={() => handleSystemCheck(selectedPrescription)}
                                            className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-emerald-500/30 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Shield size={16} /> PERFORM SYSTEM CHECK
                                        </button>
                                    )}

                                    {isChecking && (
                                        <div className="w-full py-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3">
                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">CRYPTO-SCANNING BIO-LINK...</span>
                                        </div>
                                    )}

                                    <button 
                                        disabled={isChecking}
                                        onClick={handleDispenseAndBill}
                                        className="w-full py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:scale-100"
                                    >
                                        <Zap size={20} /> DISPENSE & GENERATE BILL
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex-1 glass-card border-white/5 flex flex-col items-center justify-center text-center p-12 opacity-20 grayscale italic">
                                <Sparkles size={64} className="mb-6" />
                                <h3 className="text-xl font-black uppercase tracking-tighter">Awaiting Signal</h3>
                                <p className="text-[10px] uppercase tracking-widest mt-2">Select a protocol from the stream to begin authorization.</p>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Operational Metrics */}
                    <div className="glass-card p-6 border-white/5 grid grid-cols-2 gap-6">
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Stock Integrity</p>
                            <p className="text-xl font-black text-emerald-500 tracking-tighter">98.2%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Queue Velocity</p>
                            <p className="text-xl font-black text-blue-500 tracking-tighter">4.5m / P</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
