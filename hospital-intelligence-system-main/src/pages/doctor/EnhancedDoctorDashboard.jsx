import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Clock, FileText, Pill, AlertCircle,
    TrendingUp, TrendingDown, Activity, Heart, Brain, Thermometer,
    Droplets, Star, Award, MessageCircle, Video, Phone,
    Search, Filter, Download, Share2, Eye, Edit2, Plus,
    X, ChevronRight, ChevronDown, Zap, Target, BarChart3,
    LineChart, PieChart, Stethoscope, Hospital, Ambulance,
    Shield, Settings, Bell, LogOut, User, Mail, MapPin,
    RefreshCw, CheckCircle, XCircle, AlertTriangle,
    Patient, Doctor, Schedule, Clipboard, FileMedical,
    Prescription, TestTube, Microscope, XRay, CtScan,
    MRI, Ultrasound, Syringe, Bandage, Heartbeat,
    Pulse, BloodPressure, Weight, Ruler, BloodType,
    Allergy, Report, Archive, Trash2, MoreVertical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis, AreaChart, Area } from 'recharts';

export default function EnhancedDoctorDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [patientQueue, setPatientQueue] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateRange, setDateRange] = useState('today');

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const [
                appointmentsRes,
                patientsRes,
                queueRes,
                notificationsRes,
                analyticsRes,
                reportsRes,
                prescriptionsRes
            ] = await Promise.all([
                API.get(`/doctor/appointments/${user.id}?status=${filterStatus}&range=${dateRange}`),
                API.get(`/doctor/patients/${user.id}`),
                API.get(`/doctor/queue/${user.id}`),
                API.get(`/doctor/notifications/${user.id}`),
                API.get(`/doctor/analytics/${user.id}`),
                API.get(`/doctor/reports/${user.id}`),
                API.get(`/doctor/prescriptions/${user.id}`)
            ]);

            setAppointments(appointmentsRes.data || generateMockAppointments());
            setPatients(patientsRes.data || generateMockPatients());
            setPatientQueue(queueRes.data || generateMockPatientQueue());
            setNotifications(notificationsRes.data || generateMockNotifications());
            setAnalytics(analyticsRes.data || generateMockAnalytics());
            setRecentReports(reportsRes.data || generateMockReports());
            setPrescriptions(prescriptionsRes.data || generateMockPrescriptions());
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
            // Use mock data as fallback
            setAppointments(generateMockAppointments());
            setPatients(generateMockPatients());
            setPatientQueue(generateMockPatientQueue());
            setNotifications(generateMockNotifications());
            setAnalytics(generateMockAnalytics());
            setRecentReports(generateMockReports());
            setPrescriptions(generateMockPrescriptions());
        } finally {
            setLoading(false);
        }
    };

    const generateMockAppointments = () => [
        {
            id: 1,
            patient: { id: 1, name: 'John Doe', age: 45, bloodGroup: 'O+' },
            date: '2024-01-15',
            time: '10:00 AM',
            type: 'video',
            status: 'confirmed',
            reason: 'Regular checkup',
            paymentStatus: 'paid'
        },
        {
            id: 2,
            patient: { id: 2, name: 'Jane Smith', age: 32, bloodGroup: 'A+' },
            date: '2024-01-15',
            time: '11:30 AM',
            type: 'in-person',
            status: 'pending',
            reason: 'Follow-up consultation',
            paymentStatus: 'pending'
        },
        {
            id: 3,
            patient: { id: 3, name: 'Mike Johnson', age: 58, bloodGroup: 'B+' },
            date: '2024-01-15',
            time: '2:00 PM',
            type: 'audio',
            status: 'confirmed',
            reason: 'Medication review',
            paymentStatus: 'paid'
        }
    ];

    const generateMockPatients = () => [
        {
            id: 1,
            name: 'John Doe',
            age: 45,
            gender: 'Male',
            bloodGroup: 'O+',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            address: '123 Main St, Bangalore',
            lastVisit: '2024-01-10',
            conditions: ['Hypertension', 'Type 2 Diabetes'],
            medications: ['Metformin', 'Lisinopril'],
            allergies: ['Penicillin'],
            emergencyContact: { name: 'Sarah Doe', phone: '+1-555-0124' }
        },
        {
            id: 2,
            name: 'Jane Smith',
            age: 32,
            gender: 'Female',
            bloodGroup: 'A+',
            email: 'jane.smith@email.com',
            phone: '+1-555-0125',
            address: '456 Oak Ave, Bangalore',
            lastVisit: '2024-01-08',
            conditions: ['Migraine'],
            medications: ['Sumatriptan'],
            allergies: ['None'],
            emergencyContact: { name: 'Tom Smith', phone: '+1-555-0126' }
        }
    ];

    const generateMockPatientQueue = () => [
        {
            id: 1,
            patient: { name: 'Alice Brown', age: 28, urgency: 'low' },
            appointmentTime: '10:00 AM',
            waitTime: '5 min',
            status: 'waiting'
        },
        {
            id: 2,
            patient: { name: 'Bob Wilson', age: 65, urgency: 'high' },
            appointmentTime: '10:30 AM',
            waitTime: '15 min',
            status: 'in-progress'
        },
        {
            id: 3,
            patient: { name: 'Carol Davis', age: 42, urgency: 'medium' },
            appointmentTime: '11:00 AM',
            waitTime: '0 min',
            status: 'ready'
        }
    ];

    const generateMockNotifications = () => [
        {
            id: 1,
            type: 'appointment',
            title: 'New Appointment Request',
            message: 'John Doe requested an appointment for tomorrow',
            time: '5 min ago',
            read: false
        },
        {
            id: 2,
            type: 'report',
            title: 'Lab Report Available',
            message: 'Jane Smith\'s blood test results are ready',
            time: '1 hour ago',
            read: false
        },
        {
            id: 3,
            type: 'message',
            title: 'Patient Message',
            message: 'Mike Johnson sent you a message',
            time: '2 hours ago',
            read: true
        }
    ];

    const generateMockAnalytics = () => ({
        totalPatients: 245,
        totalAppointments: 1234,
        totalRevenue: 456789,
        averageRating: 4.8,
        satisfactionRate: 96,
        monthlyStats: [
            { month: 'Jan', patients: 45, appointments: 180, revenue: 45000 },
            { month: 'Feb', patients: 52, appointments: 210, revenue: 52000 },
            { month: 'Mar', patients: 48, appointments: 195, revenue: 48000 },
            { month: 'Apr', patients: 58, appointments: 230, revenue: 58000 },
            { month: 'May', patients: 62, appointments: 245, revenue: 61000 },
            { month: 'Jun', patients: 55, appointments: 220, revenue: 55000 }
        ],
        appointmentTypes: [
            { name: 'Video', value: 45, color: '#3b82f6' },
            { name: 'In-Person', value: 35, color: '#10b981' },
            { name: 'Audio', value: 20, color: '#f59e0b' }
        ],
        patientDemographics: {
            ageGroups: [
                { age: '0-18', count: 15 },
                { age: '19-35', count: 45 },
                { age: '36-50', count: 65 },
                { age: '51-65', count: 80 },
                { age: '65+', count: 40 }
            ],
            gender: { male: 120, female: 125 }
        }
    });

    const generateMockReports = () => [
        {
            id: 1,
            patient: { name: 'John Doe' },
            type: 'Blood Test',
            date: '2024-01-14',
            status: 'normal',
            urgency: 'low'
        },
        {
            id: 2,
            patient: { name: 'Jane Smith' },
            type: 'X-Ray',
            date: '2024-01-13',
            status: 'abnormal',
            urgency: 'high'
        },
        {
            id: 3,
            patient: { name: 'Mike Johnson' },
            type: 'MRI',
            date: '2024-01-12',
            status: 'pending',
            urgency: 'medium'
        }
    ];

    const generateMockPrescriptions = () => [
        {
            id: 1,
            patient: { name: 'John Doe' },
            medications: ['Metformin 500mg', 'Lisinopril 10mg'],
            date: '2024-01-10',
            status: 'active'
        },
        {
            id: 2,
            patient: { name: 'Jane Smith' },
            medications: ['Sumatriptan 100mg'],
            date: '2024-01-08',
            status: 'completed'
        }
    ];

    const handleStartConsultation = async (appointmentId) => {
        try {
            await API.put(`/appointments/${appointmentId}/start`);
            addToast({
                type: 'success',
                title: 'Consultation Started',
                message: 'The consultation has been started successfully.'
            });
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to start consultation:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to start consultation. Please try again.'
            });
        }
    };

    const handleGeneratePrescription = async (patientId) => {
        try {
            const response = await API.post('/prescriptions/create', {
                patientId,
                doctorId: user.id,
                medications: [],
                instructions: ''
            });
            
            addToast({
                type: 'success',
                title: 'Prescription Created',
                message: 'New prescription has been created successfully.'
            });
            
            // Open prescription editor
            window.open(`/doctor/prescription/${response.data.id}`, '_blank');
        } catch (error) {
            console.error('Failed to create prescription:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to create prescription. Please try again.'
            });
        }
    };

    const handleViewPatientProfile = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
    };

    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/30';
            case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">{analytics?.totalPatients || 0}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400">Total Patients</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">{analytics?.totalAppointments || 0}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400">Total Appointments</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">₹{(analytics?.totalRevenue || 0).toLocaleString()}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400">Total Revenue</h3>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Star className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">{analytics?.averageRating || 0}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400">Average Rating</h3>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-6">Monthly Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={analytics?.monthlyStats || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                            <Area type="monotone" dataKey="appointments" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Area type="monotone" dataKey="patients" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-6">Appointment Types</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={analytics?.appointmentTypes || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {(analytics?.appointmentTypes || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </div>
    );

    const renderPatientQueue = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Patient Queue</h3>
                <button
                    onClick={fetchDashboardData}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {patientQueue.map((patient, index) => (
                    <motion.div
                        key={patient.id}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">{patient.patient.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span>Age: {patient.patient.age}</span>
                                        <span>Appointment: {patient.appointmentTime}</span>
                                        <span>Wait Time: {patient.waitTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(patient.patient.urgency)}`}>
                                    {patient.patient.urgency} urgency
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(patient.status)}`}>
                                    {patient.status}
                                </span>
                                <button
                                    onClick={() => handleStartConsultation(patient.id)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Start
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderAppointments = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Today's Appointments</h3>
                <div className="flex items-center gap-4">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                        onClick={() => window.open('/doctor/appointments/new', '_blank')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Appointment
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Patient</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Time</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Type</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Payment</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment, index) => (
                            <motion.tr
                                key={appointment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="border-b border-white/5 hover:bg-white/5"
                            >
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-white">{appointment.patient.name}</div>
                                            <div className="text-sm text-slate-400">{appointment.patient.age} years • {appointment.patient.bloodGroup}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-white">{appointment.time}</td>
                                <td className="py-3 px-4">
                                    <span className="px-2 py-1 bg-slate-700 rounded-lg text-xs text-white capitalize">
                                        {appointment.type}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                        appointment.paymentStatus === 'paid' 
                                            ? 'text-green-400 bg-green-400/10 border-green-400/30'
                                            : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                                    }`}>
                                        {appointment.paymentStatus}
                                    </span>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleViewPatientProfile(appointment.patient)}
                                            className="p-1 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleGeneratePrescription(appointment.patient.id)}
                                            className="p-1 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => window.open(`/doctor/video-call/${appointment.id}`, '_blank')}
                                            className="p-1 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <Video className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderReports = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Recent Reports</h3>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Upload Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(report.urgency)}`}>
                                {report.urgency}
                            </span>
                        </div>

                        <h4 className="text-lg font-semibold text-white mb-2">{report.type}</h4>
                        <p className="text-sm text-slate-400 mb-4">{report.patient.name}</p>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">{report.date}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                report.status === 'normal' 
                                    ? 'text-green-400 bg-green-400/10 border-green-400/30'
                                    : report.status === 'abnormal'
                                    ? 'text-red-400 bg-red-400/10 border-red-400/30'
                                    : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
                            }`}>
                                {report.status}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                View
                            </button>
                            <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    const renderPrescriptions = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Recent Prescriptions</h3>
                <button
                    onClick={() => window.open('/doctor/prescription/new', '_blank')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Prescription
                </button>
            </div>

            <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                    <motion.div
                        key={prescription.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <Pill className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-white">{prescription.patient.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span>{prescription.date}</span>
                                        <span>{prescription.medications.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                    prescription.status === 'active' 
                                        ? 'text-green-400 bg-green-400/10 border-green-400/30'
                                        : 'text-blue-400 bg-blue-400/10 border-blue-400/30'
                                }`}>
                                    {prescription.status}
                                </span>
                                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

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
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            Doctor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dashboard</span>
                        </h1>
                        <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                            MEDICAL CONTROL CENTER • PATIENT MANAGEMENT
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Bell className="w-6 h-6 text-slate-400 cursor-pointer" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {[
                        { id: 'overview', label: 'Overview', icon: BarChart3 },
                        { id: 'queue', label: 'Patient Queue', icon: Users },
                        { id: 'appointments', label: 'Appointments', icon: Calendar },
                        { id: 'reports', label: 'Reports', icon: FileText },
                        { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${
                                activeTab === tab.id
                                    ? 'text-blue-400 border-blue-400'
                                    : 'text-slate-400 border-transparent hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && renderOverview()}
                        {activeTab === 'queue' && renderPatientQueue()}
                        {activeTab === 'appointments' && renderAppointments()}
                        {activeTab === 'reports' && renderReports()}
                        {activeTab === 'prescriptions' && renderPrescriptions()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Patient Profile Modal */}
            <AnimatePresence>
                {showPatientModal && selectedPatient && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowPatientModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold text-white">Patient Profile</h3>
                                    <button
                                        onClick={() => setShowPatientModal(false)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Patient Info */}
                                    <div className="lg:col-span-1 space-y-4">
                                        <div className="bg-slate-700/50 rounded-xl p-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                    <User className="w-8 h-8 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white">{selectedPatient.name}</h4>
                                                    <p className="text-sm text-slate-400">{selectedPatient.age} years • {selectedPatient.gender}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300">{selectedPatient.email}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300">{selectedPatient.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300">{selectedPatient.address}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-300">Last visit: {selectedPatient.lastVisit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-700/50 rounded-xl p-4">
                                            <h5 className="font-semibold text-white mb-3">Emergency Contact</h5>
                                            <div className="space-y-2">
                                                <div className="text-sm text-slate-300">{selectedPatient.emergencyContact.name}</div>
                                                <div className="text-sm text-slate-300">{selectedPatient.emergencyContact.phone}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medical Info */}
                                    <div className="lg:col-span-2 space-y-4">
                                        <div className="bg-slate-700/50 rounded-xl p-4">
                                            <h5 className="font-semibold text-white mb-3">Medical Conditions</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPatient.conditions.map((condition, index) => (
                                                    <span key={index} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-700/50 rounded-xl p-4">
                                            <h5 className="font-semibold text-white mb-3">Current Medications</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPatient.medications.map((medication, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400">
                                                        {medication}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-slate-700/50 rounded-xl p-4">
                                            <h5 className="font-semibold text-white mb-3">Allergies</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedPatient.allergies.map((allergy, index) => (
                                                    <span key={index} className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-orange-400">
                                                        {allergy}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleGeneratePrescription(selectedPatient.id)}
                                                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                            >
                                                Generate Prescription
                                            </button>
                                            <button
                                                onClick={() => window.open(`/doctor/medical-history/${selectedPatient.id}`, '_blank')}
                                                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                                            >
                                                View Full History
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                    // Handle file upload
                    const file = e.target.files[0];
                    if (file) {
                        addToast({
                            type: 'info',
                            title: 'File Upload',
                            message: 'File upload functionality will be implemented soon.'
                        });
                    }
                }}
            />
        </div>
    );
}
