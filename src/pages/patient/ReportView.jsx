import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import API from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Download, Share2, ArrowLeft, Calendar, User,
    Stethoscope, AlertCircle, CheckCircle, Pill, Clock,
    MapPin, Phone, Mail, Activity, Heart, Brain, Thermometer,
    Droplets, Shield, Edit2, Save, X, Printer, Eye,
    FileImage, File, Info, ChevronRight, Star, TrendingUp,
    TrendingDown, Zap, Target, Award, BookOpen
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ReportView() {
    const { reportId } = useParams();
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [notes, setNotes] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [patientHistory, setPatientHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [allergies, setAllergies] = useState([]);

    useEffect(() => {
        if (reportId) {
            fetchReportDetails();
            fetchPatientMedicalData();
        }
    }, [reportId]);

    const fetchPatientMedicalData = async () => {
        try {
            // Fetch patient medical history
            const historyResponse = await API.get(`/medical-history/${user?.id}`);
            setPatientHistory(historyResponse.data || []);
            
            // Fetch prescriptions
            const prescriptionsResponse = await API.get(`/prescriptions/patient/${user?.id}`);
            setPrescriptions(prescriptionsResponse.data || []);
            
            // Fetch allergies
            const allergiesResponse = await API.get(`/patients/${user?.id}/allergies`);
            setAllergies(allergiesResponse.data || []);
        } catch (error) {
            console.error('Failed to fetch medical data:', error);
        }
    };

    const fetchReportDetails = async () => {
        try {
            setLoading(true);
            const response = await API.get(`/reports/${reportId}`);
            setReport(response.data);
            setNotes(response.data.notes || '');
        } catch (error) {
            console.error('Failed to fetch report details:', error);
            addToast({
                type: 'error',
                title: 'Error',
                message: 'Failed to load report details. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        setDownloading(true);
        try {
            const pdf = new jsPDF();
            
            // Add custom font for better rendering
            pdf.setFont('helvetica');
            
            // Header
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 0, 210, 40, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Nova Health Intelligence', 20, 25);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Medical Report', 20, 35);
            
            // Patient Information
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Patient Information', 20, 60);
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            currentY += 10;
            pdf.text(`Name: ${user?.name || 'N/A'}`, 25, currentY);
            currentY += 8;
            pdf.text(`Age: ${user?.age || 'N/A'}`, 25, currentY);
            currentY += 8;
            pdf.text(`Gender: ${user?.gender || 'N/A'}`, 25, currentY);
            currentY += 8;
            pdf.text(`Blood Group: ${user?.bloodGroup || 'N/A'}`, 25, currentY);
            currentY += 8;
            pdf.text(`Contact: ${user?.phone || 'N/A'}`, 25, currentY);
            
            // Report Details
            currentY = checkPageBreak(currentY + 20);
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Report Details', 20, currentY);
            
            currentY += 10;
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Report Name: ${report?.reportName || 'N/A'}`, 25, currentY);
            currentY += 8;
            pdf.text(`Date: ${new Date(report?.uploadDate).toLocaleDateString()}`, 25, currentY);
            currentY += 8;
            pdf.text(`Doctor: ${report?.doctorName || 'N/A'}`, 25, currentY);
            
            // Diagnosis
            if (report?.diagnosis) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Diagnosis', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                const splitDiagnosis = pdf.splitTextToSize(report.diagnosis, 170);
                splitDiagnosis.forEach(line => {
                    pdf.text(line, 25, currentY);
                    currentY += 6;
                });
            }
            
            // Medical Conditions
            if (report?.medicalConditions && report.medicalConditions.length > 0) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Medical Conditions', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                report.medicalConditions.forEach((condition, index) => {
                    pdf.text(`• ${condition}`, 25, currentY);
                    currentY += 8;
                });
            }
            
            // Current Medications
            if (prescriptions && prescriptions.length > 0) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Current Medications', 20, currentY);
                
                const medicationData = prescriptions.map(med => [
                    med.medicineName || med.name || 'N/A',
                    med.dosage || 'N/A',
                    med.frequency || 'N/A',
                    med.duration || 'N/A'
                ]);
                
                pdf.autoTable({
                    startY: currentY + 10,
                    head: [['Medicine', 'Dosage', 'Frequency', 'Duration']],
                    body: medicationData,
                    theme: 'grid',
                    styles: { fontSize: 9, cellPadding: 3 },
                    headStyles: { fillColor: [59, 130, 246], textColor: 255 }
                });
                currentY = pdf.lastAutoTable.finalY;
            }
            
            // Allergies
            if (allergies && allergies.length > 0) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Known Allergies', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                allergies.forEach((allergy, index) => {
                    pdf.text(`• ${allergy.allergen || allergy.name}: ${allergy.reaction || 'Allergic reaction'}`, 25, currentY);
                    currentY += 8;
                });
            }
            
            // Precautions
            if (report?.precautions && report.precautions.length > 0) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Precautions', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                report.precautions.forEach((precaution, index) => {
                    const splitPrecaution = pdf.splitTextToSize(precaution, 165);
                    splitPrecaution.forEach(line => {
                        pdf.text(`• ${line}`, 25, currentY);
                        currentY += 6;
                    });
                    currentY += 2;
                });
            }
            
            // Doctor Notes
            if (report?.doctorNotes) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Doctor Notes', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                const splitNotes = pdf.splitTextToSize(report.doctorNotes, 170);
                splitNotes.forEach(line => {
                    pdf.text(line, 25, currentY);
                    currentY += 6;
                });
            }
            
            // Patient Notes
            if (notes) {
                currentY = checkPageBreak(currentY + 15);
                pdf.setFontSize(16);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Patient Notes', 20, currentY);
                
                currentY += 10;
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'normal');
                const splitPatientNotes = pdf.splitTextToSize(notes, 170);
                splitPatientNotes.forEach(line => {
                    pdf.text(line, 25, currentY);
                    currentY += 6;
                });
            }
            
            // Footer
            currentY = checkPageBreak(currentY + 20);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.text('This report is generated electronically and is valid without signature.', 20, currentY);
            currentY += 8;
            pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, currentY);
            
            // Save the PDF
            pdf.save(`${report?.reportName || 'Medical_Report'}_${new Date().toISOString().split('T')[0]}.pdf`);
            
            addToast({
                type: 'success',
                title: 'PDF Generated',
                message: 'Medical report has been downloaded successfully.'
            });
        } catch (error) {
            console.error('PDF generation failed:', error);
            addToast({
                type: 'error',
                title: 'PDF Generation Failed',
                message: 'Unable to generate PDF. Please try again.'
            });
        } finally {
            setDownloading(false);
        }
    };

    const shareReport = async (method) => {
        try {
            const shareData = {
                title: report?.reportName || 'Medical Report',
                text: `Medical Report for ${report?.patient?.firstName} ${report?.patient?.lastName}`,
                url: window.location.href
            };

            if (method === 'link') {
                await navigator.clipboard.writeText(window.location.href);
                addToast({
                    type: 'success',
                    title: 'Link Copied',
                    message: 'Report link has been copied to clipboard.'
                });
            } else if (method === 'email') {
                window.location.href = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n' + shareData.url)}`;
            } else if (navigator.share) {
                await navigator.share(shareData);
            }
            
            setShowShareModal(false);
        } catch (error) {
            console.error('Share failed:', error);
            addToast({
                type: 'error',
                title: 'Share Failed',
                message: 'Unable to share report. Please try again.'
            });
        }
    };

    const saveNotes = async () => {
        try {
            await API.put(`/reports/${reportId}/notes`, { notes });
            setReport(prev => ({ ...prev, notes }));
            setEditing(false);
            addToast({
                type: 'success',
                title: 'Notes Saved',
                message: 'Your notes have been saved successfully.'
            });
        } catch (error) {
            console.error('Failed to save notes:', error);
            addToast({
                type: 'error',
                title: 'Save Failed',
                message: 'Unable to save notes. Please try again.'
            });
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'low': return 'text-green-500 bg-green-500/10 border-green-500/30';
            default: return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="text-center">
                    <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Report Not Found</h2>
                    <p className="text-slate-400 mb-4">The report you're looking for doesn't exist.</p>
                    <button
                        onClick={() => navigate('/patient/reports')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back to Reports
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="bg-slate-900/50 backdrop-blur-lg border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate('/patient/reports')}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div>
                                    <h1 className="text-xl font-bold text-white">{report.reportName}</h1>
                                    <p className="text-sm text-slate-400">
                                        {formatDate(report.createdAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowShareModal(true)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    disabled={downloading}
                                    className="p-2 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-5 h-5" />
                                    )}
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <Printer className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Patient Information */}
                            <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-400" />
                                    Patient Information
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-400">Full Name</p>
                                        <p className="font-semibold text-white">
                                            {report.patient?.firstName} {report.patient?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Age</p>
                                        <p className="font-semibold text-white">{report.patient?.age} years</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Gender</p>
                                        <p className="font-semibold text-white capitalize">{report.patient?.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Blood Group</p>
                                        <p className="font-semibold text-white">{report.patient?.bloodGroup || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Contact</p>
                                        <p className="font-semibold text-white">{report.patient?.phone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400">Email</p>
                                        <p className="font-semibold text-white">{report.patient?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Diagnosis */}
                            {report.diagnosis && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Stethoscope className="w-5 h-5 text-green-400" />
                                        Diagnosis
                                    </h2>
                                    <div className={`p-4 rounded-xl border ${getSeverityColor(report.severity)}`}>
                                        <p className="text-white leading-relaxed">{report.diagnosis}</p>
                                    </div>
                                </div>
                            )}

                            {/* Medical Conditions */}
                            {report.medicalConditions && report.medicalConditions.length > 0 && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-orange-400" />
                                        Medical Conditions
                                    </h2>
                                    <div className="space-y-2">
                                        {report.medicalConditions.map((condition, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                                                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                                <p className="text-white">{condition}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Prescription */}
                            {report.prescription && report.prescription.length > 0 && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Pill className="w-5 h-5 text-purple-400" />
                                        Prescription
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Medicine</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Dosage</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Frequency</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.prescription.map((med, index) => (
                                                    <tr key={index} className="border-b border-white/5">
                                                        <td className="py-3 px-4 text-white font-medium">{med.medicine}</td>
                                                        <td className="py-3 px-4 text-slate-300">{med.dosage}</td>
                                                        <td className="py-3 px-4 text-slate-300">{med.frequency}</td>
                                                        <td className="py-3 px-4 text-slate-300">{med.duration}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Precautions */}
                            {report.precautions && report.precautions.length > 0 && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-yellow-400" />
                                        Precautions
                                    </h2>
                                    <div className="space-y-3">
                                        {report.precautions.map((precaution, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                                <p className="text-white leading-relaxed">{precaution}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Doctor Notes */}
                            {report.doctorNotes && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                            Doctor Notes
                                        </h2>
                                        <button
                                            onClick={() => setEditing(!editing)}
                                            className="p-2 text-slate-400 hover:text-white transition-colors"
                                        >
                                            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {editing ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full p-3 bg-slate-700/50 border border-white/10 rounded-lg text-white resize-none"
                                                rows={4}
                                                placeholder="Add your notes here..."
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={saveNotes}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditing(false);
                                                        setNotes(report.notes || '');
                                                    }}
                                                    className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-white leading-relaxed">{notes}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Doctor Information */}
                            {report.doctor && (
                                <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-4">Consulting Doctor</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                <Stethoscope className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">Dr. {report.doctor.name}</p>
                                                <p className="text-sm text-slate-400">{report.doctor.specialty}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Mail className="w-4 h-4" />
                                                {report.doctor.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Phone className="w-4 h-4" />
                                                {report.doctor.phone || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Report Status */}
                            <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Report Status</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Status</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            report.status === 'Completed' 
                                                ? 'bg-green-500/20 text-green-400' 
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                            {report.status || 'Completed'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Severity</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(report.severity)}`}>
                                            {report.severity || 'Normal'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">File Type</span>
                                        <span className="text-sm text-white">{report.fileType || 'PDF'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">File Size</span>
                                        <span className="text-sm text-white">
                                            {report.fileSize ? `${(report.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => window.open(report.fileUrl, '_blank')}
                                        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Original File
                                    </button>
                                    <button
                                        onClick={() => navigate('/patient/appointments/new', { 
                                            state: { reportId: report.id } 
                                        })}
                                        className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Calendar className="w-4 h-4" />
                                        Book Follow-up
                                    </button>
                                    <button
                                        onClick={() => navigate('/patient/messages', { 
                                            state: { doctorId: report.doctor?.id } 
                                        })}
                                        className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Contact Doctor
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {showShareModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowShareModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white">Share Report</h3>
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="p-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={() => shareReport('link')}
                                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Share2 className="w-4 h-4" />
                                    Copy Link
                                </button>
                                <button
                                    onClick={() => shareReport('email')}
                                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Mail className="w-4 h-4" />
                                    Share via Email
                                </button>
                                {navigator.share && (
                                    <button
                                        onClick={() => shareReport('native')}
                                        className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4" />
                                        Share via System
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
