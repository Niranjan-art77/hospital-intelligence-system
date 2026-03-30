import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Clock, TrendingUp, Activity, Heart,
    FileText, Pill, AlertTriangle, CheckCircle, Star,
    Search, Filter, Download, Bell, Settings, LogOut,
    ChevronRight, Plus, Eye, Edit2, MessageCircle,
    Video, Phone, Mail, MapPin, Award, Zap,
    Target, Brain, Stethoscope, BarChart3, PieChart,
    TrendingDown, UserPlus, UserCheck, UserX
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import SocketService from '../services/socket';
import AppointmentDetailsModal from './AppointmentDetailsModal';

export default function EnhancedDoctorDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [selectedView, setSelectedView] = useState('overview'); // overview, appointments, patients, prescriptions, analytics
    const [dashboardStats, setDashboardStats] = useState({});
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [recentPatients, setRecentPatients] = useState([]);
    const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState('today');

    useEffect(() => {
        fetchDashboardData();
        setupSocketListeners();
    }, [user]);

    const setupSocketListeners = () => {
        SocketService.connect(user?.token);
        
        SocketService.on('new-appointment', (data) => {
            if (data.doctorId === user?.id) {
                setTodayAppointments(prev => [...prev, data]);
                addToast({
                    type: 'info',
                    title: 'New Appointment',
                    message: `New appointment booked with ${data.patientName}`
                });
            }
        });

        SocketService.on('patient-message', (data) => {
            setNotifications(prev => [{
                id: Date.now(),
                type: 'message',
                title: 'New Message',
                message: `Message from ${data.patientName}`,
                timestamp: new Date(),
                read: false
            }, ...prev]);
        });

        SocketService.on('urgent-case', (data) => {
            addToast({
                type: 'warning',
                title: 'Urgent Case',
                message: `Urgent consultation needed for ${data.patientName}`
            });
        });
    };

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            const [
                statsResponse,
                todayAppointmentsResponse,
                upcomingAppointmentsResponse,
                recentPatientsResponse,
                pendingPrescriptionsResponse
            ] = await Promise.all([
                API.get(`/doctors/${user?.id}/dashboard-stats`),
                API.get(`/appointments/doctor/${user?.id}/today`),
                API.get(`/appointments/doctor/${user?.id}/upcoming`),
                API.get(`/patients/doctor/${user?.id}/recent`),
                API.get(`/prescriptions/doctor/${user?.id}/pending`)
            ]);

            setDashboardStats(statsResponse.data);
            setTodayAppointments(todayAppointmentsResponse.data || []);
            setUpcomingAppointments(upcomingAppointmentsResponse.data || []);
            setRecentPatients(recentPatientsResponse.data || []);
            setPendingPrescriptions(pendingPrescriptionsResponse.data || []);
            
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

    const filteredAppointments = useMemo(() => {
        let filtered = todayAppointments;
        
        if (searchQuery) {
            filtered = filtered.filter(apt =>
                apt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                apt.reason?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        return filtered;
    }, [todayAppointments, searchQuery]);

    const handleAppointmentStatusUpdate = (appointmentId, status, notes) => {
        setTodayAppointments(prev => prev.map(apt =>
            apt.id === appointmentId ? { ...apt, status, doctorNotes: notes } : apt
        ));
        
        fetchDashboardData(); // Refresh stats
    };

    const generateReport = async (type) => {
        try {
            const response = await API.post(`/reports/doctor/${user?.id}/generate`, {
                type,
                dateRange: dateFilter
            });
            
            addToast({
                type: 'success',
                title: 'Report Generated',
                message: `${type} report has been generated successfully`
            });
            
            // Download the report
            const link = document.createElement('a');
            link.href = response.data.downloadUrl;
            link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            
        } catch (error) {
            console.error('Failed to generate report:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to generate report'
            });
        }
    };

    const getAppointmentStatusColor = (status) => {
        const colors = {
            SCHEDULED: 'blue',
            IN_PROGRESS: 'yellow',
            COMPLETED: 'green',
            CANCELLED: 'red',
            NO_SHOW: 'orange'
        };
        return colors[status] || 'gray';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            HIGH: 'red',
            MEDIUM: 'yellow',
            LOW: 'green'
        };
        return colors[priority] || 'gray';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading dashboard...</p>
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
                            <Stethoscope className="w-8 h-8 text-blue-500" />
                            <div>
                                <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
                                <p className="text-slate-400">Dr. {user?.name}</p>
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
                                    <p className="text-xs text-slate-400">{user?.specialization}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-slate-800/50 border-b border-white/10">
                <div className="px-6">
                    <div className="flex gap-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
                            { id: 'appointments', label: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
                            { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" /> },
                            { id: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-4 h-4" /> },
                            { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setSelectedView(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                                    selectedView === tab.id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-6">
                {/* Overview Tab */}
                {selectedView === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <Users className="w-8 h-8 text-blue-400" />
                                    <span className="text-xs text-slate-400">THIS MONTH</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{dashboardStats.totalPatients || 0}</h3>
                                <p className="text-slate-400">Total Patients</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-green-400">+12% from last month</span>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <Calendar className="w-8 h-8 text-green-400" />
                                    <span className="text-xs text-slate-400">TODAY</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{todayAppointments.length}</h3>
                                <p className="text-slate-400">Today's Appointments</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <Clock className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-yellow-400">
                                        {todayAppointments.filter(apt => apt.status === 'SCHEDULED').length} pending
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <Pill className="w-8 h-8 text-purple-400" />
                                    <span className="text-xs text-slate-400">PENDING</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{pendingPrescriptions.length}</h3>
                                <p className="text-slate-400">Pending Prescriptions</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-orange-400">Needs attention</span>
                                </div>
                            </div>

                            <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                                <div className="flex items-center justify-between mb-4">
                                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                                    <span className="text-xs text-slate-400">RATING</span>
                                </div>
                                <h3 className="text-3xl font-bold mb-2">{dashboardStats.averageRating || '4.8'}</h3>
                                <p className="text-slate-400">Average Rating</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <Star className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm text-yellow-400">
                                        {dashboardStats.totalReviews || 0} reviews
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Today's Schedule */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Today's Schedule</h2>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                        <input
                                            type="text"
                                            placeholder="Search appointments..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 pr-4 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <button
                                        onClick={() => generateReport('schedule')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Schedule
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map(appointment => (
                                        <motion.div
                                            key={appointment.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-slate-700/50 rounded-lg p-4 border border-white/5 hover:border-white/10 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                        <User className="w-6 h-6 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">{appointment.patientName}</h3>
                                                        <p className="text-slate-400 text-sm">{appointment.reason}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-sm text-slate-400">
                                                                {appointment.appointmentTime}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getAppointmentStatusColor(appointment.status)}-500/20 text-${getAppointmentStatusColor(appointment.status)}-400`}>
                                                                {appointment.status}
                                                            </span>
                                                            {appointment.priority && (
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getPriorityColor(appointment.priority)}-500/20 text-${getPriorityColor(appointment.priority)}-400`}>
                                                                    {appointment.priority} PRIORITY
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setSelectedAppointment(appointment)}
                                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                        <Video className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                        <Phone className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-400">No appointments scheduled for today</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Patients */}
                        <div className="bg-slate-800 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Recent Patients</h2>
                                <button className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2">
                                    View All
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentPatients.slice(0, 6).map(patient => (
                                    <div key={patient.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">{patient.name}</h3>
                                                <p className="text-slate-400 text-sm">{patient.age} years, {patient.gender}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-slate-400">
                                                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                                            </span>
                                            <button className="text-blue-400 hover:text-blue-300 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs would be implemented similarly */}
                {selectedView !== 'overview' && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            {selectedView.charAt(0).toUpperCase() + selectedView.slice(1)} View
                        </h3>
                        <p className="text-slate-400">This section is under development</p>
                    </div>
                )}
            </main>

            {/* Appointment Details Modal */}
            <AnimatePresence>
                {selectedAppointment && (
                    <AppointmentDetailsModal
                        appointment={selectedAppointment}
                        onClose={() => setSelectedAppointment(null)}
                        onStatusUpdate={handleAppointmentStatusUpdate}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
