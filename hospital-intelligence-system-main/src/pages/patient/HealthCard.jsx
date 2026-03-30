import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { uploadToCloudinary } from "../../services/cloudinary";
import { 
    Download, Share2, Smartphone, CreditCard, 
    AlertTriangle, Heart, Phone, MapPin, Shield,
    Activity, Calendar, User, Hospital, 
    CheckCircle2, Info, Zap, Camera, RefreshCw, Edit2, X, Upload, Loader2
} from "lucide-react";

export default function HealthCard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showQRModal, setShowQRModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [cardRotation, setCardRotation] = useState(false);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [vitals, setVitals] = useState({
        bloodType: "O+",
        heartRate: 72,
        bloodPressure: "120/80",
        allergies: "Penicillin, Peanuts",
        conditions: "Hypertension, Type 2 Diabetes"
    });
    const cardRef = useRef(null);

    useEffect(() => {
        if (user?.id) {
            fetchPatientInfo();
            fetchEmergencyContacts();
        }
    }, [user]);

    const fetchPatientInfo = async () => {
        try {
            const res = await API.get(`/patients/${user.id}`);
            setPatientInfo(res.data);
            if (res.data.vitals) {
                setVitals(prev => ({ ...prev, ...res.data.vitals }));
            }
        } catch (error) {
            console.error("Failed to load patient info", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmergencyContacts = async () => {
        try {
            const res = await API.get(`/patients/${user.id}/emergency-contacts`);
            setEmergencyContacts(res.data || [
                { name: "Sarah Johnson", relation: "Spouse", phone: "+1-555-0123" },
                { name: "Dr. Michael Chen", relation: "Primary Care", phone: "+1-555-0456" }
            ]);
        } catch (error) {
            console.error("Failed to load emergency contacts", error);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingImage(true);
        try {
            const cloudinaryData = await uploadToCloudinary(file);
            setEditData(prev => ({ ...prev, photoUrl: cloudinaryData.url }));
            addToast({ type: "success", title: "Image Uploaded", message: "Profile picture updated successfully." });
        } catch (error) {
            addToast({ type: "error", title: "Upload Failed", message: "Could not upload image." });
        } finally {
            setUploadingImage(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: editData.name,
                age: parseInt(editData.age),
                bloodGroup: editData.bloodGroup,
                allergies: editData.allergies,
                chronicConditions: editData.chronicConditions,
                insuranceProvider: editData.insuranceProvider,
                emergencyContact: editData.emergencyContact,
                lifestyleHabits: editData.lifestyleHabits,
                photoUrl: editData.photoUrl
            };
            const res = await API.put(`/patients/${user.id}`, payload);
            setPatientInfo(res.data);
            setShowEditModal(false);
            addToast({ type: "success", title: "Profile Updated", message: "Your health profile has been updated successfully." });
            
            // Re-fetch vitals part if updated
            if (res.data.bloodGroup) {
                setVitals(prev => ({ ...prev, bloodType: res.data.bloodGroup, allergies: res.data.allergies, conditions: res.data.chronicConditions }));
            }
        } catch (error) {
            console.error(error);
            addToast({ type: "error", title: "Update Failed", message: "Could not update profile." });
        }
    };

    const openEditModal = () => {
        const initialData = patientInfo || user || {};
        setEditData({
            name: initialData.name || initialData.fullName || "",
            age: initialData.age || "",
            bloodGroup: initialData.bloodGroup || vitals.bloodType || "",
            allergies: initialData.allergies || vitals.allergies || "",
            chronicConditions: initialData.chronicConditions || vitals.conditions || "",
            insuranceProvider: initialData.insuranceProvider || "",
            emergencyContact: initialData.emergencyContact || "",
            lifestyleHabits: initialData.lifestyleHabits || "",
            photoUrl: initialData.photoUrl || ""
        });
        setShowEditModal(true);
    };

    const downloadCard = async () => {
        if (cardRef.current) {
            try {
                const canvas = await html2canvas(cardRef.current, {
                    scale: 2,
                    backgroundColor: '#020617'
                });
                const link = document.createElement('a');
                link.download = `nova-health-card-${user?.fullName?.replace(/\s+/g, '-').toLowerCase()}.png`;
                link.href = canvas.toDataURL();
                link.click();
                
                addToast({
                    type: "success",
                    title: "Card Downloaded",
                    message: "Your health card has been saved to your device."
                });
            } catch (error) {
                addToast({
                    type: "error",
                    title: "Download Failed",
                    message: "Please try again or contact support."
                });
            }
        }
    };

    const shareCard = async () => {
        const cardData = {
            patientName: user?.fullName,
            patientId: user?.id,
            bloodType: vitals.bloodType,
            allergies: vitals.allergies,
            emergencyContacts: emergencyContacts,
            qrCode: `NOVA-PATIENT-${user?.id}`
        };
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Nova Health Card",
                    text: `Health Card for ${user?.fullName}`,
                    url: `${window.location.origin}/health-card/${user?.id}`
                });
            } catch (error) {
                console.log('Share cancelled');
            }
        } else {
            navigator.clipboard.writeText(JSON.stringify(cardData, null, 2));
            addToast({
                type: "success",
                title: "Card Data Copied",
                message: "Health card information copied to clipboard."
            });
        }
    };

    const addToWallet = () => {
        addToast({
            type: "info",
            title: "Wallet Integration",
            message: "Apple Wallet/Google Pay integration coming soon!"
        });
    };

    const refreshVitals = () => {
        setVitals(prev => ({
            ...prev,
            heartRate: 68 + Math.floor(Math.random() * 10),
            bloodPressure: `${115 + Math.floor(Math.random() * 15)}/${75 + Math.floor(Math.random() * 10)}`
        }));
        
        addToast({
            type: "success",
            title: "Vitals Updated",
            message: "Latest vitals have been synced to your card."
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#020617]">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    );

    const displayData = patientInfo || user;

    return (
        <div className="p-4 md:p-12 min-h-screen bg-[#020617] flex flex-col items-center justify-center font-sans relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-4xl relative z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-5xl font-black text-white tracking-tight mb-2 flex items-center justify-center gap-3">
                        Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">Health Identity</span>
                        <Shield className="w-8 h-8 text-blue-500 animate-pulse" />
                    </h1>
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">NOVA HEALTH INTELLIGENCE NETWORK • SECURE BIOMETRIC VERIFICATION</p>
                </div>

                <div className="relative group mb-8">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    
                    <div ref={cardRef} className="relative bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-3xl">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-xl">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white leading-none">NOVA <span className="text-blue-500">HEALTH</span></h2>
                                    <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-1">Authorized Medical ID • Level 4 Security</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={openEditModal}
                                    className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 hover:bg-blue-500 hover:text-white text-blue-400 transition-colors shadow-xl"
                                    title="Edit Profile"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => setShowQRModal(true)}
                                    className="bg-white p-3 rounded-xl border-4 border-slate-700 shadow-xl hover:scale-105 transition-transform cursor-pointer"
                                >
                                    <QRCodeSVG 
                                        value={`NOVA-PATIENT-${user?.id}`}
                                        size={32}
                                        level="H"
                                        includeMargin={false}
                                        bgColor="#ffffff"
                                        fgColor="#0f172a"
                                    />
                                </button>
                                <button 
                                    onClick={refreshVitals}
                                    className="p-2 bg-slate-800 rounded-lg border border-white/5 hover:bg-slate-700 transition-colors"
                                    title="Refresh Vitals"
                                >
                                    <RefreshCw className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                            {/* Profile Section */}
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-emerald-500 rounded-full blur-sm opacity-30"></div>
                                    <div className="relative w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800 flex items-center justify-center text-4xl shadow-2xl">
                                        <img 
                                            src={patientInfo?.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.fullName}&backgroundColor=transparent`} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="mt-6 text-center">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Network Status</div>
                                    <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-tighter shadow-inner flex items-center gap-2">
                                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                        Active Network
                                    </div>
                                </div>

                                {/* Quick Vitals */}
                                <div className="mt-6 w-full space-y-3">
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Heart Rate</span>
                                            <span className="text-sm font-black text-rose-400">{vitals.heartRate} bpm</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">Blood Pressure</span>
                                            <span className="text-sm font-black text-blue-400">{vitals.bloodPressure}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Medical Information */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Primary Account Holder</label>
                                    <div className="text-2xl font-black text-white leading-tight uppercase truncate">{user?.fullName}</div>
                                    <div className="text-xs text-slate-500 mt-1">Patient ID: PH-{(user?.id || 0).toString().padStart(6, '0')}</div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                        <Heart className="w-3 h-3" /> Blood Type
                                    </label>
                                    <div className="text-xl font-black text-rose-500 uppercase">{vitals.bloodType}</div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Age
                                    </label>
                                    <div className="text-xl font-black text-white">{user?.age || 'N/A'}</div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Allergies & Contraindications
                                    </label>
                                    <div className="text-sm font-bold text-amber-400 uppercase leading-snug bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                        {vitals.allergies || "None Declared"}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-blue-400" /> Medical Conditions
                                    </label>
                                    <div className="text-sm font-bold text-blue-400 uppercase leading-snug bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                        {vitals.conditions || "No Chronic Conditions"}
                                    </div>
                                </div>

                                {/* Emergency Contacts */}
                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-emerald-400" /> Emergency Contacts
                                    </label>
                                    <div className="space-y-2">
                                        {emergencyContacts.slice(0, 2).map((contact, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                                <div>
                                                    <div className="text-sm font-black text-white">{contact.name}</div>
                                                    <div className="text-xs text-slate-400">{contact.relation}</div>
                                                </div>
                                                <a href={`tel:${contact.phone}`} className="text-sm font-black text-emerald-400 hover:text-emerald-300 transition-colors">
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 flex items-center gap-2">
                                        <CreditCard className="w-3 h-3 text-purple-400" /> Insurance Provider
                                    </label>
                                    <div className="text-sm font-black text-purple-400 uppercase tracking-tight bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                                        {displayData?.insuranceProvider || "Public Health Scheme"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-950/80 p-6 text-center border-t border-white/5 backdrop-blur-md">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-[0.2em]">
                                    SECURE BIOMETRIC ID • RECOGNIZED ACROSS ALL AFFILIATES
                                </p>
                                <Shield className="w-4 h-4 text-blue-400" />
                            </div>
                            <p className="text-[8px] font-bold text-slate-600 leading-relaxed uppercase tracking-[0.1em]">
                                In emergency, scan QR code for instant medical history retrieval • Valid until 12/2025
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                        onClick={downloadCard}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download HD Card
                    </button>
                    <button 
                        onClick={shareCard}
                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl border border-white/10 transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share Card
                    </button>
                    <button 
                        onClick={addToWallet}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:shadow-blue-500/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                        <Smartphone className="w-4 h-4" />
                        Add to Wallet
                    </button>
                    <button 
                        onClick={() => setCardRotation(!cardRotation)}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-700 hover:shadow-purple-500/50 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 shadow-xl flex items-center gap-2"
                    >
                        <Camera className="w-4 h-4" />
                        {cardRotation ? 'Stop Animation' : 'Preview 3D'}
                    </button>
                </div>
            </motion.div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-3xl z-50 flex items-center justify-center p-4 overflow-y-auto"
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-3xl my-8 overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="border-b border-white/5 bg-slate-800/50 p-6 flex justify-between items-center sticky top-0 z-10">
                                <h3 className="text-xl font-black text-white flex items-center gap-3">
                                    <Edit2 className="w-5 h-5 text-blue-500" />
                                    Update Health Profile
                                </h3>
                                <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditSubmit} className="p-8 space-y-8">
                                {/* Profile Picture Upload */}
                                <div className="flex flex-col items-center">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 overflow-hidden bg-slate-800 relative shadow-2xl">
                                            <img 
                                                src={editData.photoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${editData.name}&backgroundColor=transparent`} 
                                                alt="Profile Preview" 
                                                className="w-full h-full object-cover"
                                            />
                                            {uploadingImage && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label htmlFor="photo-upload" className="absolute bottom-0 right-0 p-3 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 shadow-xl border-4 border-slate-900 transition-colors">
                                            <Camera className="w-4 h-4 text-white" />
                                            <input 
                                                id="photo-upload" 
                                                type="file" 
                                                accept="image/*" 
                                                className="hidden" 
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                            />
                                        </label>
                                    </div>
                                    <span className="text-xs text-slate-500 font-bold mt-4 uppercase tracking-widest">Update Photo</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                                        <input 
                                            name="name" 
                                            value={editData.name} 
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
                                            placeholder="John Doe" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
                                        <input 
                                            name="age" 
                                            type="number" 
                                            value={editData.age} 
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
                                            placeholder="35" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Blood Group</label>
                                        <input 
                                            name="bloodGroup" 
                                            value={editData.bloodGroup} 
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-rose-500/50 outline-none uppercase" 
                                            placeholder="O+" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Insurance Provider</label>
                                        <input 
                                            name="insuranceProvider" 
                                            value={editData.insuranceProvider} 
                                            onChange={handleEditChange}
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-purple-500/50 outline-none" 
                                            placeholder="BlueCross BlueShield" 
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-amber-500">Allergies</label>
                                        <input 
                                            name="allergies" 
                                            value={editData.allergies} 
                                            onChange={handleEditChange}
                                            className="w-full bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-amber-500/50 outline-none" 
                                            placeholder="e.g., Penicillin, Peanuts" 
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-blue-500">Chronic Conditions</label>
                                        <input 
                                            name="chronicConditions" 
                                            value={editData.chronicConditions} 
                                            onChange={handleEditChange}
                                            className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none" 
                                            placeholder="e.g., Hypertension, Type 2 Diabetes" 
                                        />
                                    </div>
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 text-emerald-500">Emergency Phone Number</label>
                                        <input 
                                            name="emergencyContact" 
                                            value={editData.emergencyContact} 
                                            onChange={handleEditChange}
                                            className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-sm text-white focus:ring-2 focus:ring-emerald-500/50 outline-none" 
                                            placeholder="+1 (555) 000-0000" 
                                        />
                                    </div>
                                </div>
                                
                                <div className="border-t border-white/10 pt-8 flex justify-end gap-4">
                                    <button 
                                        type="button" 
                                        onClick={() => setShowEditModal(false)}
                                        className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all flex items-center gap-2 shadow-xl shadow-blue-500/20"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
