import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { generatePrescriptionPDF } from "../../utils/pdfGenerator";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Activity, Thermometer, Droplets, 
  MapPin, Bell, Users, CreditCard, 
  ArrowRight, Download, Eye, CheckCircle2,
  AlertCircle, Brain, Sparkles, Map as MapIcon,
  ChevronRight, Calendar, Pill, Clock, Video,
  Shield, MessageSquare, Plus, FileText, UserPlus,
  TrendingUp, TrendingDown, Zap, Target,
  Award, AlertTriangle, BarChart3, PieChart,
  Timer, Stethoscope, Hospital, Phone
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ErrorBoundary from "../../components/ErrorBoundary";

// Fix Leaflet icon issue for production/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PatientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    // Core Data State
    const [recentPrescriptions, setRecentPrescriptions] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [billingInfo, setBillingInfo] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Analytics State
    const [healthScore, setHealthScore] = useState(85);
    const [appointmentStats, setAppointmentStats] = useState([]);
    const [medicationAdherence, setMedicationAdherence] = useState(92);
    const [recoveryProgress, setRecoveryProgress] = useState(78);
    const [vitalHistory, setVitalHistory] = useState([]);
    
    // Feature State
    const [symptomQuery, setSymptomQuery] = useState("");
    const [vitals, setVitals] = useState({
        heartRate: 72,
        bp: "120/80",
        temp: 98.6,
        oxygen: 98
    });

    // Real time vitals should be fetched from device, using static from DB for now

    // Health Score Calculation
    const calculatedHealthScore = useMemo(() => {
        let score = 95;
        if (user?.age > 50) score -= 5;
        if (user?.age > 70) score -= 10;
        score -= (recentPrescriptions.length * 2);
        return Math.max(0, Math.min(100, score));
    }, [user, recentPrescriptions]);

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
            
            const allApts = Array.isArray(aptRes.data) ? aptRes.data : [];
            const futureApts = allApts
                .filter(a => new Date(a.appointmentTime) > new Date())
                .sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime));
            setUpcomingAppointments(futureApts.slice(0, 1));

            // Generate appointmentStats
            const statsMap = {};
            [...allApts].reverse().forEach(a => {
                const m = new Date(a.appointmentTime).toLocaleDateString('en', { month: 'short' });
                if(!statsMap[m]) statsMap[m] = { month: m, completed: 0, cancelled: 0, upcoming: 0 };
                if(a.status === 'COMPLETED') statsMap[m].completed++;
                else if(a.status === 'CANCELLED') statsMap[m].cancelled++;
                else statsMap[m].upcoming++;
            });
            setAppointmentStats(Object.values(statsMap).slice(-6));

            setBillingInfo(Array.isArray(billRes.data) ? billRes.data : []);
            setTimeline(Array.isArray(timelineRes.data) ? timelineRes.data.slice(0, 4) : []);

            if (vitalsRes.data && vitalsRes.data.length > 0) {
                const mappedVitals = vitalsRes.data.map(v => {
                    let bpStr = "120/80";
                    if (typeof v.bloodPressure === 'string') {
                        bpStr = v.bloodPressure;
                    } else if (v.bloodPressure && typeof v.bloodPressure === 'object') {
                        bpStr = `${v.bloodPressure.systolic || 120}/${v.bloodPressure.diastolic || 80}`;
                    }

                    return {
                        date: new Date(v.recordedAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
                        heartRate: parseInt(v.heartRate) || 0,
                        oxygen: parseInt(v.oxygenLevel) || 0,
                        systolic: parseInt(bpStr.split('/')[0]) || 0,
                        diastolic: parseInt(bpStr.split('/')[1]) || 0
                    };
                }).reverse();
                setVitalHistory(mappedVitals);
                
                const latest = vitalsRes.data[0];
                let latestBP = "120/80";
                if (typeof latest.bloodPressure === 'string') {
                    latestBP = latest.bloodPressure;
                } else if (latest.bloodPressure && typeof latest.bloodPressure === 'object') {
                    latestBP = `${latest.bloodPressure.systolic || 120}/${latest.bloodPressure.diastolic || 80}`;
                }

                setVitals({
                    heartRate: parseInt(latest.heartRate) || 72,
                    oxygen: parseInt(latest.oxygenLevel) || 98,
                    bp: latestBP,
                    temp: parseFloat(latest.temperature) || 98.6
                });
            } else {
                setVitalHistory([]);
            }
        } catch (error) {
            console.error("Dashboard Sync Failed", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    // Data Fetching
    useEffect(() => {
        if (user?.id) fetchDashboardData();
    }, [user?.id, fetchDashboardData]);

    // Generate Analytics Data (Health Score)
    useEffect(() => {
        // Update health score based on vitals
        const newScore = calculatedHealthScore + (vitals.heartRate > 80 ? -2 : vitals.heartRate < 60 ? -3 : 0);
        setHealthScore(Math.max(0, Math.min(100, newScore)));
    }, [vitals, calculatedHealthScore]);

    // Feature Handlers
    const handlePayBill = async (billId, method) => {
        try {
            await API.post(`/billing/pay/${billId}`, { method });
            addToast({
                type: "success",
                title: "Payment Successful",
                message: `Simulated ${method} payment completed. Your billing ledger has been refreshed.`,
            });
            fetchDashboardData();
        } catch (error) {
            console.error("Payment failed", error);
            addToast({
                type: "error",
                title: "Payment Failed",
                message: "We could not process this payment right now. Please try again later.",
            });
        }
    };

    const handleSOS = () => {
        addToast({
            type: "error",
            title: "Emergency SOS Activated",
            message: "Emergency SOS simulated. In production, responders would be notified with your record and location.",
        });
    };

    const handleAnalyzeSymptom = () => {
        if (!symptomQuery) return;
        addToast({
            type: "info",
            title: "Routing to Specialists",
            message: `Using your symptom description to pre-filter doctors who best match "${symptomQuery}".`,
        });
        navigate(`/patient/directory?symptoms=${encodeURIComponent(symptomQuery)}`);
    };

    const handleJoinCall = () => {
        addToast({
            type: "info",
            title: "Video Hub",
            message: "Initializing secure video hub for your upcoming session.",
        });
        navigate("/patient/appointments");
    };

    // Mock Data for Extended Widgets
    const familyMembers = [
        { id: 1, name: user?.fullName?.split(' ')[0] || "You", pic: "🧑", active: true },
        { id: 2, name: "Sarah", pic: "👩", active: false },
        { id: 3, name: "James", pic: "👦", active: false },
    ];

    const hospitals = [
        { id: 1, name: "City General", pos: [12.9716, 77.5946], type: "Multispecialty" },
        { id: 2, name: "Apollo Care", pos: [12.9816, 77.6046], type: "Emergency" },
    ];

    const medicineReminders = useMemo(() => {
        let reminders = [];
        recentPrescriptions.forEach(rx => {
            rx.items?.forEach(item => {
                if (item.morning) reminders.push({ name: item.medicineName, time: "08:00 AM", taken: false });
                if (item.afternoon) reminders.push({ name: item.medicineName, time: "01:00 PM", taken: false });
                if (item.night) reminders.push({ name: item.medicineName, time: "09:00 PM", taken: false });
            });
        });
        return reminders.length > 0 ? reminders.slice(0, 3) : [{ name: "Hydration", time: "Now", taken: true }];
    }, [recentPrescriptions]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#020617] text-white">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="mb-4">
                    <Activity className="w-12 h-12 text-blue-500" />
                </motion.div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Initializing Health Hub...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen text-slate-100 font-sans bg-[#020617] relative">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">Nova Security Protocol v4.2</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-white">
                            Vital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Intelligence</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Status: <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Biometrically Verified</span></p>
                    </div>
                    <div className="flex gap-4">
                        <ErrorBoundary>
                            <button onClick={handleSOS} className="group px-6 py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white text-red-500 font-black rounded-2xl transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 animate-pulse" /> Emergency SOS
                            </button>
                        </ErrorBoundary>
                        <button onClick={() => navigate("/patient/directory")} className="px-6 py-3 bg-white/5 border border-white/10 hover:border-blue-500/50 text-white font-bold rounded-2xl transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                           <Plus className="w-4 h-4" /> Book Session
                        </button>
                    </div>
                </div>

                {/* Vitals & Health Score Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    {/* Vitals Grid (3 cols) */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-6">
                         {[
                            { label: "Heart Rate", val: vitals.heartRate ?? "--", unit: "bpm", icon: <Heart/>, color: "text-rose-400", bg: "bg-rose-500/10" },
                            { label: "Blood Pressure", val: vitals.bp ?? "--", unit: "mmHg", icon: <Activity/>, color: "text-blue-400", bg: "bg-blue-500/10" },
                            { label: "Temperature", val: vitals.temp ?? "--", unit: "°F", icon: <Thermometer/>, color: "text-amber-400", bg: "bg-amber-400/10" },
                            { label: "Oxygen", val: vitals.oxygen ?? "--", unit: "%", icon: <Droplets/>, color: "text-emerald-400", bg: "bg-emerald-500/10" }
                        ].map((v, i) => (
                            <motion.div key={i} whileHover={{ y: -5 }} className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative group">
                                <div className={`absolute top-4 right-4 ${v.bg} ${v.color} p-2 rounded-xl opacity-30 group-hover:opacity-100 transition-opacity`}>{v.icon}</div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label ?? "--"}</p>
                                <div className={`text-2xl font-black ${v.color} flex items-baseline gap-1`}>
                                    {v.val} <span className="text-[10px] opacity-40">{v.unit}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* Health Score (1 col) */}
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-3xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Health Score</p>
                            <div className="text-4xl font-black text-white">{calculatedHealthScore ?? 0}</div>
                        </div>
                        <div className="relative w-16 h-16">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                <motion.circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" 
                                    initial={{ strokeDashoffset: 175.9 }}
                                    animate={{ strokeDashoffset: 175.9 - (175.9 * calculatedHealthScore) / 100 }}
                                    transition={{ duration: 2 }}
                                    className="text-indigo-400" strokeLinecap="round" />
                            </svg>
                            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-indigo-300 opacity-50" />
                        </div>
                    </motion.div>
                </div>

                {/* Advanced Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    {/* Health Score Analy                     <ErrorBoundary>
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-1 glass-card-glowing border-emerald-500/20 p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-emerald-500/20 transition-all duration-700" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-black text-white">Health Analytics</h3>
                                    <Award className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-black text-emerald-400 mb-1">{healthScore ?? 0}</div>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">Health Score</p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Vitals</span>
                                            <span className="text-xs font-bold text-emerald-400">Normal</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Medication</span>
                                            <span className="text-xs font-bold text-blue-400">{medicationAdherence ?? 0}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-400">Recovery</span>
                                            <span className="text-xs font-bold text-amber-400">{recoveryProgress ?? 0}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </ErrorBoundary>otion.div>

                    {/* Vitals Trend C                     <ErrorBoundary className="lg:col-span-2">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="w-full glass-card-glowing border-blue-500/20 p-6 h-full"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-white">Vitals Trend (7 Days)</h3>
                                <Activity className="w-5 h-5 text-blue-400" />
                            </div>
                            <ResponsiveContainer width="100%" height={150}>
                                <LineChart data={vitalHistory.slice(-7)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                    <YAxis stroke="#64748b" fontSize={10} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Heart Rate" />
                                    <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Oxygen" />
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                    <span className="text-xs text-slate-400">Heart Rate</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                                    <span className="text-xs text-slate-400">Oxygen</span>
                                </div>
                            </div>
                        </motion.div>
                    </ErrorBoundary>otion.div>

                    {/* Appointment Analytics */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 glass-card-glowing border-purple-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-white">Appointments</h3>
                            <BarChart3 className="w-5 h-5 text-purple-400" />
                        </div>
                        <ResponsiveContainer width="100%" height={120}>
                            <BarChart data={appointmentStats.slice(-3)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="text-center mt-4">
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Success Rate</p>
                            <p className="text-lg font-black text-emerald-400">87%</p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Next Appointment                          <ErrorBoundary>
                            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-3xl border border-blue-500/20 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Session
                                </h3>
                                {upcomingAppointments[0] ? (
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-950/40 p-6 rounded-3xl border border-white/5">
                                        <div className="flex items-center gap-5">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px] shadow-2xl">
                                                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-4xl">👨‍⚕️</div>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-white">Dr. {upcomingAppointments[0].doctor?.user?.fullName ?? "Specialist"}</p>
                                                <p className="text-blue-400 font-bold text-xs uppercase tracking-widest">Medical Specialist</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center md:items-end gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-white">{new Date(upcomingAppointments[0].appointmentTime).toDateString()}</p>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{new Date(upcomingAppointments[0].appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <button onClick={handleJoinCall} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                                                <Video className="w-4 h-4" /> Start Video Hub
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center bg-slate-950/40 rounded-3xl border border-white/5 border-dashed border-spacing-4">
                                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-4">Awaiting Signal for New Scheduled Consultation</p>
                                        <button onClick={() => navigate("/patient/directory")} className="text-blue-400 font-black text-sm hover:underline flex items-center gap-2 mx-auto">
                                            Book Discovery Session <ChevronRight className="w-4 h-4"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </ErrorBoundary>             </div>

                        {/* Middle Row: Meds & Intelligence Vault */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Medicine Reminders */}
                            <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <Pill className="w-5 h-5 text-emerald-400" /> Therapy Protocol
                                </h3>
                                <div className="space-y-4">
                                    {medicineReminders.map((med, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/20 rounded-2xl border border-white/5 hover:bg-slate-800/40 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                    <Clock className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-sm">{med.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{med.time}</p>
                                                </div>
                                            </div>
                                            <input type="checkbox" defaultChecked={med.taken} className="w-6 h-6 rounded-lg border-white/20 bg-slate-900 checked:bg-emerald-500 transition-all cursor-pointer" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Intelligence Vault (Mini Reports/Scripts) */}
                            <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-purple-400" /> Intelligence Vault
                                </h3>
                                <div className="space-y-4">
                                    {recentPrescriptions.slice(0, 2).map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-800/20 rounded-2xl border border-white/5 px-6">
                                            <div>
                                                <p className="font-bold text-white text-sm">Medical Script #{p.id}</p>
                                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">{new Date(p.createdAt).toDateString()}</p>
                                            </div>
                                            <button onClick={() => generatePrescriptionPDF(p, user)} className="text-purple-400 hover:text-white transition-colors">
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                    <Link to="/patient/reports" className="block text-center py-4 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-purple-500/10">
                                        Access All Secure Vaults
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Neural AI Symptom Checker */}
                        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-3xl border border-indigo-500/30 p-10 rounded-[4rem] shadow-3xl text-center relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                             <div className="relative z-10">
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow transition-transform group-hover:scale-110">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-white mb-2 tracking-tight leading-tight">Neural Diagnosis Interface</h3>
                                <p className="text-slate-400 text-sm mb-8 max-w-lg mx-auto leading-relaxed">Describe your symptoms in natural language. Our neural network will analyze biomarkers and recommend the ideal clinical protocol.</p>
                                <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                                    <input 
                                        type="text" 
                                        placeholder="Enter physiological observations..." 
                                        value={symptomQuery}
                                        onChange={e => setSymptomQuery(e.target.value)}
                                        className="flex-1 bg-slate-950/80 border border-white/10 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-indigo-500 transition-all font-bold placeholder:text-slate-700 shadow-inner"
                                    />
                                    <button onClick={handleAnalyzeSymptom} className="px-10 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all active:scale-95 text-xs uppercase tracking-widest shadow-glow flex items-center justify-center gap-2">
                                        Analyze <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN (SIDEBAR) */}
                    <div className="space-y-8">
                        {/* Family Hub */}
                        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                            <h3 className="text-xl font-bold mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-3"><Users className="w-5 h-5 text-indigo-400" /> Family Network</span>
                                <UserPlus className="w-4 h-4 text-slate-500 hover:text-white cursor-pointer" />
                            </h3>
                            <div className="flex gap-4 mb-4">
                                {familyMembers.map(member => (
                                    <div key={member.id} className="text-center group">
                                        <div className={`w-14 h-14 rounded-2xl ${member.active ? 'bg-indigo-500 border-2 border-white' : 'bg-slate-800 border border-white/10 opacity-50'} flex items-center justify-center text-2xl transition-all cursor-pointer hover:scale-110 mb-2`}>
                                            {member.pic}
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{member.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Patient Roadmap / Recovery Step */}
                        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <MapIcon className="w-5 h-5 text-orange-400" /> Recovery Roadmap
                             </h3>
                             <div className="space-y-6">
                                {[
                                    { status: "complete", title: "Diagnostic Phase", icon: <CheckCircle2 className="w-4 h-4" /> },
                                    { status: "active", title: "Prescription Cycle 1", icon: <Activity className="w-4 h-4" /> },
                                    { status: "pending", title: "Follow-up Sync", icon: <Clock className="w-4 h-4" /> }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        {i < 2 && <div className="absolute left-2 top-6 w-0.5 h-6 bg-white/10"></div>}
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${step.status === 'complete' ? 'text-emerald-500' : step.status === 'active' ? 'text-blue-500 animate-pulse' : 'text-slate-700'}`}>
                                            {step.icon}
                                        </div>
                                        <p className={`text-xs font-bold ${step.status === 'active' ? 'text-white' : 'text-slate-500'}`}>{step.title}</p>
                                    </div>
                                ))}
                             </div>
                        </div>

                        {/* Activity Ledger (Timeline) */}
                        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl flex-1">
                            <h3 className="text-xl font-bold mb-8 flex items-center justify-between">
                                <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-400" /> Activity Ledger</span>
                                <Link to="/patient/history" className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-white">Full History</Link>
                            </h3>
                            <div className="space-y-8 relative pl-6 border-l border-white/5">
                                {timeline.length > 0 ? timeline.map((event, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[31px] top-0 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Recent'}</p>
                                        <p className="text-sm font-bold text-white mb-0.5">{event.description || event.eventType}</p>
                                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">{event.eventType} Protocol</p>
                                    </div>
                                )) : (
                                    <div className="py-10 text-center opacity-30">
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Pulse...</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nearby                          <ErrorBoundary>
                            <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl h-80 flex flex-col overflow-hidden">
                                <h3 className="text-xl font-bold mb-4 flex items-center justify-between">
                                    <span className="flex items-center gap-3"><MapPin className="w-5 h-5 text-rose-400" /> Emergency Hubs</span>
                                </h3>
                                <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 grayscale">
                                    <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={0.3} />
                                        {hospitals.map(h => (
                                            <Marker key={h.id} position={h.pos}>
                                                <Popup>{h.name}<br/>{h.type}</Popup>
                                            </Marker>
                                        ))}
                                    </MapContainer>
                                </div>
                            </div>
                        </ErrorBoundary>             </div>

                        {/* Billing Widget */}
                        <div className="bg-slate-900/50 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
                             <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-emerald-400" /> Ledger Balance
                             </h3>
                             {billingInfo.filter(b => b.status === 'PENDING').length > 0 ? (
                                billingInfo.filter(b => b.status === 'PENDING').map(bill => (
                                    <div key={bill.id} className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/10 rounded-2xl">
                                        <div>
                                            <p className="text-xs font-bold text-white">Pending Invoice</p>
                                            <p className="text-xl font-black text-red-400">₹{bill.amount}</p>
                                        </div>
                                        <button onClick={() => handlePayBill(bill.id, 'UPI')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">Pay</button>
                                    </div>
                                ))
                             ) : (
                                <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Account Settled</p>
                                    </div>
                                </div>
                             )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .shadow-glow { box-shadow: 0 0 30px rgba(99, 102, 241, 0.4); }
                .animate-shine {
                    animation: shine 3s infinite linear;
                }
                @keyframes shine {
                    0% { transform: translateX(-100%) skewX(-15deg); }
                    100% { transform: translateX(200%) skewX(-15deg); }
                }
                .leaflet-container {
                    background: #020617 !important;
                }
                .leaflet-bar a {
                    background-color: #1e293b !important;
                    color: white !important;
                    border-bottom: 1px solid #334155 !important;
                }
            `}</style>
        </div>
    );
}
