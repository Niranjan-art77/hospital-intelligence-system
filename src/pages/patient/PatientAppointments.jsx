import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar, Clock, User, CheckCircle, AlertCircle, 
    Sparkles, Zap, ChevronRight, Filter, Info,
    Plus, Search, Star, Brain, Heart, Activity, 
    Thermometer, Droplets, FileText, X, Eye,
    TrendingUp, AlertTriangle, Pill, History
} from "lucide-react";

export default function PatientAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ doctorId: "", appointmentTime: "" });
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: "", message: "" });
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [rescheduleData, setRescheduleData] = useState({ id: null, time: "" });
    const [isCancelling, setIsCancelling] = useState(null);

    useEffect(() => {
        if (!user?.id) return;
        const fetchData = async () => {
            try {
                const [aRes, dRes] = await Promise.all([
                    API.get(`/appointments/patient/${user.id}`),
                    API.get("/doctors")
                ]);
                setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
                setDoctors(Array.isArray(dRes.data) ? dRes.data : []);
            } catch (err) {
                console.error("Link Failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleBook = async e => {
        e.preventDefault();
        if (!form.doctorId || !form.appointmentTime) {
            setStatus({ type: "error", message: "All tactical fields required." });
            return;
        }
        try {
            await API.post("/appointments/book", {
                patientId: user.id,
                doctorId: form.doctorId,
                appointmentTime: form.appointmentTime,
                status: "BOOKED"
            });
            setStatus({ type: "success", message: "Protocol initialized. Appointment secured." });
            setShowForm(false);
            setForm({ doctorId: "", appointmentTime: "" });
            // Refresh
            const res = await API.get(`/appointments/patient/${user.id}`);
            setAppointments(res.data);
        } catch {
            setStatus({ type: "error", message: "Booking uplink failed. Retry signal." });
        }
        setTimeout(() => setStatus({ type: "", message: "" }), 4000);
    };

    const handleCancel = async (id) => {
        if(!window.confirm("Are you sure you want to cancel this appointment?")) return;
        setIsCancelling(id);
        try {
            await API.put(`/appointments/${id}/status`, { status: "CANCELLED" });
            setStatus({ type: "success", message: "Appointment Cancelled" });
            const res = await API.get(`/appointments/patient/${user.id}`);
            setAppointments(res.data);
        } catch(error) {
            setStatus({ type: "error", message: "Failed to cancel appointment" });
        } finally {
            setIsCancelling(null);
            setTimeout(() => setStatus({ type: "", message: "" }), 4000);
        }
    };

    const handleRescheduleSubmit = async (e, id) => {
        e.preventDefault();
        try {
            await API.put(`/appointments/${id}/reschedule`, { appointmentTime: rescheduleData.time });
            setStatus({ type: "success", message: "Appointment Rescheduled Successfully" });
            setRescheduleData({ id: null, time: "" });
            const res = await API.get(`/appointments/patient/${user.id}`);
            setAppointments(res.data);
        } catch(error) {
            setStatus({ type: "error", message: "Failed to reschedule. Slot might be full." });
        } finally {
            setTimeout(() => setStatus({ type: "", message: "" }), 4000);
        }
    };

    const runAiOptimization = (docId) => {
        const doc = doctors.find(d => d.id.toString() === docId);
        if (!doc) return;
        
        // Mock AI intelligence
        setAiAnalysis({
            trafficDensity: Math.floor(Math.random() * 40) + 10,
            optimizedSlot: "08:30 AM",
            recommendationScore: 98,
            insight: `Dr. ${doc.name} has a 95% record for on-time sessions in ${doc.specialization}.`
        });
    };

    const fetchAppointmentDetails = async (appointment) => {
        setSelectedAppointment(appointment);
        setLoadingDetails(true);
        
        try {
            // Mock comprehensive patient data for appointment intelligence
            const [vitalsRes, prescriptionsRes, reportsRes, historyRes] = await Promise.all([
                API.get(`/patients/${user.id}/vitals`),
                API.get(`/prescriptions/patient/${user.id}`),
                API.get(`/reports/patient/${user.id}`),
                API.get(`/patients/${user.id}/timeline`)
            ]);

            setAppointmentDetails({
                vitals: {
                    heartRate: 72 + Math.floor(Math.random() * 20),
                    bloodPressure: "120/80",
                    oxygen: 96 + Math.floor(Math.random() * 4),
                    temperature: 98.6,
                    glucose: 95 + Math.floor(Math.random() * 30),
                    weight: 70 + Math.floor(Math.random() * 20),
                    height: 170 + Math.floor(Math.random() * 10)
                },
                prescriptions: Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data.slice(0, 3) : [],
                reports: Array.isArray(reportsRes.data) ? reportsRes.data.slice(0, 3) : [],
                history: Array.isArray(historyRes.data) ? historyRes.data.slice(0, 5) : [],
                allergies: user?.allergies || "None recorded",
                emergencyContact: user?.emergencyContact || "Not specified",
                insurance: user?.insuranceProvider || "Public Health Scheme"
            });
        } catch (error) {
            console.error('Failed to fetch appointment details:', error);
            // Set mock data if API fails
            setAppointmentDetails({
                vitals: {
                    heartRate: 75,
                    bloodPressure: "120/80",
                    oxygen: 98,
                    temperature: 98.6,
                    glucose: 100,
                    weight: 75,
                    height: 175
                },
                prescriptions: [],
                reports: [],
                history: [],
                allergies: user?.allergies || "None recorded",
                emergencyContact: user?.emergencyContact || "Not specified",
                insurance: user?.insuranceProvider || "Public Health Scheme"
            });
        } finally {
            setLoadingDetails(false);
        }
    };

    const upcoming = appointments.filter(a => a.status === "BOOKED");
    const past = appointments.filter(a => ["COMPLETED", "CANCELLED"].includes(a.status));

    return (
        <div className="p-8 min-h-screen relative z-10 w-full max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-3">
                        APPOINTMENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 drop-shadow-sm">INTELLIGENCE</span>
                    </h1>
                    <div className="flex items-center gap-4 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" />
                            <span>{upcoming.length} Pending Actions</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                        <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span>{past.length} Fulfilled Scripts</span>
                        </div>
                    </div>
                </motion.div>

                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowForm(!showForm)}
                    className="group px-8 py-4 bg-white text-slate-900 font-black rounded-[2.5rem] shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:shadow-glow-blue transition-all flex items-center gap-3 active:bg-blue-500 active:text-white"
                >
                    {showForm ? <Zap size={20} /> : <Plus size={20} />}
                    <span className="uppercase tracking-widest text-xs">{showForm ? "Close Interface" : "Deploy New Booking"}</span>
                </motion.button>
            </div>

            {/* Status Notifications */}
            <AnimatePresence>
                {status.message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-8 p-6 rounded-[2rem] border backdrop-blur-3xl flex items-center gap-4 ${
                            status.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}
                    >
                        {status.type === "success" ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                        <span className="font-bold tracking-wide">{status.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Booking Engine */}
            <AnimatePresence mode="wait">
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 glass-card-glowing p-10">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                                        <Sparkles size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white tracking-tight">Tactical Deployment Interface</h3>
                                </div>

                                <form onSubmit={handleBook} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Assigned Specialist</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                                            <select 
                                                value={form.doctorId} 
                                                onChange={e => {
                                                    setForm({ ...form, doctorId: e.target.value });
                                                    runAiOptimization(e.target.value);
                                                }}
                                                className="w-full bg-slate-950/50 border border-white/5 p-5 pl-14 rounded-3xl text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer shadow-inner"
                                            >
                                                <option value="" className="bg-slate-900">Select Medical Protocol</option>
                                                {doctors.map(d => (
                                                    <option key={d.id} value={d.id} className="bg-slate-900">Dr. {d.name} — {d.specialization}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Temporal Window</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                                            <input 
                                                type="datetime-local" 
                                                value={form.appointmentTime} 
                                                onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/5 p-5 pl-14 rounded-3xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner [color-scheme:dark]" 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit"
                                        className="md:col-span-2 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-3xl shadow-glow-blue transition-all active:scale-[0.98] uppercase tracking-[0.3em] text-sm mt-4"
                                    >
                                        Initiate Clinical Session
                                    </button>
                                </form>
                            </div>

                            <div className="glass-card-glowing border-blue-500/20 p-10 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-10 -mr-16 -mt-16 pointer-events-none group-hover:opacity-20 transition-all duration-1000" />
                                
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                                        <Brain size={18} />
                                    </div>
                                    <h4 className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">Nova AI Analysis</h4>
                                </div>

                                {aiAnalysis ? (
                                    <div className="space-y-8 flex-1">
                                        <div>
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Wait-Time Probability</span>
                                                <span className="text-sm font-black text-emerald-400">{aiAnalysis.trafficDensity}% Density</span>
                                            </div>
                                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${aiAnalysis.trafficDensity}%` }}
                                                    className={`h-full rounded-full ${aiAnalysis.trafficDensity > 70 ? 'bg-red-500' : aiAnalysis.trafficDensity > 40 ? 'bg-amber-500' : 'bg-emerald-500'} shadow-glow-sm`}
                                                />
                                            </div>
                                        </div>

                                        <div className="p-6 bg-white/5 border border-white/5 rounded-[2rem] space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Zap size={16} className="text-blue-400" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Optimized Temporal Slot</span>
                                            </div>
                                            <div className="text-3xl font-black text-white">{aiAnalysis.optimizedSlot}</div>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed">{aiAnalysis.insight}</p>
                                        </div>

                                        <div className="flex items-center gap-4 mt-auto">
                                            <div className="flex-1 h-[1px] bg-white/5" />
                                            <div className="flex items-center gap-2">
                                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                                <span className="text-sm font-black text-white">{aiAnalysis.recommendationScore} Index</span>
                                            </div>
                                            <div className="flex-1 h-[1px] bg-white/5" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center opacity-30 grayscale gap-4">
                                        <Info size={40} />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Parameter Input</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Appointment Grid */}
            <div className="mb-20">
                <div className="flex items-center gap-6 mb-10">
                    <h3 className="text-2xl font-black text-white tracking-tight">Active Duty Rosters</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                    <Filter size={18} className="text-slate-500 cursor-pointer hover:text-white transition-colors" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin shadow-glow-blue" />
                    </div>
                ) : upcoming.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-20 glass-card-glowing border-dashed flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-all group"
                    >
                        <Calendar size={48} className="text-slate-500 mb-6 group-hover:text-blue-400 transition-colors" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">Zero Active Deployments Detected</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-8">
                        {upcoming.map((a, i) => {
                            const isWithin24h = new Date(a.appointmentTime).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && new Date(a.appointmentTime).getTime() > new Date().getTime();
                            return (
                            <motion.div 
                                key={a.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                className={`glass-card-glowing p-8 relative overflow-hidden group cursor-pointer ${isWithin24h ? 'ring-2 ring-rose-500/50 shadow-glow-sm shadow-rose-500/20' : ''}`}
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 transition-all ${isWithin24h ? 'bg-rose-500/20 group-hover:bg-rose-500/30' : 'bg-blue-500/10 group-hover:bg-blue-500/20'}`} />
                                
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 p-1">
                                            <img 
                                                src={a.doctor?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${a.doctor?.id}`} 
                                                className="w-full h-full rounded-[0.8rem] object-cover" 
                                                alt="Doctor"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white">Dr. {a.doctor?.name}</h4>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{a.doctor?.specialization}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 shadow-glow-sm">
                                        <Calendar size={20} />
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-blue-400" />
                                            <span className="text-xs font-black text-white uppercase tracking-tighter">Timeline</span>
                                        </div>
                                        <span className="text-sm font-bold text-slate-300">
                                            {new Date(a.appointmentTime).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(a.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div className="flex justify-start gap-2 pt-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setRescheduleData({ id: a.id, time: "" }); }}
                                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500 hover:text-white text-indigo-400 rounded-xl text-xs font-bold transition-colors flex-1"
                                        >
                                            Reschedule
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleCancel(a.id); }}
                                            disabled={isCancelling === a.id}
                                            className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 rounded-xl text-xs font-bold transition-colors flex-1 disabled:opacity-50"
                                        >
                                            {isCancelling === a.id ? "Canceling..." : "Cancel"}
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {rescheduleData.id === a.id && (
                                            <motion.form 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                onSubmit={(e) => handleRescheduleSubmit(e, a.id)} 
                                                onClick={(e) => e.stopPropagation()} 
                                                className="mt-4 p-4 border border-indigo-500/20 rounded-2xl bg-indigo-500/10"
                                            >
                                                <label className="text-[10px] text-indigo-400 tracking-widest uppercase mb-2 block font-bold">Select New Time</label>
                                                <input type="datetime-local" required className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl p-3 text-sm text-white mb-3 [color-scheme:dark]"
                                                       value={rescheduleData.time}
                                                       onChange={e => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                                />
                                                <div className="flex gap-2">
                                                    <button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl py-2 text-xs font-bold shadow-lg shadow-indigo-500/20">Confirm</button>
                                                    <button type="button" onClick={() => setRescheduleData({id: null, time: ""})} className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Close</button>
                                                </div>
                                            </motion.form>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex items-center justify-between mt-auto">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${isWithin24h ? 'bg-rose-500' : 'bg-blue-500'}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isWithin24h ? 'text-rose-500' : 'text-blue-500'}`}>
                                            {isWithin24h ? 'Upcoming Soon' : 'Protocol Booked'}
                                        </span>
                                    </div>
                                    <motion.button 
                                        whileHover={{ x: 3 }}
                                        onClick={() => fetchAppointmentDetails(a)}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white flex items-center gap-1 transition-all"
                                    >
                                        Access Data <ChevronRight size={14} />
                                    </motion.button>
                                </div>
                            </motion.div>
                        )})}
                    </div>
                )}
            </div>

            {/* Past Ledger */}
            {past.length > 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-20 border-t border-white/5 pt-12"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-lg font-black text-slate-500 tracking-widest uppercase">Temporal Archive Ledger</h3>
                        <div className="flex-1 h-[1px] bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {past.map(a => (
                            <div key={a.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.04] transition-all flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 overflow-hidden grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                        <img src={a.doctor?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${a.doctor?.id}`} alt="Doc" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-300">Dr. {a.doctor?.name}</div>
                                        <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter mt-0.5">
                                            {new Date(a.appointmentTime).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                                    a.status === "COMPLETED" 
                                    ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" 
                                    : "bg-red-500/5 text-red-500 border-red-500/10"
                                }`}>
                                    {a.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Appointment Intelligence Modal */}
            <AnimatePresence>
                {selectedAppointment && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedAppointment(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-[3rem] max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-white/10 p-1">
                                            <img 
                                                src={selectedAppointment.doctor?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${selectedAppointment.doctor?.id}`} 
                                                className="w-full h-full rounded-2xl object-cover" 
                                                alt="Doctor"
                                            />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white mb-2">Dr. {selectedAppointment.doctor?.name}</h2>
                                            <p className="text-blue-400 font-bold text-sm uppercase tracking-widest">{selectedAppointment.doctor?.specialization}</p>
                                            <div className="flex items-center gap-4 mt-3 text-slate-400 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    <span>{new Date(selectedAppointment.appointmentTime).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} />
                                                    <span>{new Date(selectedAppointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedAppointment(null)}
                                        className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                                {loadingDetails ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                                    </div>
                                ) : appointmentDetails && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Vitals Panel */}
                                        <div className="lg:col-span-1 space-y-6">
                                            <div className="glass-card-glowing p-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Heart className="w-5 h-5 text-rose-500" />
                                                    <h3 className="text-lg font-black text-white">Current Vitals</h3>
                                                </div>
                                                <div className="space-y-4">
                                                    {[
                                                        { label: "Heart Rate", value: `${appointmentDetails.vitals.heartRate} bpm`, icon: <Heart className="w-4 h-4" />, color: "text-rose-400" },
                                                        { label: "Blood Pressure", value: appointmentDetails.vitals.bloodPressure, icon: <Activity className="w-4 h-4" />, color: "text-blue-400" },
                                                        { label: "Oxygen Level", value: `${appointmentDetails.vitals.oxygen}%`, icon: <Droplets className="w-4 h-4" />, color: "text-emerald-400" },
                                                        { label: "Temperature", value: `${appointmentDetails.vitals.temperature}°F`, icon: <Thermometer className="w-4 h-4" />, color: "text-amber-400" },
                                                        { label: "Glucose Level", value: `${appointmentDetails.vitals.glucose} mg/dL`, icon: <TrendingUp className="w-4 h-4" />, color: "text-purple-400" }
                                                    ].map((vital, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 bg-slate-900 rounded-xl ${vital.color}`}>
                                                                    {vital.icon}
                                                                </div>
                                                                <span className="text-sm text-slate-400">{vital.label}</span>
                                                            </div>
                                                            <span className={`font-bold ${vital.color}`}>{vital.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Emergency Info */}
                                            <div className="glass-card-glowing p-6 border-rose-500/20">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                                    <h3 className="text-sm font-black text-rose-400 uppercase tracking-widest">Critical Information</h3>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Allergies</p>
                                                        <p className="text-sm font-bold text-white">{appointmentDetails.allergies}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Emergency Contact</p>
                                                        <p className="text-sm font-bold text-blue-400">{appointmentDetails.emergencyContact}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Insurance</p>
                                                        <p className="text-sm font-bold text-emerald-400">{appointmentDetails.insurance}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Medical History */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Recent Prescriptions */}
                                            <div className="glass-card-glowing p-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <Pill className="w-5 h-5 text-emerald-500" />
                                                    <h3 className="text-lg font-black text-white">Recent Prescriptions</h3>
                                                </div>
                                                {appointmentDetails.prescriptions.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {appointmentDetails.prescriptions.map((rx, i) => (
                                                            <div key={i} className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-bold text-white">Prescription #{rx.id}</h4>
                                                                    <span className="text-[10px] text-slate-500">{new Date(rx.createdAt).toLocaleDateString()}</span>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    {rx.items?.map((item, j) => (
                                                                        <div key={j} className="flex items-center justify-between text-sm">
                                                                            <span className="text-slate-300">{item.medicineName}</span>
                                                                            <span className="text-slate-500">{item.dosage}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-8">No recent prescriptions</p>
                                                )}
                                            </div>

                                            {/* Recent Reports */}
                                            <div className="glass-card-glowing p-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <FileText className="w-5 h-5 text-purple-500" />
                                                    <h3 className="text-lg font-black text-white">Medical Reports</h3>
                                                </div>
                                                {appointmentDetails.reports.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {appointmentDetails.reports.map((report, i) => (
                                                            <div key={i} className="p-4 bg-slate-800/50 rounded-2xl border border-white/5">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <h4 className="font-bold text-white text-sm truncate">{report.reportName}</h4>
                                                                    <Eye className="w-4 h-4 text-purple-400 cursor-pointer hover:text-white" />
                                                                </div>
                                                                <p className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-8">No recent reports</p>
                                                )}
                                            </div>

                                            {/* Medical History Timeline */}
                                            <div className="glass-card-glowing p-6">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <History className="w-5 h-5 text-blue-500" />
                                                    <h3 className="text-lg font-black text-white">Medical History</h3>
                                                </div>
                                                {appointmentDetails.history.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {appointmentDetails.history.map((event, i) => (
                                                            <div key={i} className="flex gap-4">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-bold text-white">{event.title}</p>
                                                                    <p className="text-[10px] text-slate-500">{event.date} • {event.type}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-center py-8">No medical history available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .shadow-glow-blue {
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2);
                }
                .shadow-glow-sm {
                    box-shadow: 0 0 10px currentColor;
                }
                .xxl\:grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            `}</style>
        </div>
    );
}
