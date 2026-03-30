import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Calendar, Clock, User, FileText, Heart, Activity,
    Pill, AlertTriangle, Stethoscope, Phone, Mail, MapPin,
    Download, Share2, Edit2, Save, Plus, Trash2, Eye,
    Thermometer, Droplets, Brain, Shield, ChevronRight,
    Star, TrendingUp, TrendingDown, Zap, Target
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AppointmentDetailsModal({ appointment, onClose, onStatusUpdate }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [loading, setLoading] = useState(true);
    const [patientData, setPatientData] = useState(null);
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [reports, setReports] = useState([]);
    const [allergies, setAllergies] = useState([]);
    const [vitals, setVitals] = useState([]);
    const [editingNotes, setEditingNotes] = useState(false);
    const [doctorNotes, setDoctorNotes] = useState(appointment?.doctorNotes || '');
    const [prescriptionForm, setPrescriptionForm] = useState({
        medicineName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
    });
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

    useEffect(() => {
        if (appointment?.patientId) {
            fetchPatientData();
        }
    }, [appointment]);

    const fetchPatientData = async () => {
        try {
            setLoading(true);
            
            // Fetch patient basic info
            const patientResponse = await API.get(`/patients/${appointment.patientId}`);
            setPatientData(patientResponse.data);
            
            // Fetch medical history
            const historyResponse = await API.get(`/medical-history/${appointment.patientId}`);
            setMedicalHistory(historyResponse.data || []);
            
            // Fetch prescriptions
            const prescriptionsResponse = await API.get(`/prescriptions/patient/${appointment.patientId}`);
            setPrescriptions(prescriptionsResponse.data || []);
            
            // Fetch reports
            const reportsResponse = await API.get(`/reports/patient/${appointment.patientId}`);
            setReports(reportsResponse.data || []);
            
            // Fetch allergies
            const allergiesResponse = await API.get(`/patients/${appointment.patientId}/allergies`);
            setAllergies(allergiesResponse.data || []);
            
            // Fetch latest vitals
            const vitalsResponse = await API.get(`/vitals/patient/${appointment.patientId}/latest`);
            setVitals(vitalsResponse.data || []);
            
        } catch (error) {
            console.error('Failed to fetch patient data:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load patient information'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateAppointmentStatus = async (status) => {
        try {
            await API.put(`/appointments/${appointment.id}/status`, {
                status,
                doctorNotes: doctorNotes
            });
            
            addToast({
                type: 'success',
                title: 'Status Updated',
                message: `Appointment marked as ${status}`
            });
            
            onStatusUpdate && onStatusUpdate(appointment.id, status, doctorNotes);
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to update appointment status'
            });
        }
    };

    const addPrescription = async () => {
        try {
            const prescriptionData = {
                patientId: appointment.patientId,
                doctorId: user.id,
                appointmentId: appointment.id,
                ...prescriptionForm,
                date: new Date().toISOString()
            };
            
            await API.post('/prescriptions', prescriptionData);
            
            setPrescriptions(prev => [...prev, prescriptionData]);
            setPrescriptionForm({
                medicineName: '',
                dosage: '',
                frequency: '',
                duration: '',
                instructions: ''
            });
            setShowPrescriptionForm(false);
            
            addToast({
                type: 'success',
                title: 'Prescription Added',
                message: 'Prescription has been added successfully'
            });
        } catch (error) {
            console.error('Failed to add prescription:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to add prescription'
            });
        }
    };

    const generateConsultationPDF = () => {
        const pdf = new jsPDF();
        
        // Header
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Consultation Report', 105, 20, { align: 'center' });
        
        // Appointment Details
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Date: ${new Date(appointment.appointmentDate).toLocaleDateString()}`, 20, 40);
        pdf.text(`Time: ${appointment.appointmentTime}`, 20, 50);
        pdf.text(`Status: ${appointment.status}`, 20, 60);
        
        // Patient Information
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Patient Information', 20, 80);
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Name: ${patientData?.name || 'N/A'}`, 25, 95);
        pdf.text(`Age: ${patientData?.age || 'N/A'}`, 25, 105);
        pdf.text(`Gender: ${patientData?.gender || 'N/A'}`, 25, 115);
        pdf.text(`Blood Group: ${patientData?.bloodGroup || 'N/A'}`, 25, 125);
        
        // Current Medications
        if (prescriptions.length > 0) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Current Medications', 20, 150);
            
            const medicationData = prescriptions.map(med => [
                med.medicineName || 'N/A',
                med.dosage || 'N/A',
                med.frequency || 'N/A',
                med.duration || 'N/A'
            ]);
            
            pdf.autoTable({
                startY: 160,
                head: [['Medicine', 'Dosage', 'Frequency', 'Duration']],
                body: medicationData,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 3 },
                headStyles: { fillColor: [59, 130, 246], textColor: 255 }
            });
        }
        
        // Doctor Notes
        if (doctorNotes) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Doctor Notes', 20, pdf.lastAutoTable.finalY + 20);
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            const splitNotes = pdf.splitTextToSize(doctorNotes, 170);
            pdf.text(splitNotes, 25, pdf.lastAutoTable.finalY + 35);
        }
        
        pdf.save(`Consultation_${patientData?.name}_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-2xl p-8 flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="text-white">Loading patient information...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-slate-900 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                        <p className="text-blue-100 text-sm mt-1">
                            {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Patient Information */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" />
                                Patient Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Name</p>
                                    <p className="text-white font-medium">{patientData?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Age</p>
                                    <p className="text-white font-medium">{patientData?.age || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Gender</p>
                                    <p className="text-white font-medium">{patientData?.gender || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Blood Group</p>
                                    <p className="text-white font-medium">{patientData?.bloodGroup || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Phone</p>
                                    <p className="text-white font-medium">{patientData?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Email</p>
                                    <p className="text-white font-medium">{patientData?.email || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Latest Vitals */}
                        {vitals.length > 0 && (
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-red-400" />
                                    Latest Vitals
                                </h3>
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{vitals[0]?.heartRate || '--'}</div>
                                        <p className="text-slate-400 text-sm">Heart Rate</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-400">{vitals[0]?.bloodPressure || '--'}</div>
                                        <p className="text-slate-400 text-sm">Blood Pressure</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-emerald-400">{vitals[0]?.oxygen || '--'}</div>
                                        <p className="text-slate-400 text-sm">Oxygen Level</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-400">{vitals[0]?.temperature || '--'}</div>
                                        <p className="text-slate-400 text-sm">Temperature</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Medical History */}
                        {medicalHistory.length > 0 && (
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-purple-400" />
                                    Recent Medical History
                                </h3>
                                <div className="space-y-3">
                                    {medicalHistory.slice(0, 5).map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                                            <div>
                                                <p className="text-white font-medium">{item.title}</p>
                                                <p className="text-slate-400 text-sm">{new Date(item.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Current Prescriptions */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-green-400" />
                                    Current Prescriptions
                                </h3>
                                <button
                                    onClick={() => setShowPrescriptionForm(true)}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {prescriptions.length > 0 ? (
                                <div className="space-y-3">
                                    {prescriptions.map((prescription, index) => (
                                        <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{prescription.medicineName}</p>
                                                    <p className="text-slate-400 text-sm">
                                                        {prescription.dosage} - {prescription.frequency} - {prescription.duration}
                                                    </p>
                                                    {prescription.instructions && (
                                                        <p className="text-slate-400 text-xs mt-1">{prescription.instructions}</p>
                                                    )}
                                                </div>
                                                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-400 text-center py-4">No current prescriptions</p>
                            )}

                            {/* Add Prescription Form */}
                            <AnimatePresence>
                                {showPrescriptionForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 p-4 bg-slate-700 rounded-lg"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={prescriptionForm.medicineName}
                                                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicineName: e.target.value }))}
                                                className="px-3 py-2 bg-slate-600 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Dosage"
                                                value={prescriptionForm.dosage}
                                                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, dosage: e.target.value }))}
                                                className="px-3 py-2 bg-slate-600 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Frequency"
                                                value={prescriptionForm.frequency}
                                                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, frequency: e.target.value }))}
                                                className="px-3 py-2 bg-slate-600 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Duration"
                                                value={prescriptionForm.duration}
                                                onChange={(e) => setPrescriptionForm(prev => ({ ...prev, duration: e.target.value }))}
                                                className="px-3 py-2 bg-slate-600 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <textarea
                                            placeholder="Instructions"
                                            value={prescriptionForm.instructions}
                                            onChange={(e) => setPrescriptionForm(prev => ({ ...prev, instructions: e.target.value }))}
                                            className="w-full mt-4 px-3 py-2 bg-slate-600 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                            rows="2"
                                        />
                                        <div className="flex gap-2 mt-4">
                                            <button
                                                onClick={addPrescription}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Add Prescription
                                            </button>
                                            <button
                                                onClick={() => setShowPrescriptionForm(false)}
                                                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Allergies */}
                        {allergies.length > 0 && (
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    Known Allergies
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {allergies.map((allergy, index) => (
                                        <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm">
                                            {allergy.allergen || allergy.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Doctor Notes */}
                        <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Stethoscope className="w-5 h-5 text-blue-400" />
                                    Doctor Notes
                                </h3>
                                <button
                                    onClick={() => setEditingNotes(!editingNotes)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {editingNotes ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                </button>
                            </div>
                            {editingNotes ? (
                                <textarea
                                    value={doctorNotes}
                                    onChange={(e) => setDoctorNotes(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    rows="4"
                                    placeholder="Add your consultation notes here..."
                                />
                            ) : (
                                <p className="text-slate-300">
                                    {doctorNotes || 'No notes added yet. Click the edit button to add notes.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-80 bg-slate-800/30 p-6 border-l border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => updateAppointmentStatus('COMPLETED')}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Completed
                            </button>
                            <button
                                onClick={() => updateAppointmentStatus('CANCELLED')}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel Appointment
                            </button>
                            <button
                                onClick={generateConsultationPDF}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download Report
                            </button>
                            <button
                                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                Share Report
                            </button>
                        </div>

                        {/* Reports */}
                        {reports.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-md font-semibold text-white mb-3">Recent Reports</h4>
                                <div className="space-y-2">
                                    {reports.slice(0, 3).map((report, index) => (
                                        <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                                            <p className="text-white text-sm font-medium">{report.reportName}</p>
                                            <p className="text-slate-400 text-xs">{new Date(report.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
