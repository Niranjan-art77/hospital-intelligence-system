import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle, Bell, BellOff, CheckCircle2, X,
    TrendingUp, TrendingDown, Activity, Heart,
    Brain, Thermometer, Droplets, Clock, Calendar,
    Zap, Shield, Info, AlertCircle, Warning,
    ChevronRight, Settings, RefreshCw, Filter,
    Search, Download, Share2, Eye, EyeOff,
    User, MapPin, Phone, MessageCircle, Video,
    Pill, Stethoscope, Hospital, Ambulance
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function HealthAlertSystem() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [alertHistory, setAlertHistory] = useState([]);
    const [healthMetrics, setHealthMetrics] = useState({});
    const [vitalsTrend, setVitalsTrend] = useState([]);
    const [riskFactors, setRiskFactors] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [filters, setFilters] = useState({
        severity: 'all',
        type: 'all',
        timeframe: '7days'
    });

    const [alertSettings, setAlertSettings] = useState({
        vitalThresholds: {
            heartRate: { min: 60, max: 100 },
            bloodPressure: { systolic: 120, diastolic: 80 },
            oxygen: { min: 95 },
            temperature: { min: 36.5, max: 37.5 }
        },
        medicationReminders: true,
        appointmentReminders: true,
        healthTips: true,
        emergencyAlerts: true,
        predictiveAlerts: true,
        notificationMethods: {
            inApp: true,
            email: false,
            sms: false,
            push: true
        }
    });

    useEffect(() => {
        fetchHealthData();
        startRealTimeMonitoring();
        return () => stopRealTimeMonitoring();
    }, []);

    const fetchHealthData = async () => {
        try {
            const [alertsRes, metricsRes, historyRes] = await Promise.all([
                API.get(`/patients/${user?.id}/health-alerts`),
                API.get(`/patients/${user?.id}/health-metrics`),
                API.get(`/patients/${user?.id}/alert-history`)
            ]);

            setAlerts(alerts.data || generateMockAlerts());
            setHealthMetrics(metricsRes.data || generateMockMetrics());
            setAlertHistory(historyRes.data || generateMockHistory());
            setVitalsTrend(generateMockVitalsTrend());
            setRiskFactors(generateMockRiskFactors());
            setPredictions(generateMockPredictions());
            
        } catch (error) {
            console.error('Failed to fetch health data:', error);
            // Use mock data as fallback
            setAlerts(generateMockAlerts());
            setHealthMetrics(generateMockMetrics());
            setAlertHistory(generateMockHistory());
            setVitalsTrend(generateMockVitalsTrend());
            setRiskFactors(generateMockRiskFactors());
            setPredictions(generateMockPredictions());
        } finally {
            setLoading(false);
        }
    };

    const generateMockAlerts = () => [
        {
            id: 1,
            type: 'vital',
            severity: 'high',
            title: 'Elevated Blood Pressure Detected',
            message: 'Your systolic pressure is 145 mmHg, above the recommended range.',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            acknowledged: false,
            actionRequired: true,
            recommendations: [
                'Take prescribed blood pressure medication',
                'Reduce sodium intake',
                'Practice deep breathing exercises',
                'Monitor again in 2 hours'
            ],
            vitals: {
                systolic: 145,
                diastolic: 92,
                heartRate: 78
            }
        },
        {
            id: 2,
            type: 'medication',
            severity: 'medium',
            title: 'Medication Adherence Alert',
            message: 'You missed your morning dose of Metformin.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            acknowledged: false,
            actionRequired: true,
            recommendations: [
                'Take medication as soon as possible',
                'Set up additional reminders',
                'Contact doctor if consistently missed'
            ],
            medication: {
                name: 'Metformin',
                dosage: '500mg',
                scheduledTime: '08:00 AM'
            }
        },
        {
            id: 3,
            type: 'predictive',
            severity: 'low',
            title: 'Potential Sleep Quality Issue',
            message: 'Based on your recent activity patterns, sleep quality may be declining.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            acknowledged: true,
            actionRequired: false,
            recommendations: [
                'Maintain consistent sleep schedule',
                'Avoid screens before bedtime',
                'Consider relaxation techniques'
            ],
            confidence: 76
        },
        {
            id: 4,
            type: 'appointment',
            severity: 'medium',
            title: 'Upcoming Appointment Reminder',
            message: 'Cardiology consultation scheduled for tomorrow at 3:00 PM.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
            acknowledged: false,
            actionRequired: false,
            recommendations: [
                'Prepare list of symptoms',
                'Bring current medications',
                'Arrive 15 minutes early'
            ],
            appointment: {
                doctor: 'Dr. Sarah Johnson',
                specialty: 'Cardiology',
                datetime: '2024-01-16T15:00:00',
                location: 'City General Hospital'
            }
        }
    ];

    const generateMockMetrics = () => ({
        heartRate: {
            current: 78,
            average: 72,
            trend: 'stable',
            status: 'normal'
        },
        bloodPressure: {
            systolic: 145,
            diastolic: 92,
            average: { systolic: 125, diastolic: 82 },
            trend: 'increasing',
            status: 'elevated'
        },
        oxygen: {
            current: 96,
            average: 98,
            trend: 'stable',
            status: 'normal'
        },
        temperature: {
            current: 37.2,
            average: 36.8,
            trend: 'stable',
            status: 'normal'
        },
        stress: {
            current: 65,
            average: 58,
            trend: 'increasing',
            status: 'moderate'
        },
        sleep: {
            current: 6.5,
            average: 7.2,
            trend: 'decreasing',
            status: 'poor'
        }
    });

    const generateMockHistory = () => [
        { date: '2024-01-15', type: 'vital', severity: 'high', count: 2 },
        { date: '2024-01-14', type: 'medication', severity: 'medium', count: 1 },
        { date: '2024-01-13', type: 'predictive', severity: 'low', count: 3 },
        { date: '2024-01-12', type: 'appointment', severity: 'medium', count: 1 },
        { date: '2024-01-11', type: 'vital', severity: 'medium', count: 1 }
    ];

    const generateMockVitalsTrend = () => [
        { time: '00:00', heartRate: 65, bloodPressure: 120, oxygen: 98 },
        { time: '04:00', heartRate: 62, bloodPressure: 118, oxygen: 97 },
        { time: '08:00', heartRate: 75, bloodPressure: 125, oxygen: 96 },
        { time: '12:00', heartRate: 82, bloodPressure: 130, oxygen: 97 },
        { time: '16:00', heartRate: 78, bloodPressure: 145, oxygen: 96 },
        { time: '20:00', heartRate: 70, bloodPressure: 135, oxygen: 98 }
    ];

    const generateMockRiskFactors = () => [
        { factor: 'High Blood Pressure', risk: 78, trend: 'increasing', category: 'cardiovascular' },
        { factor: 'Poor Sleep Quality', risk: 65, trend: 'stable', category: 'lifestyle' },
        { factor: 'Medication Non-adherence', risk: 45, trend: 'decreasing', category: 'medication' },
        { factor: 'Stress Levels', risk: 58, trend: 'increasing', category: 'mental' }
    ];

    const generateMockPredictions = () => [
        {
            condition: 'Hypertension Complications',
            probability: 23,
            timeframe: '3 months',
            confidence: 82,
            factors: ['Blood Pressure Trend', 'Medication Adherence', 'Stress Levels'],
            preventiveActions: [
                'Strict medication adherence',
                'Regular BP monitoring',
                'Stress management techniques',
                'Dietary modifications'
            ]
        },
        {
            condition: 'Sleep Disorder',
            probability: 18,
            timeframe: '1 month',
            confidence: 76,
            factors: ['Sleep Duration', 'Screen Time', 'Stress Levels'],
            preventiveActions: [
                'Sleep hygiene improvement',
                'Reduced screen time before bed',
                'Relaxation techniques',
                'Consistent sleep schedule'
            ]
        }
    ];

    let monitoringInterval = useRef(null);

    const startRealTimeMonitoring = () => {
        monitoringInterval.current = setInterval(() => {
            checkForNewAlerts();
            updateVitals();
        }, 30000); // Check every 30 seconds
    };

    const stopRealTimeMonitoring = () => {
        if (monitoringInterval.current) {
            clearInterval(monitoringInterval.current);
        }
    };

    const checkForNewAlerts = () => {
        // Simulate real-time alert generation
        const random = Math.random();
        if (random > 0.95) {
            const newAlert = {
                id: Date.now(),
                type: 'vital',
                severity: random > 0.98 ? 'high' : 'medium',
                title: 'Real-time Vital Alert',
                message: 'Abnormal pattern detected in vital signs.',
                timestamp: new Date().toISOString(),
                acknowledged: false,
                actionRequired: true,
                recommendations: ['Check vitals manually', 'Contact healthcare provider if needed']
            };
            
            setAlerts(prev => [newAlert, ...prev]);
            setNotifications(prev => [newAlert, ...prev.slice(0, 4)]);
            
            addToast({
                type: 'warning',
                title: 'New Health Alert',
                message: newAlert.title
            });
        }
    };

    const updateVitals = () => {
        // Simulate vital updates
        setHealthMetrics(prev => ({
            ...prev,
            heartRate: {
                ...prev.heartRate,
                current: 65 + Math.floor(Math.random() * 20)
            },
            bloodPressure: {
                ...prev.bloodPressure,
                systolic: 120 + Math.floor(Math.random() * 30)
            }
        }));
    };

    const acknowledgeAlert = async (alertId) => {
        setAlerts(prev => prev.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ));
        
        addToast({
            type: 'success',
            title: 'Alert Acknowledged',
            message: 'Health alert has been acknowledged.'
        });

        try {
            await API.post(`/patients/${user?.id}/acknowledge-alert`, { alertId });
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    };

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
        addToast({
            type: 'info',
            title: 'Alert Dismissed',
            message: 'Health alert has been dismissed.'
        });
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'vital': return <Heart className="w-5 h-5" />;
            case 'medication': return <Pill className="w-5 h-5" />;
            case 'appointment': return <Calendar className="w-5 h-5" />;
            case 'predictive': return <Brain className="w-5 h-5" />;
            case 'emergency': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'normal': return 'text-emerald-400';
            case 'elevated': return 'text-yellow-400';
            case 'high': return 'text-orange-400';
            case 'critical': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filters.severity !== 'all' && alert.severity !== filters.severity) return false;
        if (filters.type !== 'all' && alert.type !== filters.type) return false;
        return true;
    });

    const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
    const criticalCount = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length;

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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                            Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">Alert System</span>
                            <Shield className="w-8 h-8 text-red-500 animate-pulse" />
                        </h1>
                        <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                            INTELLIGENT HEALTH MONITORING • PREDICTIVE ALERTS
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-xl">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-black">{unacknowledgedCount} Pending</span>
                        </div>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                        <button
                            onClick={fetchHealthData}
                            className="p-2 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Alert Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-glowing border-red-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-400" />
                            <span className="text-2xl font-black text-red-400">{criticalCount}</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Critical Alerts</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card-glowing border-yellow-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Bell className="w-8 h-8 text-yellow-400" />
                            <span className="text-2xl font-black text-yellow-400">{unacknowledgedCount}</span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Pending Alerts</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card-glowing border-emerald-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            <span className="text-2xl font-black text-emerald-400">
                                {alerts.filter(a => a.acknowledged).length}
                            </span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Acknowledged</div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card-glowing border-purple-500/20 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Brain className="w-8 h-8 text-purple-400" />
                            <span className="text-2xl font-black text-purple-400">
                                {predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length || 0}%
                            </span>
                        </div>
                        <div className="text-sm font-black text-slate-400 uppercase tracking-widest">Risk Score</div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Alerts */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-card-glowing border-red-500/20 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    Active Health Alerts
                                </h3>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={filters.severity}
                                        onChange={(e) => setFilters({...filters, severity: e.target.value})}
                                        className="px-3 py-1 bg-slate-800/50 border border-white/10 rounded-lg text-xs focus:outline-none"
                                    >
                                        <option value="all">All Severity</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({...filters, type: e.target.value})}
                                        className="px-3 py-1 bg-slate-800/50 border border-white/10 rounded-lg text-xs focus:outline-none"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="vital">Vitals</option>
                                        <option value="medication">Medication</option>
                                        <option value="appointment">Appointment</option>
                                        <option value="predictive">Predictive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto">
                                {filteredAlerts.map((alert, idx) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)} ${
                                            !alert.acknowledged ? 'animate-pulse' : ''
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                                                    {getAlertIcon(alert.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white">{alert.title}</h4>
                                                    <p className="text-sm text-slate-300 mt-1">{alert.message}</p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(alert.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!alert.acknowledged && (
                                                    <button
                                                        onClick={() => acknowledgeAlert(alert.id)}
                                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-black transition-all"
                                                    >
                                                        Acknowledge
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => dismissAlert(alert.id)}
                                                    className="p-1 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {alert.recommendations && (
                                            <div className="mt-3">
                                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    Recommended Actions
                                                </div>
                                                <ul className="space-y-1">
                                                    {alert.recommendations.map((rec, i) => (
                                                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                                            <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                            {rec}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {alert.actionRequired && (
                                            <div className="mt-3 flex items-center gap-2 text-xs font-black text-orange-400">
                                                <Warning className="w-3 h-3" />
                                                Action Required
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Health Metrics */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        <div className="glass-card-glowing border-blue-500/20 p-6">
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" />
                                Current Vitals
                            </h3>
                            <div className="space-y-4">
                                {Object.entries(healthMetrics).map(([key, metric]) => (
                                    <div key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {key === 'heartRate' && <Heart className="w-4 h-4 text-red-400" />}
                                            {key === 'bloodPressure' && <Activity className="w-4 h-4 text-blue-400" />}
                                            {key === 'oxygen' && <Droplets className="w-4 h-4 text-cyan-400" />}
                                            {key === 'temperature' && <Thermometer className="w-4 h-4 text-orange-400" />}
                                            {key === 'stress' && <Brain className="w-4 h-4 text-purple-400" />}
                                            {key === 'sleep' && <Moon className="w-4 h-4 text-indigo-400" />}
                                            <div>
                                                <div className="text-sm font-black capitalize text-white">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    Avg: {key === 'bloodPressure' ? 
                                                        `${metric.average.systolic}/${metric.average.diastolic}` : 
                                                        metric.average}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-black ${getStatusColor(metric.status)}`}>
                                                {key === 'bloodPressure' ? 
                                                    `${metric.systolic}/${metric.diastolic}` : 
                                                    metric.current}
                                            </div>
                                            <div className="text-xs text-slate-400 capitalize">{metric.trend}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card-glowing border-purple-500/20 p-6">
                            <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-400" />
                                Risk Predictions
                            </h3>
                            <div className="space-y-3">
                                {predictions.map((prediction, idx) => (
                                    <div key={idx} className="p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-sm font-black text-white">
                                                {prediction.condition}
                                            </div>
                                            <div className={`text-sm font-black ${
                                                prediction.probability > 30 ? 'text-red-400' :
                                                prediction.probability > 20 ? 'text-yellow-400' :
                                                'text-blue-400'
                                            }`}>
                                                {prediction.probability}%
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 mb-2">
                                            Within {prediction.timeframe} • {prediction.confidence}% confidence
                                        </div>
                                        <div className="text-xs text-purple-400">
                                            {prediction.preventiveActions[0]}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Vitals Trend Chart */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 glass-card-glowing border-emerald-500/20 p-6"
                >
                    <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Vitals Trend Analysis
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={vitalsTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                            <YAxis stroke="#64748b" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} />
                            <Line type="monotone" dataKey="bloodPressure" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                            <Line type="monotone" dataKey="oxygen" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Settings Modal */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                        onClick={() => setShowSettings(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-black text-white">Alert Settings</h3>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Notification Preferences
                                    </h4>
                                    <div className="space-y-3">
                                        {Object.entries(alertSettings.notificationMethods).map(([key, value]) => (
                                            <label key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                                <span className="text-sm font-black capitalize text-white">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={value}
                                                    onChange={(e) => setAlertSettings(prev => ({
                                                        ...prev,
                                                        notificationMethods: {
                                                            ...prev.notificationMethods,
                                                            [key]: e.target.checked
                                                        }
                                                    }))}
                                                    className="w-5 h-5 rounded"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                                        Alert Types
                                    </h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'medicationReminders', label: 'Medication Reminders' },
                                            { key: 'appointmentReminders', label: 'Appointment Reminders' },
                                            { key: 'healthTips', label: 'Health Tips' },
                                            { key: 'emergencyAlerts', label: 'Emergency Alerts' },
                                            { key: 'predictiveAlerts', label: 'Predictive Alerts' }
                                        ].map(({ key, label }) => (
                                            <label key={key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                                <span className="text-sm font-black text-white">{label}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={alertSettings[key]}
                                                    onChange={(e) => setAlertSettings(prev => ({
                                                        ...prev,
                                                        [key]: e.target.checked
                                                    }))}
                                                    className="w-5 h-5 rounded"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-black hover:shadow-lg transition-all"
                                >
                                    Save Settings
                                </button>
                                <button
                                    onClick={() => setShowSettings(false)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
