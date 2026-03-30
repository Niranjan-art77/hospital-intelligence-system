import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Pill, Clock, Calendar, CheckCircle2, AlertTriangle,
    Plus, X, Edit2, Trash2, Bell, BellOff, RefreshCw,
    TrendingUp, Activity, Heart, Brain, Stethoscope,
    Info, Search, Filter, Download, Share2, Camera,
    Barcode, Package, Syringe, Droplets, Tablets,
    Sun, Moon, Coffee, Utensils, AlertCircle,
    ChevronRight, ChevronDown, User, MapPin, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function MedicationTracker() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [medications, setMedications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMedication, setSelectedMedication] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [adherenceData, setAdherenceData] = useState([]);
    const [todaySchedule, setTodaySchedule] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [newMedication, setNewMedication] = useState({
        name: '',
        dosage: '',
        frequency: '',
        timeOfDay: [],
        startDate: '',
        endDate: '',
        instructions: '',
        prescribedBy: '',
        reason: '',
        sideEffects: '',
        refillReminder: false,
        adherenceGoal: 100
    });

    useEffect(() => {
        fetchMedications();
        fetchAdherenceData();
        generateTodaySchedule();
        checkNotifications();
        
        const interval = setInterval(checkNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const fetchMedications = async () => {
        try {
            const res = await API.get(`/patients/${user?.id}/medications`);
            setMedications(res.data || generateMockMedications());
        } catch (error) {
            console.error('Failed to fetch medications:', error);
            setMedications(generateMockMedications());
        } finally {
            setLoading(false);
        }
    };

    const fetchAdherenceData = async () => {
        try {
            const res = await API.get(`/patients/${user?.id}/medication-adherence`);
            setAdherenceData(res.data || generateMockAdherenceData());
        } catch (error) {
            console.error('Failed to fetch adherence data:', error);
            setAdherenceData(generateMockAdherenceData());
        }
    };

    const generateMockMedications = () => [
        {
            id: 1,
            name: 'Metformin',
            dosage: '500mg',
            frequency: 'Twice daily',
            timeOfDay: ['morning', 'evening'],
            startDate: '2024-01-15',
            endDate: '2024-12-31',
            instructions: 'Take with meals',
            prescribedBy: 'Dr. Sarah Johnson',
            reason: 'Type 2 Diabetes',
            sideEffects: 'Nausea, diarrhea',
            refillReminder: true,
            adherenceGoal: 95,
            currentAdherence: 88,
            status: 'active',
            remainingSupply: 45,
            nextRefill: '2024-02-15'
        },
        {
            id: 2,
            name: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            timeOfDay: ['morning'],
            startDate: '2024-01-10',
            endDate: '2024-12-31',
            instructions: 'Take in the morning',
            prescribedBy: 'Dr. Michael Chen',
            reason: 'Blood Pressure',
            sideEffects: 'Dry cough, dizziness',
            refillReminder: true,
            adherenceGoal: 90,
            currentAdherence: 92,
            status: 'active',
            remainingSupply: 60,
            nextRefill: '2024-02-20'
        },
        {
            id: 3,
            name: 'Vitamin D3',
            dosage: '1000 IU',
            frequency: 'Once daily',
            timeOfDay: ['morning'],
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            instructions: 'Take with breakfast',
            prescribedBy: 'Dr. Sarah Johnson',
            reason: 'Vitamin Deficiency',
            sideEffects: 'None',
            refillReminder: false,
            adherenceGoal: 80,
            currentAdherence: 75,
            status: 'active',
            remainingSupply: 90,
            nextRefill: '2024-03-01'
        }
    ];

    const generateMockAdherenceData = () => [
        { date: 'Mon', taken: 95, missed: 5 },
        { date: 'Tue', taken: 88, missed: 12 },
        { date: 'Wed', taken: 92, missed: 8 },
        { date: 'Thu', taken: 85, missed: 15 },
        { date: 'Fri', taken: 90, missed: 10 },
        { date: 'Sat', taken: 87, missed: 13 },
        { date: 'Sun', taken: 93, missed: 7 }
    ];

    const generateTodaySchedule = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const schedule = [];

        medications.forEach(med => {
            med.timeOfDay.forEach(time => {
                let hour = 8; // Default morning
                if (time === 'afternoon') hour = 14;
                if (time === 'evening') hour = 20;
                if (time === 'night') hour = 22;

                const scheduleTime = new Date();
                scheduleTime.setHours(hour, 0, 0, 0);

                const status = currentHour > hour ? 'missed' : currentHour === hour ? 'due' : 'upcoming';
                
                schedule.push({
                    ...med,
                    scheduledTime: scheduleTime,
                    timeOfDay: time,
                    status,
                    taken: status === 'missed' ? Math.random() > 0.3 : false
                });
            });
        });

        schedule.sort((a, b) => a.scheduledTime - b.scheduledTime);
        setTodaySchedule(schedule);
    };

    const checkNotifications = () => {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        const dueMedications = todaySchedule.filter(med => {
            const medHour = med.scheduledTime.getHours();
            const medMinute = med.scheduledTime.getMinutes();
            return medHour === currentHour && Math.abs(medMinute - currentMinute) <= 5 && !med.taken;
        });

        if (dueMedications.length > 0) {
            setNotifications(dueMedications);
            // Show browser notification if permission granted
            if ('Notification' in window && Notification.permission === 'granted') {
                dueMedications.forEach(med => {
                    new Notification('Medication Reminder', {
                        body: `Time to take ${med.name} - ${med.dosage}`,
                        icon: '/pill-icon.png'
                    });
                });
            }
        }
    };

    const markAsTaken = (medicationId, timeOfDay) => {
        setMedications(prev => prev.map(med => {
            if (med.id === medicationId) {
                return {
                    ...med,
                    currentAdherence: Math.min(100, med.currentAdherence + 2)
                };
            }
            return med;
        }));

        setTodaySchedule(prev => prev.map(med => {
            if (med.id === medicationId && med.timeOfDay === timeOfDay) {
                return { ...med, taken: true, status: 'taken' };
            }
            return med;
        }));

        addToast({
            type: 'success',
            title: 'Medication Taken',
            message: 'Great job! Your adherence has been updated.'
        });

        // Log to API
        API.post(`/patients/${user?.id}/medication-log`, {
            medicationId,
            timeOfDay,
            timestamp: new Date().toISOString(),
            taken: true
        });
    };

    const addMedication = async () => {
        try {
            const medication = {
                ...newMedication,
                id: Date.now(),
                status: 'active',
                currentAdherence: 0,
                remainingSupply: 30
            };

            setMedications(prev => [...prev, medication]);
            setShowAddModal(false);
            setNewMedication({
                name: '',
                dosage: '',
                frequency: '',
                timeOfDay: [],
                startDate: '',
                endDate: '',
                instructions: '',
                prescribedBy: '',
                reason: '',
                sideEffects: '',
                refillReminder: false,
                adherenceGoal: 100
            });

            addToast({
                type: 'success',
                title: 'Medication Added',
                message: 'New medication has been added to your tracker.'
            });

            generateTodaySchedule();
        } catch (error) {
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to add medication. Please try again.'
            });
        }
    };

    const deleteMedication = (medicationId) => {
        setMedications(prev => prev.filter(med => med.id !== medicationId));
        addToast({
            type: 'info',
            title: 'Medication Removed',
            message: 'Medication has been removed from your tracker.'
        });
        generateTodaySchedule();
    };

    const getAdherenceColor = (percentage) => {
        if (percentage >= 90) return 'text-emerald-400';
        if (percentage >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getAdherenceBg = (percentage) => {
        if (percentage >= 90) return 'bg-emerald-500/20 border-emerald-500/30';
        if (percentage >= 75) return 'bg-yellow-500/20 border-yellow-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const getTimeIcon = (timeOfDay) => {
        switch (timeOfDay) {
            case 'morning': return <Sun className="w-4 h-4 text-yellow-400" />;
            case 'afternoon': return <Coffee className="w-4 h-4 text-orange-400" />;
            case 'evening': return <Moon className="w-4 h-4 text-blue-400" />;
            case 'night': return <Moon className="w-4 h-4 text-indigo-400" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    const filteredMedications = medications.filter(med => {
        const matchesSearch = med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             med.reason.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || med.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const overallAdherence = medications.length > 0 
        ? Math.round(medications.reduce((sum, med) => sum + med.currentAdherence, 0) / medications.length)
        : 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#020617]">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#020617] text-white font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                            Medication <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Tracker</span>
                            <Pill className="w-8 h-8 text-purple-500 animate-pulse" />
                        </h1>
                        <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                            SMART MEDICATION MANAGEMENT • ADHERENCE TRACKING
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search medications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="paused">Paused</option>
                        </select>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-black hover:shadow-lg transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Medication
                        </button>
                    </div>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-glowing border-blue-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Pill className="w-8 h-8 text-blue-400" />
                            <span className="text-2xl font-black text-white">{medications.length}</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Medications</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card-glowing border-emerald-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            <span className={`text-2xl font-black ${getAdherenceColor(overallAdherence)}`}>{overallAdherence}%</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Overall Adherence</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card-glowing border-purple-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Clock className="w-8 h-8 text-purple-400" />
                            <span className="text-2xl font-black text-white">{todaySchedule.filter(med => med.status === 'due').length}</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Due Now</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card-glowing border-orange-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <AlertTriangle className="w-8 h-8 text-orange-400" />
                            <span className="text-2xl font-black text-white">{medications.filter(med => med.remainingSupply < 7).length}</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Low Supply Alert</div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Today's Schedule */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass-card-glowing border-purple-500/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                    Today's Schedule
                                </h3>
                                <span className="text-xs text-slate-400">{new Date().toLocaleDateString()}</span>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {todaySchedule.map((med, idx) => (
                                    <motion.div
                                        key={`${med.id}-${med.timeOfDay}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-4 rounded-xl border ${
                                            med.status === 'taken' ? 'bg-emerald-500/10 border-emerald-500/30' :
                                            med.status === 'missed' ? 'bg-red-500/10 border-red-500/30' :
                                            med.status === 'due' ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse' :
                                            'bg-slate-800/50 border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {getTimeIcon(med.timeOfDay)}
                                                <span className="text-sm font-black text-white capitalize">{med.timeOfDay}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                {med.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <div className="font-black text-white">{med.name}</div>
                                            <div className="text-xs text-slate-400">{med.dosage} • {med.frequency}</div>
                                        </div>

                                        {!med.taken && med.status !== 'missed' && (
                                            <button
                                                onClick={() => markAsTaken(med.id, med.timeOfDay)}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-black transition-all"
                                            >
                                                Mark as Taken
                                            </button>
                                        )}

                                        {med.taken && (
                                            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Taken
                                            </div>
                                        )}

                                        {med.status === 'missed' && !med.taken && (
                                            <div className="flex items-center gap-2 text-red-400 text-xs font-black">
                                                <AlertTriangle className="w-3 h-3" />
                                                Missed
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Medications List */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-card-glowing border-blue-500/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <Package className="w-5 h-5 text-blue-400" />
                                    My Medications
                                </h3>
                                <button
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    {showHistory ? 'Hide' : 'Show'} History
                                </button>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filteredMedications.map((med, idx) => (
                                    <motion.div
                                        key={med.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800/70 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-black text-white">{med.name}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-black ${
                                                        med.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        med.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                        {med.status}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-400">{med.dosage} • {med.frequency}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedMedication(med)}
                                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <Info className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteMedication(med.id)}
                                                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Adherence</div>
                                                <div className={`text-lg font-black ${getAdherenceColor(med.currentAdherence)}`}>
                                                    {med.currentAdherence}%
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Supply</div>
                                                <div className={`text-lg font-black ${
                                                    med.remainingSupply < 7 ? 'text-red-400' : 'text-white'
                                                }`}>
                                                    {med.remainingSupply} days
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <User className="w-3 h-3" />
                                            <span>{med.prescribedBy}</span>
                                            {med.remainingSupply < 7 && (
                                                <span className="ml-auto text-red-400 font-black">
                                                    Refill needed!
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Adherence Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 glass-card-glowing border-emerald-500/20 p-6"
                >
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Weekly Adherence Tracking
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={adherenceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Bar dataKey="taken" stackId="a" fill="#10b981" />
                            <Bar dataKey="missed" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Add Medication Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">Add New Medication</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Medication Name</label>
                                    <input
                                        type="text"
                                        value={newMedication.name}
                                        onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="e.g., Metformin"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Dosage</label>
                                    <input
                                        type="text"
                                        value={newMedication.dosage}
                                        onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="e.g., 500mg"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Frequency</label>
                                    <input
                                        type="text"
                                        value={newMedication.frequency}
                                        onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="e.g., Twice daily"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Prescribed By</label>
                                    <input
                                        type="text"
                                        value={newMedication.prescribedBy}
                                        onChange={(e) => setNewMedication({...newMedication, prescribedBy: e.target.value})}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                        placeholder="Doctor's name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Instructions</label>
                                    <textarea
                                        value={newMedication.instructions}
                                        onChange={(e) => setNewMedication({...newMedication, instructions: e.target.value})}
                                        className="w-full p-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                                        rows={3}
                                        placeholder="How and when to take this medication"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={addMedication}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-black hover:shadow-lg transition-all"
                                >
                                    Add Medication
                                </button>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notifications */}
            <AnimatePresence>
                {notifications.length > 0 && (
                    <div className="fixed bottom-4 right-4 z-50 space-y-2">
                        {notifications.map((notification, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 max-w-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <Bell className="w-5 h-5 text-yellow-400 animate-pulse" />
                                    <div>
                                        <div className="font-black text-white">{notification.name}</div>
                                        <div className="text-xs text-slate-400">{notification.dosage} - Time to take!</div>
                                    </div>
                                    <button
                                        onClick={() => markAsTaken(notification.id, notification.timeOfDay)}
                                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs font-black transition-all"
                                    >
                                        Take Now
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
