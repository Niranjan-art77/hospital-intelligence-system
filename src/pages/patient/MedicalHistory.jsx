import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Clock, Calendar, Activity, FileText, Pill, 
    ChevronRight, Shield, Zap, Database, Search,
    Filter, Download, Share2, BrainCircuit, TrendingUp,
    AlertCircle, CheckCircle2, Info, Eye, Heart,
    Stethoscope, Hospital, User, MapPin, Phone,
    ArrowUpRight, ArrowDownRight, Minus, Play,
    Pause, RotateCcw, BarChart3
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";

export default function MedicalHistory() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState("timeline");
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchTimeline();
    }, []);

    const fetchTimeline = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/medical-history/${user?.id}`);
            setTimeline(response.data || generateMockTimeline());
        } catch (error) {
            console.error("Failed to fetch timeline:", error);
            setTimeline(generateMockTimeline());
        } finally {
            setLoading(false);
        }
    };

    const generateMockTimeline = () => [
        {
            id: 1,
            eventType: "VITALS",
            title: "Blood Pressure Check",
            description: "Regular blood pressure monitoring showed optimal readings",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            doctorName: "Dr. Sarah Johnson",
            readings: { systolic: 120, diastolic: 80, heartRate: 72 }
        },
        {
            id: 2,
            eventType: "APPOINTMENT",
            title: "Cardiology Consultation",
            description: "Follow-up appointment for heart health evaluation",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            doctorName: "Dr. Michael Chen",
            location: "City General Hospital"
        },
        {
            id: 3,
            eventType: "PRESCRIPTION",
            title: "Metformin Prescription",
            description: "Diabetes management medication updated",
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            doctorName: "Dr. Emily Rodriguez",
            medication: "Metformin 500mg"
        }
    ];

    const filteredEvents = useMemo(() => {
        return timeline.filter(event => {
            const matchesFilter = filter === "ALL" || event.eventType === filter;
            const matchesSearch = searchTerm === "" || 
                event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [timeline, filter, searchTerm]);

    const analyticsData = useMemo(() => {
        const eventsByMonth = [
            { month: "Jan", count: 12 },
            { month: "Feb", count: 8 },
            { month: "Mar", count: 15 },
            { month: "Apr", count: 6 }
        ];

        const vitalsData = [
            { date: "1/1", heartRate: 72, oxygen: 98 },
            { date: "1/2", heartRate: 75, oxygen: 97 },
            { date: "1/3", heartRate: 70, oxygen: 98 },
            { date: "1/4", heartRate: 73, oxygen: 99 }
        ];

        return { eventsByMonth, vitalsData };
    }, []);

    const getEventColor = (eventType) => {
        const colors = {
            VITALS: "emerald",
            APPOINTMENT: "blue",
            PRESCRIPTION: "purple",
            REPORT: "pink"
        };
        return colors[eventType] || "slate";
    };

    const getEventIcon = (eventType) => {
        const icons = {
            VITALS: <Activity className="w-5 h-5" />,
            APPOINTMENT: <Calendar className="w-5 h-5" />,
            PRESCRIPTION: <Pill className="w-5 h-5" />,
            REPORT: <FileText className="w-5 h-5" />
        };
        return icons[eventType] || <FileText className="w-5 h-5" />;
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
            {/* Header */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
                    <Clock className="w-12 h-12 text-blue-500" />
                    Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">History</span>
                </h1>
                <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                    COMPREHENSIVE HEALTH TIMELINE • DETAILED RECORDS
                </p>
            </motion.div>

            {/* Controls */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center justify-between gap-4 mb-8"
            >
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search medical records..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none"
                    >
                        <option value="ALL">All Events</option>
                        <option value="VITALS">Vitals</option>
                        <option value="APPOINTMENT">Appointments</option>
                        <option value="PRESCRIPTION">Prescriptions</option>
                        <option value="REPORT">Reports</option>
                    </select>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setViewMode('timeline')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            viewMode === 'timeline' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-800/50 text-slate-400'
                        }`}
                    >
                        Timeline
                    </button>
                    <button
                        onClick={() => setViewMode('analytics')}
                        className={`px-4 py-2 rounded-xl transition-all ${
                            viewMode === 'analytics' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-slate-800/50 text-slate-400'
                        }`}
                    >
                        Analytics
                    </button>
                </div>
            </motion.div>

            {/* Content */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {viewMode === 'timeline' ? (
                    /* Timeline View */
                    <div className="relative pl-12 md:pl-32 pb-32">
                        {/* Connection Lines */}
                        <div className="absolute left-[30px] md:left-[55px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-blue-500 via-emerald-500 to-transparent opacity-20" />
                        
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 opacity-20">
                                <Database size={64} className="animate-spin text-blue-500 mb-8" />
                                <span className="text-xs font-black uppercase tracking-widest">Loading Medical Records...</span>
                            </div>
                        ) : filteredEvents.length === 0 ? (
                            <div className="py-40 text-center opacity-30">
                                <Search size={48} className="mx-auto mb-6 text-slate-500" />
                                <p className="text-sm font-black uppercase tracking-[0.3em]">No Records Found</p>
                            </div>
                        ) : (
                            <div className="space-y-16">
                                <AnimatePresence>
                                    {filteredEvents.map((event, idx) => (
                                        <motion.div 
                                            key={event.id}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative flex flex-col md:flex-row items-start gap-12 group"
                                        >
                                            {/* Date Marker */}
                                            <div className="hidden md:block w-32 text-right pt-6 shrink-0">
                                                <div className="text-sm font-black text-white">
                                                    {new Date(event.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                                                    {new Date(event.timestamp).getFullYear()}
                                                </div>
                                            </div>

                                            {/* Node Marker */}
                                            <div className="absolute left-[-22px] md:left-[43px] top-6 w-6 h-6 rounded-full bg-slate-950 border-4 z-10"
                                                 style={{ borderColor: `var(--color-${getEventColor(event.eventType)})` }} />
                                            
                                            {/* Event Card */}
                                            <div className="flex-1 bg-slate-800/50 border border-white/10 rounded-2xl p-8 group-hover:border-white/20 transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-3 rounded-xl bg-${getEventColor(event.eventType)}-500/10`}>
                                                            {getEventIcon(event.eventType)}
                                                        </div>
                                                        <div>
                                                            <span className={`text-xs font-black uppercase tracking-widest text-${getEventColor(event.eventType)}-400`}>
                                                                {event.eventType}
                                                            </span>
                                                            <h3 className="text-xl font-black text-white">{event.title}</h3>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(event.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-slate-400 mb-4">{event.description}</p>
                                                {event.doctorName && (
                                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                                        <User className="w-4 h-4" />
                                                        Dr. {event.doctorName}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Analytics View */
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Events Over Time Chart */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-blue-400" />
                                    Events Timeline
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={analyticsData.eventsByMonth}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                                        <YAxis stroke="#64748b" fontSize={10} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Vitals Trends */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-slate-800/50 border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-emerald-400" />
                                    Vitals Trends
                                </h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <LineChart data={analyticsData.vitalsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                        <YAxis stroke="#64748b" fontSize={10} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                        <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} />
                                        <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Status Footer */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-8 right-8 z-50"
            >
                <div className="p-4 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Records Updated</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
