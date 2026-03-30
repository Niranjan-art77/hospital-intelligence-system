import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, FileText, Pill, Stethoscope, Activity,
    Heart, Brain, AlertCircle, CheckCircle, TrendingUp, TrendingDown,
    Filter, Search, Download, Share2, Eye, Edit2, Plus,
    X, ChevronDown, ChevronRight, User, MapPin, Phone,
    Mail, Star, Award, Zap, Target, BarChart3, LineChart,
    PieChart, Shield, Hospital, Ambulance, Syringe,
    TestTube, Microscope, XRay, CtScan, Mri, Ultrasound,
    Thermometer, Droplets, Weight, Ruler, BloodType,
    Allergy, Prescription, Report, Video, MessageCircle,
    PhoneCall, VideoCall, Archive, Trash2, Settings,
    Info, HelpCircle, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';

export default function MedicalTimeline() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [timelineData, setTimelineData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [expandedEvents, setExpandedEvents] = useState(new Set());
    const [healthMetrics, setHealthMetrics] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchTimelineData();
        fetchHealthMetrics();
        fetchAnalytics();
    }, [user]);

    const fetchTimelineData = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/timeline/${user.id}`, {
                params: { filterType, dateRange, search: searchTerm }
            });
            setTimelineData(response.data || []);
        } catch (error) {
            console.error('Failed to fetch timeline data:', error);
            setTimelineData(generateMockTimelineData());
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthMetrics = async () => {
        try {
            const response = await API.get(`/health-metrics/${user.id}`);
            setHealthMetrics(response.data || generateMockHealthMetrics());
        } catch (error) {
            console.error('Failed to fetch health metrics:', error);
            setHealthMetrics(generateMockHealthMetrics());
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await API.get(`/timeline/analytics/${user.id}`);
            setAnalytics(response.data || generateMockAnalytics());
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
            setAnalytics(generateMockAnalytics());
        }
    };

    const generateMockTimelineData = () => [
        {
            id: 1,
            type: 'appointment',
            title: 'Cardiology Consultation',
            description: 'Regular checkup with Dr. Sarah Johnson',
            date: '2024-01-15T10:00:00Z',
            doctor: { name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
            status: 'completed',
            icon: Stethoscope,
            color: 'blue',
            details: {
                vitals: { bloodPressure: '120/80', heartRate: 72, temperature: '98.6°F' },
                notes: 'Patient is stable. Continue current medication.',
                prescription: ['Metformin 500mg', 'Lisinopril 10mg'],
                nextVisit: '2024-04-15'
            }
        },
        {
            id: 2,
            type: 'report',
            title: 'Blood Test Results',
            description: 'Complete blood count and metabolic panel',
            date: '2024-01-10T09:30:00Z',
            status: 'completed',
            icon: FileText,
            color: 'green',
            details: {
                reportType: 'Blood Test',
                results: {
                    hemoglobin: '14.5 g/dL',
                    wbc: '7.2 × 10³/μL',
                    platelets: '250 × 10³/μL',
                    glucose: '95 mg/dL'
                },
                lab: 'City Diagnostics Center',
                fileUrl: '/reports/blood-test-2024-01-10.pdf'
            }
        },
        {
            id: 3,
            type: 'medication',
            title: 'Prescription Update',
            description: 'New medication prescribed for hypertension',
            date: '2024-01-08T14:15:00Z',
            doctor: { name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
            status: 'active',
            icon: Pill,
            color: 'purple',
            details: {
                medications: [
                    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '3 months' },
                    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '6 months' }
                ],
                instructions: 'Take with food. Monitor blood pressure regularly.'
            }
        },
        {
            id: 4,
            type: 'emergency',
            title: 'Emergency Room Visit',
            description: 'Chest pain evaluation - cleared after tests',
            date: '2023-12-20T22:30:00Z',
            status: 'resolved',
            icon: AlertCircle,
            color: 'red',
            details: {
                hospital: 'City General Hospital',
                symptoms: 'Chest pain, shortness of breath',
                diagnosis: 'Muscle strain',
                treatment: 'Pain medication, rest',
                duration: '4 hours'
            }
        },
        {
            id: 5,
            type: 'vaccination',
            title: 'Flu Vaccine',
            description: 'Annual influenza vaccination',
            date: '2023-11-15T11:00:00Z',
            status: 'completed',
            icon: Syringe,
            color: 'orange',
            details: {
                vaccine: 'Influenza Vaccine 2023-24',
                administeredBy: 'City Clinic',
                sideEffects: 'Mild soreness at injection site',
                nextDue: '2024-11-15'
            }
        },
        {
            id: 6,
            type: 'imaging',
            title: 'Chest X-Ray',
            description: 'Routine chest imaging for heart evaluation',
            date: '2023-10-05T13:45:00Z',
            status: 'completed',
            icon: XRay,
            color: 'cyan',
            details: {
                type: 'Chest X-Ray',
                findings: 'Clear lungs, normal heart size',
                radiologist: 'Dr. Michael Chen',
                impressions: 'No acute cardiopulmonary abnormality',
                fileUrl: '/reports/chest-xray-2023-10-05.jpg'
            }
        }
    ];

    const generateMockHealthMetrics = () => [
        { date: '2023-10', bloodPressure: 130, weight: 175, heartRate: 75 },
        { date: '2023-11', bloodPressure: 128, weight: 173, heartRate: 74 },
        { date: '2023-12', bloodPressure: 125, weight: 172, heartRate: 73 },
        { date: '2024-01', bloodPressure: 120, weight: 170, heartRate: 72 }
    ];

    const generateMockAnalytics = () => ({
        totalEvents: 156,
        eventsByType: {
            appointments: 45,
            reports: 38,
            medications: 28,
            emergencies: 3,
            vaccinations: 8,
            imaging: 12
        },
        healthScore: 82,
        trends: {
            bloodPressure: 'improving',
            weight: 'stable',
            medicationAdherence: 'good'
        }
    });

    const getEventIcon = (type) => {
        const iconMap = {
            appointment: Stethoscope,
            report: FileText,
            medication: Pill,
            emergency: AlertCircle,
            vaccination: Syringe,
            imaging: XRay,
            surgery: Hospital,
            lab: TestTube,
            video: VideoCall,
            message: MessageCircle,
            phone: PhoneCall
        };
        return iconMap[type] || FileText;
    };

    const getEventColor = (type) => {
        const colorMap = {
            appointment: 'blue',
            report: 'green',
            medication: 'purple',
            emergency: 'red',
            vaccination: 'orange',
            imaging: 'cyan',
            surgery: 'pink',
            lab: 'indigo',
            video: 'teal',
            message: 'yellow',
            phone: 'lime'
        };
        return colorMap[type] || 'gray';
    };

    const getStatusColor = (status) => {
        const statusMap = {
            completed: 'text-green-400 bg-green-400/10 border-green-400/30',
            active: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
            pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
            cancelled: 'text-red-400 bg-red-400/10 border-red-400/30',
            resolved: 'text-green-400 bg-green-400/10 border-green-400/30'
        };
        return statusMap[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const toggleEventExpansion = (eventId) => {
        const newExpanded = new Set(expandedEvents);
        if (newExpanded.has(eventId)) {
            newExpanded.delete(eventId);
        } else {
            newExpanded.add(eventId);
        }
        setExpandedEvents(newExpanded);
    };

    const groupEventsByMonth = (events) => {
        const grouped = {};
        events.forEach(event => {
            const date = new Date(event.date);
            const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(event);
        });
        return grouped;
    };

    const filteredEvents = timelineData.filter(event => {
        const matchesType = filterType === 'all' || event.type === filterType;
        const matchesSearch = !searchTerm || 
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesType && matchesSearch;
    });

    const groupedEvents = groupEventsByMonth(filteredEvents);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-5xl font-black text-white tracking-tight mb-4 flex items-center justify-center gap-4">
                        Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Timeline</span>
                        <Calendar className="w-12 h-12 text-purple-500" />
                    </h1>
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                        COMPREHENSIVE HEALTH HISTORY • PERSONALIZED INSIGHTS
                    </p>
                </motion.div>

                {/* Analytics Overview */}
                {analytics && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                    >
                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">{analytics.totalEvents}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-400">Total Events</h3>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <Heart className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">{analytics.healthScore}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-400">Health Score</h3>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">{analytics.eventsByType.medications}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-400">Active Medications</h3>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-2xl font-bold text-white">{analytics.eventsByType.appointments}</span>
                            </div>
                            <h3 className="text-sm font-semibold text-slate-400">Consultations</h3>
                        </div>
                    </motion.div>
                )}

                {/* Health Metrics Chart */}
                {healthMetrics.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8"
                    >
                        <h3 className="text-lg font-semibold text-white mb-6">Health Metrics Trend</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={healthMetrics}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                                <Line type="monotone" dataKey="bloodPressure" stroke="#ef4444" strokeWidth={2} name="Blood Pressure" />
                                <Line type="monotone" dataKey="heartRate" stroke="#3b82f6" strokeWidth={2} name="Heart Rate" />
                                <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={2} name="Weight" />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                )}

                {/* Filters and Search */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search timeline events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                    </div>
                    
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="all">All Events</option>
                        <option value="appointment">Appointments</option>
                        <option value="report">Reports</option>
                        <option value="medication">Medications</option>
                        <option value="emergency">Emergencies</option>
                        <option value="vaccination">Vaccinations</option>
                        <option value="imaging">Imaging</option>
                    </select>

                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="all">All Time</option>
                        <option value="1month">Last Month</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="1year">Last Year</option>
                    </select>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>

                    {/* Timeline Events */}
                    <div className="space-y-8">
                        {Object.entries(groupedEvents).map(([month, events], monthIndex) => (
                            <motion.div
                                key={month}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: monthIndex * 0.1 }}
                            >
                                {/* Month Header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <Calendar className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{month}</h3>
                                        <p className="text-sm text-slate-400">{events.length} events</p>
                                    </div>
                                </div>

                                {/* Events for this month */}
                                <div className="ml-8 space-y-4">
                                    {events.map((event, eventIndex) => {
                                        const Icon = getEventIcon(event.type);
                                        const color = getEventColor(event.type);
                                        const isExpanded = expandedEvents.has(event.id);

                                        return (
                                            <motion.div
                                                key={event.id}
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: monthIndex * 0.1 + eventIndex * 0.05 }}
                                                className="relative"
                                            >
                                                {/* Timeline Dot */}
                                                <div className={`absolute -left-12 w-8 h-8 bg-${color}-500 rounded-full flex items-center justify-center border-4 border-slate-900`}>
                                                    <Icon className="w-4 h-4 text-white" />
                                                </div>

                                                {/* Event Card */}
                                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-slate-800/70 transition-all">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(event.status)}`}>
                                                                    {event.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-slate-400 mb-2">{event.description}</p>
                                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{formatDate(event.date)}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{formatTime(event.date)}</span>
                                                                </div>
                                                                {event.doctor && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Stethoscope className="w-4 h-4" />
                                                                        <span>{event.doctor.name}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setSelectedEvent(event)}
                                                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => toggleEventExpansion(event.id)}
                                                                className="p-2 text-slate-400 hover:text-white transition-colors"
                                                            >
                                                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    <AnimatePresence>
                                                        {isExpanded && event.details && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="border-t border-white/10 pt-4 mt-4"
                                                            >
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {Object.entries(event.details).map(([key, value]) => (
                                                                        <div key={key} className="space-y-2">
                                                                            <h5 className="text-sm font-semibold text-slate-400 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </h5>
                                                                            <div className="text-sm text-white">
                                                                                {typeof value === 'object' ? (
                                                                                    <div className="space-y-1">
                                                                                        {Object.entries(value).map(([subKey, subValue]) => (
                                                                                            <div key={subKey} className="flex justify-between">
                                                                                                <span className="text-slate-400 capitalize">
                                                                                                    {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                                                                                                </span>
                                                                                                <span>{subValue}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : Array.isArray(value) ? (
                                                                                    <ul className="list-disc list-inside space-y-1">
                                                                                        {value.map((item, idx) => (
                                                                                            <li key={idx}>{item}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <span>{value}</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Empty State */}
                {filteredEvents.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                        <p className="text-slate-400">
                            {searchTerm || filterType !== 'all' 
                                ? 'Try adjusting your filters or search terms' 
                                : 'Your medical timeline will appear here'}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-${getEventColor(selectedEvent.type)}-500 rounded-xl flex items-center justify-center`}>
                                            {React.createElement(getEventIcon(selectedEvent.type), { className: 'w-6 h-6 text-white' })}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                                            <p className="text-slate-400">{selectedEvent.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Date</p>
                                            <p className="font-semibold text-white">{formatDate(selectedEvent.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Time</p>
                                            <p className="font-semibold text-white">{formatTime(selectedEvent.date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Status</p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedEvent.status)}`}>
                                                {selectedEvent.status}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Type</p>
                                            <p className="font-semibold text-white capitalize">{selectedEvent.type}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.details && (
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-semibold text-white">Details</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(selectedEvent.details).map(([key, value]) => (
                                                    <div key={key} className="bg-slate-700/50 rounded-lg p-4">
                                                        <h5 className="text-sm font-semibold text-slate-400 mb-2 capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </h5>
                                                        <div className="text-sm text-white">
                                                            {typeof value === 'object' ? (
                                                                <div className="space-y-1">
                                                                    {Object.entries(value).map(([subKey, subValue]) => (
                                                                        <div key={subKey} className="flex justify-between">
                                                                            <span className="text-slate-400 capitalize">
                                                                                {subKey.replace(/([A-Z])/g, ' $1').trim()}:
                                                                            </span>
                                                                            <span>{subValue}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : Array.isArray(value) ? (
                                                                <ul className="list-disc list-inside space-y-1">
                                                                    {value.map((item, idx) => (
                                                                        <li key={idx}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <span>{value}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedEvent(null)}
                                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                                        >
                                            Close
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Export functionality
                                                addToast({
                                                    type: 'info',
                                                    title: 'Export',
                                                    message: 'Export functionality coming soon!'
                                                });
                                            }}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
