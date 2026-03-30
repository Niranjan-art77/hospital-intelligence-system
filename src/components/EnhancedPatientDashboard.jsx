import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Activity, Calendar, Pill, FileText, AlertTriangle,
    TrendingUp, TrendingDown, Clock, User, MapPin, Phone,
    Mail, Star, Zap, Target, Award, Brain, Stethoscope,
    Video, MessageCircle, Bell, Settings, Download,
    ChevronRight, Plus, Eye, Droplets, Thermometer,
    Shield, CheckCircle, X, Menu, Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import SocketService from '../services/socket';
import PrescriptionService from '../services/prescriptionService';

export default function EnhancedPatientDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [healthScore, setHealthScore] = useState(85);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [activePrescriptions, setActivePrescriptions] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [healthTrends, setHealthTrends] = useState([]);
    const [recommendedActions, setRecommendedActions] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState('overview');

    useEffect(() => {
        fetchDashboardData();
        setupSocketListeners();
        setupPrescriptionListeners();
    }, [user]);

    const setupSocketListeners = () => {
        SocketService.connect(user?.token);
        
        SocketService.on('appointment-reminder', (data) => {
            setNotifications(prev => [{
                id: Date.now(),
                type: 'appointment',
                title: 'Appointment Reminder',
                message: `Your appointment with Dr. ${data.doctorName} is tomorrow at ${data.time}`,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });

        SocketService.on('prescription-reminder', (data) => {
            setNotifications(prev => [{
                id: Date.now(),
                type: 'prescription',
                title: 'Medicine Reminder',
                message: `Time to take ${data.medicineName}`,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });

        SocketService.on('report-ready', (data) => {
            setNotifications(prev => [{
                id: Date.now(),
                type: 'report',
                title: 'Report Ready',
                message: `Your ${data.reportType} report is ready to view`,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });
    };

    const setupPrescriptionListeners = () => {
        PrescriptionService.subscribe('new-prescription', (data) => {
            if (data.patientId === user?.id) {
                setActivePrescriptions(prev => [...prev, data.data]);
                addToast({
                    type: 'info',
                    title: 'New Prescription',
                    message: `Dr. ${data.data.doctorName} has added a new prescription`
                });
            }
        });

        PrescriptionService.subscribe('prescription-updated', (data) => {
            if (data.patientId === user?.id) {
                setActivePrescriptions(prev => 
                    prev.map(p => p.id === data.data.id ? data.data : p)
                );
            }
        });
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [
                appointmentsResponse,
                reportsResponse,
                prescriptionsResponse,
                vitalsResponse,
                healthScoreResponse,
                trendsResponse
            ] = await Promise.all([
                API.get(`/appointments/patient/${user?.id}/upcoming`),
                API.get(`/reports/patient/${user?.id}/recent`),
                API.get(`/prescriptions/patient/${user?.id}/active`),
                API.get(`/vitals/patient/${user?.id}/latest`),
                API.get(`/health-score/${user?.id}`),
                API.get(`/health-trends/${user?.id}`)
            ]);

            setUpcomingAppointments(appointmentsResponse.data || []);
            setRecentReports(reportsResponse.data || []);
            setActivePrescriptions(prescriptionsResponse.data || []);
            setVitals(vitalsResponse.data || []);
            setHealthScore(healthScoreResponse.data?.score || 85);
            setHealthTrends(trendsResponse.data || []);
            
            // Generate recommended actions based on data
            generateRecommendedActions();
            
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load dashboard data'
            });
        } finally {
            setLoading(false);
        }
    };

    const generateRecommendedActions = () => {
        const actions = [];
        
        if (healthScore < 70) {
            actions.push({
                type: 'health',
                title: 'Schedule Health Checkup',
                description: 'Your health score needs attention. Consider booking a comprehensive checkup.',
                icon: <Stethoscope className="w-5 h-5" />,
                priority: 'high'
            });
        }
        
        if (activePrescriptions.length > 0) {
            const todayMedicines = activePrescriptions.filter(p => {
                // Check if medicine is scheduled for today
                return p.frequency && (p.frequency.includes('daily') || p.frequency.includes('today'));
            });
            
            if (todayMedicines.length > 0) {
                actions.push({
                    type: 'medication',
                    title: 'Take Your Medications',
                    description: `You have ${todayMedicines.length} medications scheduled for today.`,
                    icon: <Pill className="w-5 h-5" />,
                    priority: 'medium'
                });
            }
        }
        
        if (upcomingAppointments.length === 0) {
            actions.push({
                type: 'appointment',
                title: 'Book a Checkup',
                description: 'No upcoming appointments. Consider scheduling a preventive checkup.',
                icon: <Calendar className="w-5 h-5" />,
                priority: 'low'
            });
        }
        
        if (vitals.length > 0) {
            const latestVitals = vitals[0];
            if (latestVitals.heartRate > 100 || latestVitals.heartRate < 60) {
                actions.push({
                    type: 'vitals',
                    title: 'Monitor Heart Rate',
                    description: 'Your heart rate is outside the normal range. Please consult your doctor.',
                    icon: <Heart className="w-5 h-5" />,
                    priority: 'high'
                });
            }
        }
        
        setRecommendedActions(actions);
    };

    const getHealthScoreColor = (score) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHealthScoreLabel = (score) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Attention';
    };

    const markNotificationAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    };

    const downloadHealthReport = async () => {
        try {
            const response = await API.post(`/reports/health-summary/${user?.id}`, {
                includeAppointments: true,
                includePrescriptions: true,
                includeVitals: true,
                dateRange: '30d'
            });
            
            addToast({
                type: 'success',
                title: 'Report Generated',
                message: 'Your health summary report has been generated'
            });
            
            // Download the report
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = `health-summary-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            
        } catch (error) {
            console.error('Failed to generate health report:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to generate health report'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading your health dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Header */}
            <header className="bg-slate-800 border-b border-white/10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <Heart className="w-8 h-8 text-red-500" />
                            <div>
                                <h1 className="text-2xl font-bold">Patient Dashboard</h1>
                                <p className="text-slate-400">Welcome back, {user?.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Bell className="w-6 h-6 text-slate-400 cursor-pointer" />
                                {notifications.filter(n => !n.read).length > 0 && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                                )}
                            </div>
                            <Settings className="w-6 h-6 text-slate-400 cursor-pointer" />
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold">
                                        {user?.name?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{user?.name}</p>
                                    <p className="text-xs text-slate-400">Patient ID: {user?.id?.slice(-6)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ x: -300 }}
                            animate={{ x: 0 }}
                            exit={{ x: -300 }}
                            className="w-64 bg-slate-800 border-r border-white/10 min-h-screen p-4"
                        >
                            <nav className="space-y-2">
                                {[
                                    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
                                    { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
                                    { id: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-4 h-4" /> },
                                    { id: 'reports', label: 'Medical Reports', icon: <FileText className="w-4 h-4" /> },
                                    { id: 'vitals', label: 'Vitals', icon: <Heart className="w-4 h-4" /> },
                                    { id: 'messages', label: 'Messages', icon: <MessageCircle className="w-4 h-4" /> }
                                ].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedSection(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            selectedSection === item.id
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                        }`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {/* Health Score Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-2">Your Health Score</h2>
                                <div className="flex items-center gap-4">
                                    <div className={`text-6xl font-bold ${getHealthScoreColor(healthScore)}`}>
                                        {healthScore}
                                    </div>
                                    <div>
                                        <p className={`text-xl font-semibold ${getHealthScoreColor(healthScore)}`}>
                                            {getHealthScoreLabel(healthScore)}
                                        </p>
                                        <p className="text-blue-100">Based on your recent health data</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <button
                                    onClick={downloadHealthReport}
                                    className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Health Report
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <Calendar className="w-8 h-8 text-blue-400" />
                                <span className="text-xs text-slate-400">UPCOMING</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{upcomingAppointments.length}</h3>
                            <p className="text-slate-400">Appointments</p>
                            {upcomingAppointments.length > 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    Next: {new Date(upcomingAppointments[0].appointmentDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <Pill className="w-8 h-8 text-green-400" />
                                <span className="text-xs text-slate-400">ACTIVE</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{activePrescriptions.length}</h3>
                            <p className="text-slate-400">Prescriptions</p>
                            {activePrescriptions.length > 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    {activePrescriptions.filter(p => p.frequency?.includes('daily')).length} daily
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <FileText className="w-8 h-8 text-purple-400" />
                                <span className="text-xs text-slate-400">RECENT</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2">{recentReports.length}</h3>
                            <p className="text-slate-400">Medical Reports</p>
                            {recentReports.length > 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    Latest: {new Date(recentReports[0].uploadDate).toLocaleDateString()}
                                </p>
                            )}
                        </div>

                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <Heart className="w-8 h-8 text-red-400" />
                                <span className="text-xs text-slate-400">LATEST</span>
                            </div>
                            <h3 className="text-3xl font-bold mb-2">
                                {vitals.length > 0 ? vitals[0].heartRate : '--'}
                            </h3>
                            <p className="text-slate-400">Heart Rate</p>
                            {vitals.length > 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    BP: {vitals[0].bloodPressure}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recommended Actions */}
                    {recommendedActions.length > 0 && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10 mb-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Recommended Actions
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recommendedActions.map((action, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border ${
                                            action.priority === 'high' 
                                                ? 'bg-red-500/10 border-red-500/20' 
                                                : action.priority === 'medium'
                                                ? 'bg-yellow-500/10 border-yellow-500/20'
                                                : 'bg-blue-500/10 border-blue-500/20'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`p-2 rounded-lg ${
                                                action.priority === 'high' 
                                                    ? 'bg-red-500/20 text-red-400' 
                                                    : action.priority === 'medium'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-blue-500/20 text-blue-400'
                                            }`}>
                                                {action.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white mb-1">{action.title}</h3>
                                                <p className="text-slate-400 text-sm">{action.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upcoming Appointments */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Upcoming Appointments</h2>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {upcomingAppointments.length > 0 ? (
                                    upcomingAppointments.slice(0, 3).map(appointment => (
                                        <div key={appointment.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                        <Stethoscope className="w-5 h-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">Dr. {appointment.doctorName}</h3>
                                                        <p className="text-slate-400 text-sm">{appointment.specialization}</p>
                                                        <p className="text-slate-400 text-sm">
                                                            {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                        <Video className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No upcoming appointments</p>
                                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                            Book Appointment
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Reports */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Recent Reports</h2>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {recentReports.length > 0 ? (
                                    recentReports.slice(0, 3).map(report => (
                                        <div key={report.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                                        <FileText className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">{report.reportName}</h3>
                                                        <p className="text-slate-400 text-sm">
                                                            {new Date(report.uploadDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No recent reports</p>
                                        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                            Upload Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Active Prescriptions */}
                    {activePrescriptions.length > 0 && (
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10 mt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Active Prescriptions</h2>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {activePrescriptions.slice(0, 6).map(prescription => (
                                    <div key={prescription.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/5">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="font-semibold text-white">{prescription.medicineName}</h3>
                                            <Pill className="w-5 h-5 text-green-400" />
                                        </div>
                                        <p className="text-slate-400 text-sm mb-2">{prescription.dosage}</p>
                                        <p className="text-slate-400 text-sm">{prescription.frequency}</p>
                                        <p className="text-slate-400 text-sm">{prescription.duration}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Notifications Panel */}
            <AnimatePresence>
                {notifications.filter(n => !n.read).length > 0 && (
                    <motion.div
                        initial={{ x: 300 }}
                        animate={{ x: 0 }}
                        exit={{ x: 300 }}
                        className="fixed right-4 top-20 w-80 bg-slate-800 rounded-xl border border-white/10 shadow-xl z-50"
                    >
                        <div className="p-4 border-b border-white/10">
                            <h3 className="font-semibold text-white">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.filter(n => !n.read).map(notification => (
                                <div
                                    key={notification.id}
                                    className="p-4 border-b border-white/5 hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    onClick={() => markNotificationAsRead(notification.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${
                                            notification.type === 'appointment' ? 'bg-blue-400' :
                                            notification.type === 'prescription' ? 'bg-green-400' :
                                            notification.type === 'report' ? 'bg-purple-400' :
                                            'bg-yellow-400'
                                        }`}></div>
                                        <div className="flex-1">
                                            <p className="text-white font-medium text-sm">{notification.title}</p>
                                            <p className="text-slate-400 text-xs">{notification.message}</p>
                                            <p className="text-slate-500 text-xs mt-1">
                                                {new Date(notification.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
