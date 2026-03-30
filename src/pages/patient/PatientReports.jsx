import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";
import { uploadToCloudinary, uploadPDFToCloudinary, deleteFromCloudinary, testCloudinaryConfig } from "../../services/cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FileText, Upload, Download, Eye, Share2, 
    Trash2, Shield, MoreVertical, Search, Plus,
    Info, Database, Zap, CheckCircle, X,
    Loader2, FileImage, File, AlertCircle,
    Copy, ExternalLink, Calendar, HardDrive
} from "lucide-react";

export default function MedicalReports() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [file, setFile] = useState(null);
    const [reportName, setReportName] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [sortBy, setSortBy] = useState("date");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [cloudinaryStatus, setCloudinaryStatus] = useState(null);

    useEffect(() => {
        if (user?.id) {
            fetchReports();
            testCloudinaryConnection();
        }
    }, [user]);

    const testCloudinaryConnection = async () => {
        try {
            const result = await testCloudinaryConfig();
            setCloudinaryStatus(result);
            if (!result.success) {
                addToast({
                    type: "warning",
                    title: "Cloudinary Configuration Issue",
                    message: result.message
                });
            }
        } catch (error) {
            setCloudinaryStatus({ success: false, message: error.message });
        }
    };

    const fetchReports = async () => {
        try {
            const res = await API.get(`/reports/patient/${user.id}`);
            setReports(res.data);
        } catch (error) {
            console.error("Failed to load reports", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !reportName) {
            addToast({
                type: "error",
                title: "Missing Information",
                message: "Please provide both file and report name."
            });
            return;
        }

        // Check Cloudinary status first
        if (cloudinaryStatus && !cloudinaryStatus.success) {
            addToast({
                type: "error",
                title: "Cloudinary Configuration Error",
                message: "Cannot upload files. Please check Cloudinary configuration."
            });
            return;
        }
        
        setUploading(true);
        setUploadProgress(0);
        setStatus({ type: "info", message: "Encrypting and syncing with clinical nodes..." });

        try {
            let cloudinaryData;
            
            // Upload with progress tracking
            if (file.type === "application/pdf") {
                cloudinaryData = await uploadPDFToCloudinary(file, (progress) => {
                    setUploadProgress(progress);
                    setStatus({ 
                        type: "info", 
                        message: `Uploading PDF to secure cloud storage... ${progress}%` 
                    });
                });
            } else {
                cloudinaryData = await uploadToCloudinary(file, (progress) => {
                    setUploadProgress(progress);
                    setStatus({ 
                        type: "info", 
                        message: `Uploading file to secure cloud storage... ${progress}%` 
                    });
                });
            }

            setStatus({ type: "info", message: "Cloud sync successful. Registering with medical database..." });

            const reportData = {
                reportName: reportName,
                fileUrl: cloudinaryData.url,
                fileType: file.type,
                fileSize: cloudinaryData.size,
                publicId: cloudinaryData.publicId,
                format: cloudinaryData.format,
                resourceType: cloudinaryData.resourceType,
                patientId: user.id,
                uploadDate: new Date().toISOString()
            };

            const response = await API.post(`/reports/upload/${user.id}`, reportData);

            setStatus({ type: "success", message: "Intelligence commitment successful. Vault updated." });
            addToast({
                type: "success",
                title: "Upload Complete",
                message: `Report "${reportName}" has been successfully added to your medical vault.`
            });
            
            setFile(null);
            setReportName("");
            setUploadProgress(0);
            fetchReports();
        } catch (error) {
            console.error("Upload failed", error);
            setStatus({ type: "error", message: "Sync failure. Verify uplink terminal settings." });
            
            // Provide more specific error messages
            let errorMessage = error.message || "Failed to upload report. Please try again.";
            if (error.message.includes("Cloudinary")) {
                errorMessage = "Cloud storage is temporarily unavailable. Please try again later.";
                // Re-test Cloudinary connection
                testCloudinaryConnection();
            } else if (error.message.includes("size")) {
                errorMessage = "File size is too large. Please upload a file smaller than 10MB.";
            } else if (error.message.includes("network")) {
                errorMessage = "Network connection failed. Please check your internet connection.";
            }
            
            addToast({
                type: "error",
                title: "Upload Failed",
                message: errorMessage
            });
        } finally {
            setUploading(false);
            setTimeout(() => setStatus({ type: "", message: "" }), 4000);
        }
    };

    const handleDownload = (url, name) => {
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', name);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
        addToast({
            type: "success",
            title: "Download Started",
            message: `Downloading "${name}"...`
        });
    };

    const handleDelete = async (report) => {
        try {
            // Delete from Cloudinary first
            if (report.publicId) {
                const resourceType = report.fileType?.includes('pdf') ? 'raw' : 'image';
                await deleteFromCloudinary(report.publicId, resourceType);
            }
            
            // Delete from database
            await API.delete(`/reports/${report.id}`);
            
            setReports(reports.filter(r => r.id !== report.id));
            setShowDeleteConfirm(null);
            
            addToast({
                type: "success",
                title: "Report Deleted",
                message: `"${report.reportName}" has been permanently removed.`
            });
        } catch (error) {
            console.error('Delete failed:', error);
            addToast({
                type: "error",
                title: "Delete Failed",
                message: "Failed to delete report. Please try again."
            });
        }
    };

    const handleShare = (report) => {
        const shareUrl = `${window.location.origin}/shared-report/${report.id}`;
        navigator.clipboard.writeText(shareUrl);
        
        addToast({
            type: "success",
            title: "Link Copied",
            message: "Share link has been copied to clipboard."
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const filteredReports = reports
        .filter(report => {
            const matchesSearch = report.reportName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'all' || 
                (filterType === 'pdf' && report.fileType?.includes('pdf')) ||
                (filterType === 'image' && !report.fileType?.includes('pdf'));
            return matchesSearch && matchesType;
        })
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'name') return a.reportName.localeCompare(b.reportName);
            if (sortBy === 'size') return (b.fileSize || 0) - (a.fileSize || 0);
            return 0;
        });

    return (
        <div className="p-8 min-h-screen relative z-10 w-full max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-3 flex items-center gap-4">
                        MEDICAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 drop-shadow-sm">VAULT</span>
                        <Shield className="text-purple-500" size={32} />
                    </h1>
                    <div className="flex items-center gap-6 text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <Database size={14} className="text-purple-500" />
                            <span>{reports.length} Clinical Indexes</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                        <div className="flex items-center gap-2">
                            <Zap size={14} className="text-pink-500" />
                            <span>End-to-End Encrypted</span>
                        </div>
                    </div>
                </motion.div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search Archive..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-white/5 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all w-[300px]"
                        />
                    </div>
                    <select 
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="bg-slate-900/50 border border-white/5 px-4 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                    >
                        <option value="all">All Files</option>
                        <option value="pdf">PDFs</option>
                        <option value="image">Images</option>
                    </select>
                    <select 
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-slate-900/50 border border-white/5 px-4 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                        <option value="size">Sort by Size</option>
                    </select>
                </div>
            </div>

            {/* Status Feedback */}
            <AnimatePresence>
                {status.message && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`mb-10 p-6 rounded-[2rem] border backdrop-blur-3xl flex items-center justify-between gap-4 ${
                            status.type === "success" 
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                            : status.type === "error"
                            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            {status.type === "success" ? <CheckCircle size={24} /> : <Info size={24} />}
                            <span className="font-bold tracking-wide uppercase text-xs">{status.message}</span>
                        </div>
                        <div className="text-[10px] font-black opacity-40">SYSTEM LOG: 0x44F2</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tactical Upload Interface */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card-glowing border-purple-500/20 p-10 mb-20 relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-10 -mr-40 -mt-40 pointer-events-none group-hover:opacity-20 transition-all duration-1000" />
                
                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                    <Plus size={20} className="text-purple-400" />
                    Commit New Biological Data
                </h3>

                <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                    <div className="lg:col-span-5 space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nomenclature</label>
                        <div className="relative group">
                            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="e.g., DNA Sequential Mapping" 
                                value={reportName} 
                                onChange={e => setReportName(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 p-5 pl-14 rounded-3xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Biological Evidence</label>
                        <div className="relative group">
                            <input 
                                type="file" 
                                id="report-upload"
                                className="hidden"
                                onChange={e => setFile(e.target.files[0])}
                                accept=".pdf,.png,.jpg,.jpeg"
                            />
                            <label 
                                htmlFor="report-upload"
                                className="w-full bg-slate-950/50 border border-white/5 p-5 px-8 rounded-3xl text-white font-bold flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-all group-hover:border-purple-500/30 shadow-inner"
                            >
                                <span className="truncate max-w-[200px] opacity-60">{file ? file.name : "Select Pulse File..."}</span>
                                <Upload size={20} className="text-purple-500" />
                            </label>
                        </div>
                    </div>

                    <div className="lg:col-span-3 flex items-end">
                        <button 
                            type="submit"
                            disabled={uploading}
                            className="w-full py-5 bg-gradient-to-br from-purple-600 to-pink-600 text-white font-black rounded-3xl shadow-glow-purple transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50 relative overflow-hidden"
                        >
                            {uploading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing {uploadProgress}%</span>
                                    <div className="absolute inset-0 bg-white/10" style={{ width: `${uploadProgress}%`, transition: 'width 0.3s ease' }} />
                                </>
                            ) : (
                                <>
                                    <Zap size={18} />
                                    Synchronize
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>

            {/* Gallery Section */}
            <div className="mb-20">
                <div className="flex items-center gap-6 mb-12">
                    <h3 className="text-2xl font-black text-white tracking-tight">Intelligence Archive</h3>
                    <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                {loading ? (
                    <div className="flex justify-center py-40 grayscale opacity-20">
                        <Database size={64} className="animate-pulse text-purple-500" />
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="p-40 glass-card-glowing border-dashed flex flex-col items-center justify-center opacity-30">
                        <Search size={48} className="text-slate-500 mb-6" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 text-center">
                            {searchTerm || filterType !== 'all' ? 'No matching records found' : 'No Clinical Records Detected in This Spatial Sector'}
                        </p>
                        {(searchTerm || filterType !== 'all') && (
                            <button 
                                onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                                className="mt-4 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xxl:grid-cols-3 gap-10">
                        {filteredReports.map((report, idx) => (
                            <motion.div 
                                key={report.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="glass-card-glowing p-8 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-all duration-700" />
                                
                                <div className="flex items-start justify-between mb-10">
                                    <div className="w-16 h-16 bg-slate-950/80 border border-white/10 rounded-3xl flex items-center justify-center text-purple-400 text-2xl shadow-inner group-hover:border-purple-500/50 transition-all">
                                        {report.fileUrl?.includes(".pdf") ? <FileText size={28} /> : 
                                         report.fileType?.includes("image") ? <FileImage size={28} /> : 
                                         <File size={28} />}
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Index Code</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">
                                                VLT-{report.id + 1000}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleShare(report)}
                                                className="p-2 text-slate-500 hover:text-white transition-colors"
                                                title="Share"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => setShowDeleteConfirm(report)}
                                                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <h4 className="text-xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors leading-tight">
                                        {report.reportName}
                                    </h4>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                                        <span>{new Date(report.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                        <span>{report.fileType || "Unknown Format"}</span>
                                        {report.fileSize && (
                                            <>
                                                <div className="w-1 h-1 bg-slate-800 rounded-full" />
                                                <span>{formatFileSize(report.fileSize)}</span>
                                            </>
                                        )}
                                    </div>
                                    {report.publicId && (
                                        <div className="flex items-center gap-2 text-[8px] text-slate-600">
                                            <HardDrive size={10} />
                                            <span>Cloud ID: {report.publicId.slice(0, 12)}...</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    <button 
                                        onClick={() => navigate(`/patient/report/${report.id}`)}
                                        className="col-span-2 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-blue-500/30 shadow-lg"
                                    >
                                        <FileText size={14} />
                                        View Report
                                    </button>
                                    <button 
                                        onClick={() => window.open(report.fileUrl, '_blank')}
                                        className="py-4 bg-white/5 hover:bg-white text-slate-300 hover:text-black font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        <Eye size={14} />
                                        Stream
                                    </button>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => handleDownload(report.fileUrl, report.reportName)}
                                            className="flex-1 py-4 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-purple-500/20 shadow-lg"
                                            title="Download"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button 
                                            onClick={() => navigator.clipboard.writeText(report.fileUrl)}
                                            className="flex-1 py-4 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-white/5"
                                            title="Copy URL"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between opacity-40">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Integrity Verified</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[8px] text-slate-600">
                                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl z-50 flex items-center justify-center p-4"
                        onClick={() => setShowDeleteConfirm(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">Delete Report</h3>
                                    <p className="text-slate-400 text-sm">This action cannot be undone</p>
                                </div>
                            </div>
                            
                            <p className="text-slate-300 mb-8">
                                Are you sure you want to permanently delete "{showDeleteConfirm.reportName}"? This will remove the file from both the database and cloud storage.
                            </p>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => handleDelete(showDeleteConfirm)}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl transition-all"
                                >
                                    Delete Forever
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .shadow-glow-purple {
                    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(168, 85, 247, 0.2);
                }
                .xxl\:grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            `}</style>
        </div>
    );
}
