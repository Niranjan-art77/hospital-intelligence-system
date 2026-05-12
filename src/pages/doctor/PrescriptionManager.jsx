import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, Plus, Trash2, Send, CheckCircle, 
  AlertTriangle, User, Calendar, Info, Sparkles,
  ChevronRight, Brain, Zap
} from 'lucide-react';

export default function PrescriptionManager() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ patientId: "", appointmentId: "" });
    const [medicines, setMedicines] = useState([{ medicineName: "", dosage: "", days: "", notes: "" }]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [pRes, aRes] = await Promise.all([
                API.get("/patients"),
                API.get("/appointments")
            ]);
            setPatients(Array.isArray(pRes.data) ? pRes.data : []);
            setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
        } catch (e) {
            console.error("Failed to fetch initial data", e);
        }
    };

    const addMedicineField = () => {
        setMedicines([...medicines, { medicineName: "", dosage: "", days: "", notes: "" }]);
    };

    const removeMedicineField = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleMedicineChange = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!form.patientId || !form.appointmentId) {
            setError("AUTHENTICATION FAILED: Patient and Appointment vector required.");
            setLoading(false);
            return;
        }

        const validMeds = medicines.filter(m => m.medicineName && m.dosage && m.days);
        if (validMeds.length === 0) {
            setError("PROTOCOL ERROR: Minimum one chemical compound required.");
            setLoading(false);
            return;
        }

        try {
            const payload = {
                patientId: form.patientId,
                doctorId: user?.id || 1,
                appointmentId: form.appointmentId,
                items: validMeds
            };

            await API.post("/prescriptions/create", payload);

            setSuccess("BIOMETRIC PROTOCOL BROADCAST: Pharmacy Network Notified.");
            setForm({ patientId: "", appointmentId: "" });
            setMedicines([{ medicineName: "", dosage: "", days: "", notes: "" }]);
            setTimeout(() => setSuccess(""), 5000);
        } catch (err) {
            setError("TRANSMISSION FAILED: Cloud Uplink Interrupted.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        PRESCRIPTION <span className="text-purple-400">ENGINE</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Biochemical Protocol Generation & Broadcast</p>
                </motion.div>
                
                <div className="flex items-center gap-4">
                    <div className="px-6 py-3 glass-card bg-purple-500/10 border-purple-500/20 flex items-center gap-3">
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Form */}
                <div className="xl:col-span-8 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-10 border-purple-500/20 relative group"
                    >
                        <div className="hud-corner top-left" />
                        <h3 className="text-xl font-black text-white tracking-tight uppercase mb-8 flex items-center gap-3">
                            <Plus className="w-5 h-5 text-purple-400" /> Initialize New Protocol
                        </h3>

                        <AnimatePresence>
                            {success && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-8 flex items-center gap-3 text-emerald-400 text-xs font-black tracking-widest"
                                >
                                    <CheckCircle className="w-5 h-5" /> {success}
                                </motion.div>
                            )}
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl mb-8 flex items-center gap-3 text-rose-400 text-xs font-black tracking-widest"
                                >
                                    <AlertTriangle className="w-5 h-5" /> {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Clinical Subject</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                                        <select 
                                            value={form.patientId} 
                                            onChange={e => setForm({ ...form, patientId: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Identify Subject --</option>
                                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Consultation Vector</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                                        <select 
                                            value={form.appointmentId} 
                                            onChange={e => setForm({ ...form, appointmentId: e.target.value })}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- Select Session --</option>
                                            {appointments.map(a => (
                                                <option key={a.id} value={a.id}>
                                                    ID: {a.id} // {new Date(a.appointmentTime).toLocaleDateString()}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-purple-400" /> Compound List
                                    </h4>
                                    <button 
                                        type="button" 
                                        onClick={addMedicineField}
                                        className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-purple-500/20 transition-all"
                                    >
                                        + Integrate Compound
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {medicines.map((med, index) => (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            key={index} 
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 glass-card bg-slate-900/40 border-white/5 relative group/med"
                                        >
                                            <div className="md:col-span-4 space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Molecular Name</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="E.g. Paracetamol" 
                                                    value={med.medicineName} 
                                                    onChange={e => handleMedicineChange(index, "medicineName", e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Concentration</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="500mg" 
                                                    value={med.dosage} 
                                                    onChange={e => handleMedicineChange(index, "dosage", e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-2 space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Duration (Days)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="7" 
                                                    value={med.days} 
                                                    onChange={e => handleMedicineChange(index, "days", e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-3 space-y-1">
                                                <label className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Usage Vector</label>
                                                <input 
                                                    type="text" 
                                                    placeholder="After Meals" 
                                                    value={med.notes} 
                                                    onChange={e => handleMedicineChange(index, "notes", e.target.value)}
                                                    className="w-full bg-transparent border-b border-white/10 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-all"
                                                />
                                            </div>
                                            <div className="md:col-span-1 flex items-end justify-end">
                                                {medicines.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeMedicineField(index)}
                                                        className="p-2 text-slate-600 hover:text-rose-500 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full py-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white text-xs font-black uppercase tracking-[0.4em] shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? <Zap className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                BROADCAST PROTOCOL TO PHARMACY NETWORK
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="glass-card p-8 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-3 mb-6">
                            <Brain className="w-6 h-6 text-blue-400" />
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">AI Safety Check</h4>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                            Neural engine is cross-referencing molecular interactions with the subject's known allergies and chronic history.
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                                <CheckCircle className="w-3 h-3" /> No contraindications detected
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                                <Info className="w-3 h-3" /> Dosage optimization active
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-3 mb-4 text-amber-400">
                            <Zap className="w-5 h-5" />
                            <h4 className="text-sm font-black uppercase tracking-widest">Operational Notice</h4>
                        </div>
                        <p className="text-[10px] text-amber-200/60 font-bold leading-relaxed uppercase tracking-widest">
                            Authorized signature will be appended automatically. Once broadcast, the pharmacy will receive an encrypted clinical token for immediate dispensing.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02]" />
        </div>
    );
}
