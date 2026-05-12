import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import jsPDF from "jspdf";
import PatientDetailPanel from "../../components/PatientDetailPanel";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, Clock, User, CheckCircle, XCircle, 
  Play, Pill, FileText, RefreshCw, AlertTriangle,
  Zap, ChevronRight, Search, Filter, TrendingUp,
  Activity, Shield, Brain
} from 'lucide-react';

export default function DoctorAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [diagModal, setDiagModal] = useState(null);
    const [diagNotes, setDiagNotes] = useState("");
    const [prescribeModal, setPrescribeModal] = useState(null);
    const [prescribeItems, setPrescribeItems] = useState([{ medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast] = useState("");

    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const r = await API.get(`/api/appointments`, { headers });
            setAppointments(Array.isArray(r.data) ? r.data : []);
        } catch (error) {
            console.error("Link Failed", error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const updateStatus = async (appointmentId, status, notes = "") => {
        setUpdating(appointmentId);
        try {
            await API.put(`/api/appointments/${appointmentId}/status`, {
                status,
                diagnosisNotes: notes
            }, { headers });
            setAppointments(prev => prev.map(a =>
                a.id === appointmentId ? { ...a, status, diagnosisNotes: notes } : a
            ));
            showToast(`Protocol ${status} Executed`);
        } catch (error) {
            console.error("Status Update Failed", error);
            showToast("Protocol Failed: Integrity Check Required");
        } finally {
            setUpdating(null);
            setDiagModal(null);
            setDiagNotes("");
        }
    };

    const generatePDFReport = (appt) => {
        const doc = new jsPDF();
        // Header
        doc.setFillColor(2, 6, 23);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(14, 165, 233);
        doc.setFontSize(22);
        doc.text("NOVA HEALTH COMMAND", 20, 25);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text("Neural Diagnostic Output v4.2", 20, 32);

        // Body
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("CLINICAL SUMMARY", 20, 55);
        doc.setLineWidth(0.1);
        doc.line(20, 57, 190, 57);

        doc.setFontSize(10);
        doc.text(`Patient: ${appt.patient?.name || "Subject Alpha"}`, 20, 65);
        doc.text(`Timestamp: ${new Date(appt.appointmentTime).toLocaleString()}`, 20, 72);
        
        doc.text("Diagnosis Details:", 20, 90);
        const splitNotes = doc.splitTextToSize(appt.diagnosisNotes || "No clinical observations recorded.", 160);
        doc.text(splitNotes, 20, 100);

        doc.save(`Nova_Report_${appt.id}.pdf`);
    };

    const handleAddMedicine = () => {
        setPrescribeItems([...prescribeItems, { medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
    };

    const handlePrescriptionItemChange = (index, field, value) => {
        const newItems = [...prescribeItems];
        newItems[index][field] = value;
        setPrescribeItems(newItems);
    };

    const submitPrescription = async () => {
        try {
            await API.post("/prescriptions/create", {
                patientId: prescribeModal.patient?.id || prescribeModal.patientId,
                doctorId: user.id,
                appointmentId: prescribeModal.id,
                items: prescribeItems.filter(i => i.medicineName.trim() !== "")
            }, { headers });
            showToast("Prescription Synchronized");
            setPrescribeModal(null);
            setPrescribeItems([{ medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
        } catch (error) {
            showToast("Uplink Error: Prescription Failed");
        }
    };

    const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

    const statusConfig = {
        BOOKED: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "SCHEDULED" },
        IN_PROGRESS: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", label: "IN PROGRESS" },
        COMPLETED: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", label: "COMPLETED" },
        CANCELLED: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-400", label: "ABORTED" },
        RESCHEDULED: { bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-400", label: "DEFERRED" },
    };

    return (
        <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10">
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-8 right-8 z-[1000] px-6 py-4 glass-card bg-blue-500/10 border-blue-500/30 text-blue-400 font-black text-xs uppercase tracking-widest flex items-center gap-3"
                    >
                        <Zap className="w-4 h-4 fill-current" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                        CLINICAL <span className="text-blue-400">SCHEDULER</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Resource Allocation & Patient Pipeline</p>
                </motion.div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-6 px-8 py-4 glass-card">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Pacing</span>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Optimized</span>
                        </div>
                        <div className="w-[1px] h-10 bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Queue Latency</span>
                            <span className="text-xs font-bold text-white uppercase tracking-widest">4m 12s</span>
                        </div>
                    </div>
                    <button onClick={fetchAppointments} className="w-14 h-14 glass-card flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all">
                        <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* AI Optimization Banner */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group"
            >
                <div className="hud-corner top-left opacity-30" />
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Brain className="w-8 h-8 animate-pulse-glow" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-emerald-400 tracking-tight uppercase">Neural Schedule Optimization Active</h3>
                            <p className="text-sm text-slate-400 font-medium">
                                Detected high density at 14:00. <span className="text-emerald-500/80">3 patient slots can be re-prioritized</span> based on symptom urgency to reduce burnout risk.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                            Apply Auto-Rebalance
                        </button>
                        <button className="px-6 py-3 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-all">
                            Dismiss
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
            </motion.div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-white/5 backdrop-blur-xl">
                    {["ALL", "BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === f 
                                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {f.replace("_", " ")}
                        </button>
                    ))}
                </div>
                
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text"
                        placeholder="Search Registry..."
                        className="bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all w-full md:w-80"
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4 opacity-50">
                    <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Decrypting Data Streams...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((a, i) => {
                            const cfg = statusConfig[a.status] || statusConfig.BOOKED;
                            return (
                                <motion.div
                                    key={a.id || i}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-6 flex flex-col lg:flex-row items-center gap-8 group hover:bg-slate-900/40"
                                >
                                    <div className="flex items-center gap-6 flex-1 w-full">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-950 flex items-center justify-center relative overflow-hidden border border-white/5">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${a.patient?.name}`} alt="P" className="w-16 h-16" />
                                            <div className={`absolute inset-0 ${cfg.bg} opacity-20`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-lg font-black text-white">{a.patient?.name || "Subject Unknown"}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-blue-400" /> 
                                                    {new Date(a.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="w-3 h-3 text-purple-400" /> 
                                                    {new Date(a.appointmentTime).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Shield className="w-3 h-3 text-emerald-400" /> 
                                                    PID-{a.patient?.id?.slice(0,8)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Panel */}
                                    <div className="flex items-center gap-3 w-full lg:w-auto">
                                        {a.status === "BOOKED" && (
                                            <button 
                                                onClick={() => handleMarkInProgress(a)}
                                                className="flex-1 lg:flex-none btn-futuristic-primary"
                                            >
                                                <Play className="w-4 h-4" /> START CONSULT
                                            </button>
                                        )}
                                        {a.status === "IN_PROGRESS" && (
                                            <>
                                                <button onClick={() => setPrescribeModal(a)} className="flex-1 lg:flex-none btn-futuristic border-purple-500/30 text-purple-400">
                                                    <Pill className="w-4 h-4" /> PRESCRIBE
                                                </button>
                                                <button onClick={() => setDiagModal(a)} className="flex-1 lg:flex-none btn-futuristic border-emerald-500/30 text-emerald-400">
                                                    <CheckCircle className="w-4 h-4" /> COMPLETE
                                                </button>
                                            </>
                                        )}
                                        {a.status === "COMPLETED" && (
                                            <button onClick={() => generatePDFReport(a)} className="flex-1 lg:flex-none btn-futuristic border-blue-500/30 text-blue-400">
                                                <FileText className="w-4 h-4" /> ARCHIVE PDF
                                            </button>
                                        )}
                                        <button onClick={() => setSelectedAppointment(a)} className="w-12 h-12 glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                            <User className="w-5 h-5" />
                                        </button>
                                        {(a.status === "BOOKED" || a.status === "IN_PROGRESS") && (
                                            <button onClick={() => updateStatus(a.id, "CANCELLED")} className="w-12 h-12 glass-card border-rose-500/20 text-rose-500/40 hover:text-rose-500 transition-all">
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    
                    {filtered.length === 0 && (
                        <div className="py-24 glass-card bg-slate-900/20 flex flex-col items-center justify-center gap-4 text-slate-600 border-dashed">
                            <Activity className="w-12 h-12 opacity-20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Active Protocols in Selected Vector</span>
                        </div>
                    )}
                </div>
            )}

            {/* Modals & Panels */}
            {selectedAppointment && <PatientDetailPanel appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}

            {/* Futuristic Completion Modal */}
            <AnimatePresence>
                {diagModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDiagModal(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-xl glass-card p-10 relative z-10 border-blue-500/30"
                        >
                            <div className="hud-corner top-left" />
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <Shield className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Clinical Finalization</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Subject: {diagModal.patient?.name}</p>
                                </div>
                            </div>
                            
                            <textarea 
                                value={diagNotes} 
                                onChange={e => setDiagNotes(e.target.value)}
                                placeholder="Enter clinical observations and diagnostic summary..."
                                className="w-full h-48 bg-slate-900/50 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:border-blue-400/50 transition-all font-medium placeholder:text-slate-700 mb-8"
                            />
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => updateStatus(diagModal.id, "COMPLETED", diagNotes)}
                                    className="flex-1 btn-futuristic-primary py-4"
                                >
                                    COMMIT TO PERMANENT RECORD
                                </button>
                                <button onClick={() => setDiagModal(null)} className="px-8 py-4 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white">
                                    Abort
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Prescription Modal (Futuristic Redesign) */}
            <AnimatePresence>
                {prescribeModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPrescribeModal(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} 
                            animate={{ scale: 1, opacity: 1 }} 
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-2xl glass-card p-10 relative z-10 border-purple-500/30 flex flex-col max-h-[85vh]"
                        >
                            <div className="hud-corner top-left" />
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <Pill className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase">Biochemical Protocol</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Synchronizing with Pharmacy Network</p>
                                    </div>
                                </div>
                                <button onClick={() => setPrescribeModal(null)} className="text-slate-500 hover:text-white">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 space-y-6 custom-scroll mb-8">
                                {prescribeItems.map((item, index) => (
                                    <div key={index} className="p-6 glass-card bg-white/5 border-white/5 space-y-4 relative">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compound Name</label>
                                                <input 
                                                    value={item.medicineName} 
                                                    onChange={e => handlePrescriptionItemChange(index, "medicineName", e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-400/50 outline-none"
                                                    placeholder="e.g. Paracetamol"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Concentration</label>
                                                <input 
                                                    value={item.dosage} 
                                                    onChange={e => handlePrescriptionItemChange(index, "dosage", e.target.value)}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-400/50 outline-none"
                                                    placeholder="e.g. 500mg"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Cycle:</span>
                                            {['morning', 'afternoon', 'night'].map(t => (
                                                <label key={t} className="flex items-center gap-2 cursor-pointer group">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={item[t]} 
                                                        onChange={e => handlePrescriptionItemChange(index, t, e.target.checked)}
                                                        className="hidden"
                                                    />
                                                    <div className={`w-4 h-4 rounded border transition-all ${item[t] ? 'bg-purple-500 border-purple-400' : 'border-white/20 group-hover:border-white/40'}`} />
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${item[t] ? 'text-white' : 'text-slate-500'}`}>{t}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button onClick={handleAddMedicine} className="w-full py-4 border border-dashed border-purple-500/30 rounded-2xl text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500/5 transition-all">
                                    + Integrate Additional Compound
                                </button>
                                <button 
                                    onClick={submitPrescription}
                                    className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                >
                                    AUTHORIZE & BROADCAST
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Global HUD Effect */}
            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02]" />
        </div>
    );
}
