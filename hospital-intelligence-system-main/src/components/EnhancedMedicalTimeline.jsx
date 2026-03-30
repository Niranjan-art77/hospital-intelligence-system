import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, Clock, Heart, Activity, Pill, FileText,
    Stethoscope, AlertTriangle, CheckCircle, TrendingUp,
    TrendingDown, Filter, Search, Download, Share2,
    ChevronRight, ChevronLeft, Zap, Target, Award,
    Brain, Thermometer, Droplets, Eye, User,
    MapPin, Phone, Mail, MoreVertical, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function EnhancedMedicalTimeline() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [viewMode, setViewMode] = useState('timeline'); // timeline, calendar, analytics
    const [currentPage, setCurrentPage] = useState(1);
    const [eventsPerPage] = useState(20);

    useEffect(() => {
        fetchTimelineData();
    }, [user]);

    const fetchTimelineData = async () => {
        try {
            setLoading(true);
            
            // Fetch all relevant data
            const [
                appointmentsResponse,
                prescriptionsResponse,
                reportsResponse,
                vitalsResponse,
                medicalHistoryResponse
            ] = await Promise.all([
                API.get(`/appointments/patient/${user?.id}`),
                API.get(`/prescriptions/patient/${user?.id}`),
                API.get(`/reports/patient/${user?.id}`),
                API.get(`/vitals/patient/${user?.id}`),
                API.get(`/medical-history/${user?.id}`)
            ]);

            // Process and combine all events
            const events = processTimelineEvents([
                ...processAppointments(appointmentsResponse.data || []),
                ...processPrescriptions(prescriptionsResponse.data || []),
                ...processReports(reportsResponse.data || []),
                ...processVitals(vitalsResponse.data || []),
                ...processMedicalHistory(medicalHistoryResponse.data || [])
            ]);

            setTimeline(events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (error) {
            console.error('Failed to fetch timeline data:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load medical timeline'
            });
        } finally {
            setLoading(false);
        }
    };

    const processTimelineEvents = (events) => {
        return events.map(event => ({
            ...event,
            id: event.id || `${event.type}-${Date.now()}-${Math.random()}`,
            timestamp: event.timestamp || event.date || event.createdAt,
            category: event.category || 'general'
        }));
    };

    const processAppointments = (appointments) => {
        return appointments.map(apt => ({
            type: 'appointment',
            title: `Appointment with Dr. ${apt.doctorName}`,
            description: apt.reason || 'Regular consultation',
            timestamp: apt.appointmentDate,
            status: apt.status,
            doctorId: apt.doctorId,
            doctorName: apt.doctorName,
            category: 'consultation',
            icon: <Stethoscope className="w-5 h-5" />,
            color: 'blue'
        }));
    };

    const processPrescriptions = (prescriptions) => {
        return prescriptions.map(pres => ({
            type: 'prescription',
            title: `New Prescription: ${pres.medicineName}`,
            description: `${pres.dosage} - ${pres.frequency} - ${pres.duration}`,
            timestamp: pres.date || pres.createdAt,
            doctorId: pres.doctorId,
            doctorName: pres.doctorName,
            medicines: [pres],
            category: 'medication',
            icon: <Pill className="w-5 h-5" />,
            color: 'green'
        }));
    };

    const processReports = (reports) => {
        return reports.map(report => ({
            type: 'report',
            title: report.reportName,
            description: `Medical report uploaded`,
            timestamp: report.uploadDate,
            fileUrl: report.fileUrl,
            fileType: report.fileType,
            category: 'diagnostic',
            icon: <FileText className="w-5 h-5" />,
            color: 'purple'
        }));
    };

    const processVitals = (vitals) => {
        return vitals.map(vital => ({
            type: 'vitals',
            title: 'Vitals Recorded',
            description: `BP: ${vital.bloodPressure}, HR: ${vital.heartRate}, SpO2: ${vital.oxygen}`,
            timestamp: vital.timestamp,
            readings: vital,
            category: 'monitoring',
            icon: <Heart className="w-5 h-5" />,
            color: 'red'
        }));
    };

    const processMedicalHistory = (history) => {
        return history.map(item => ({
            type: 'medical-history',
            title: item.title,
            description: item.description,
            timestamp: item.timestamp,
            eventType: item.eventType,
            category: 'history',
            icon: <Activity className="w-5 h-5" />,
            color: 'orange'
        }));
    };

    const filteredTimeline = useMemo(() => {
        let filtered = timeline;

        // Apply category filter
        if (filter !== 'all') {
            filtered = filtered.filter(event => event.category === filter);
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(event =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply date range filter
        if (dateRange.start) {
            filtered = filtered.filter(event => new Date(event.timestamp) >= new Date(dateRange.start));
        }
        if (dateRange.end) {
            filtered = filtered.filter(event => new Date(event.timestamp) <= new Date(dateRange.end));
        }

        return filtered;
    }, [timeline, filter, searchQuery, dateRange]);

    const paginatedTimeline = useMemo(() => {
        const startIndex = (currentPage - 1) * eventsPerPage;
        const endIndex = startIndex + eventsPerPage;
        return filteredTimeline.slice(startIndex, endIndex);
    }, [filteredTimeline, currentPage, eventsPerPage]);

    const totalPages = Math.ceil(filteredTimeline.length / eventsPerPage);

    const getEventIcon = (event) => {
        const iconMap = {
            appointment: <Stethoscope className="w-5 h-5" />,
            prescription: <Pill className="w-5 h-5" />,
            report: <FileText className="w-5 h-5" />,
            vitals: <Heart className="w-5 h-5" />,
            'medical-history': <Activity className="w-5 h-5" />
        };
        return iconMap[event.type] || <Calendar className="w-5 h-5" />;
    };

    const getEventColor = (event) => {
        const colorMap = {
            consultation: 'blue',
            medication: 'green',
            diagnostic: 'purple',
            monitoring: 'red',
            history: 'orange',
            general: 'gray'
        };
        return colorMap[event.category] || 'gray';
    };

    const generateTimelinePDF = () => {
        const pdf = new jsPDF();
        
        // Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Medical Timeline', 105, 20, { align: 'center' });
        
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Generated for: ${user?.name || 'Patient'}`, 105, 30, { align: 'center' });
        pdf.text(`Date: ${new Date().toLocaleDateString()}`, 105, 40, { align: 'center' });

        // Timeline data
        const timelineData = filteredTimeline.map(event => [
            new Date(event.timestamp).toLocaleDateString(),
            event.type.charAt(0).toUpperCase() + event.type.slice(1),
            event.title,
            event.description.substring(0, 50) + (event.description.length > 50 ? '...' : '')
        ]);

        // Add table
        pdf.autoTable({
            startY: 60,
            head: [['Date', 'Type', 'Title', 'Description']],
            body: timelineData,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] }
        });

        pdf.save(`medical-timeline-${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const getHealthStats = () => {
        const stats = {
            totalEvents: filteredTimeline.length,
            appointments: filteredTimeline.filter(e => e.type === 'appointment').length,
            prescriptions: filteredTimeline.filter(e => e.type === 'prescription').length,
            reports: filteredTimeline.filter(e => e.type === 'report').length,
            vitalsChecks: filteredTimeline.filter(e => e.type === 'vitals').length
        };

        return stats;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white">Loading your medical timeline...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">Medical Timeline</h1>
                <p className="text-slate-400">Your complete health journey in one place</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Total Events</p>
                            <p className="text-2xl font-bold">{getHealthStats().totalEvents}</p>
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Appointments</p>
                            <p className="text-2xl font-bold">{getHealthStats().appointments}</p>
                        </div>
                        <Stethoscope className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Prescriptions</p>
                            <p className="text-2xl font-bold">{getHealthStats().prescriptions}</p>
                        </div>
                        <Pill className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Reports</p>
                            <p className="text-2xl font-bold">{getHealthStats().reports}</p>
                        </div>
                        <FileText className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-sm">Vitals Checks</p>
                            <p className="text-2xl font-bold">{getHealthStats().vitalsChecks}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-400" />
                    </div>
                </div>
            </div>

            {/* Filters and Controls */}
            <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-white/10">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="all">All Categories</option>
                        <option value="consultation">Consultations</option>
                        <option value="medication">Medications</option>
                        <option value="diagnostic">Diagnostics</option>
                        <option value="monitoring">Monitoring</option>
                        <option value="history">History</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={dateRange.start || ''}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                            type="date"
                            value={dateRange.end || ''}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-2 ml-auto">
                        <button
                            onClick={generateTimelinePDF}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-red-500"></div>
                
                <AnimatePresence>
                    {paginatedTimeline.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start mb-8 group"
                        >
                            {/* Timeline Node */}
                            <div className={`absolute left-6 w-4 h-4 rounded-full border-2 border-slate-900 z-10 bg-${getEventColor(event)}-500`}></div>
                            
                            {/* Event Card */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="ml-16 flex-1 bg-slate-800 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                                onClick={() => setSelectedEvent(event)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg bg-${getEventColor(event)}-500/20`}>
                                            {getEventIcon(event)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getEventColor(event)}-500/20 text-${getEventColor(event)}-400`}>
                                                    {event.category}
                                                </span>
                                                <span className="text-slate-400 text-sm">
                                                    {new Date(event.timestamp).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                                            <p className="text-slate-300">{event.description}</p>
                                            
                                            {event.doctorName && (
                                                <p className="text-slate-400 text-sm mt-2">
                                                    Dr. {event.doctorName}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 bg-slate-800 rounded-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    <span className="text-slate-400">
                        Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 bg-slate-800 rounded-lg border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Event Detail Modal */}
            <AnimatePresence>
                {selectedEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedEvent(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-2xl font-bold text-white">{selectedEvent.title}</h3>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="p-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-400 text-sm">Date & Time</p>
                                        <p className="text-white">
                                            {new Date(selectedEvent.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-slate-400 text-sm">Category</p>
                                        <p className="text-white capitalize">{selectedEvent.category}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-slate-400 text-sm">Description</p>
                                        <p className="text-white">{selectedEvent.description}</p>
                                    </div>
                                    
                                    {selectedEvent.doctorName && (
                                        <div>
                                            <p className="text-slate-400 text-sm">Healthcare Provider</p>
                                            <p className="text-white">Dr. {selectedEvent.doctorName}</p>
                                        </div>
                                    )}
                                    
                                    {selectedEvent.fileUrl && (
                                        <div>
                                            <p className="text-slate-400 text-sm">Attachment</p>
                                            <a
                                                href={selectedEvent.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                View Document
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
