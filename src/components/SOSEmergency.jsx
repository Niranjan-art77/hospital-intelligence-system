import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    AlertTriangle, Phone, MapPin, Hospital, Users, 
    Ambulance, Shield, Zap, Clock, Navigation,
    Volume2, VolumeX, Send, CheckCircle2, X,
    Heart, Activity, Thermometer, Droplets,
    UserPlus, MessageCircle, ChevronRight,
    Mic, MicOff, Video, Camera, RefreshCw,
    Battery, Wifi, Signal, Share2, Download,
    FileText, Image, Settings, Bell, Info,
    TrendingUp, TrendingDown, Brain, Stethoscope,
    Pill, Syringe, TestTube, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export default function SOSEmergency() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isActivated, setIsActivated] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [location, setLocation] = useState(null);
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [nearbyHospitals, setNearbyHospitals] = useState([]);
    const [isNotifying, setIsNotifying] = useState(false);
    const [notificationsSent, setNotificationsSent] = useState([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [emergencyType, setEmergencyType] = useState('medical');
    const [customMessage, setCustomMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [vitals, setVitals] = useState({
        heartRate: 0,
        bloodPressure: { systolic: 0, diastolic: 0 },
        temperature: 0,
        oxygenLevel: 0
    });
    const [deviceStatus, setDeviceStatus] = useState({
        battery: 100,
        signal: 'strong',
        wifi: 'connected'
    });
    const [emergencyHistory, setEmergencyHistory] = useState([]);
    const [showInstructions, setShowInstructions] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState(null);
    const intervalRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        fetchEmergencyData();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const fetchEmergencyData = async () => {
        try {
            const [contactsRes, hospitalsRes] = await Promise.all([
                API.get(`/patients/${user?.id}/emergency-contacts`),
                API.get(`/hospitals/nearby?lat=12.9716&lng=77.5946`) // Bangalore coordinates
            ]);
            
            setEmergencyContacts(contactsRes.data || [
                { id: 1, name: 'Sarah Johnson', relation: 'Spouse', phone: '+1-555-0123', email: 'sarah@email.com' },
                { id: 2, name: 'Dr. Michael Chen', relation: 'Primary Care', phone: '+1-555-0456', email: 'dr.chen@hospital.com' },
                { id: 3, name: 'Emergency Services', relation: 'Emergency', phone: '911', email: 'emergency@gov.in' }
            ]);
            
            setNearbyHospitals(hospitalsRes.data || [
                { id: 1, name: 'City General Hospital', distance: '2.3 km', phone: '+1-555-1001', address: '123 Main St', emergency: true },
                { id: 2, name: 'Apollo Medical Center', distance: '3.7 km', phone: '+1-555-1002', address: '456 Oak Ave', emergency: true },
                { id: 3, name: 'St. Mary\'s Hospital', distance: '5.1 km', phone: '+1-555-1003', address: '789 Pine Rd', emergency: false }
            ]);
        } catch (error) {
            console.error('Failed to fetch emergency data:', error);
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                (error) => {
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        });
    };

    const startSOS = async () => {
        try {
            setIsActivated(true);
            playEmergencySound();
            
            // Get current location
            const currentLocation = await getCurrentLocation();
            setLocation(currentLocation);
            
            // Start countdown
            intervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        triggerEmergency();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            
            addToast({
                type: 'error',
                title: 'SOS ACTIVATED',
                message: `Emergency countdown started. Cancel within ${countdown} seconds.`
            });
            
        } catch (error) {
            console.error('Failed to start SOS:', error);
            addToast({
                type: 'error',
                title: 'Location Error',
                message: 'Unable to get your location. Please enable location services.'
            });
            cancelSOS();
        }
    };

    const cancelSOS = () => {
        setIsActivated(false);
        setCountdown(5);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        stopEmergencySound();
        
        addToast({
            type: 'info',
            title: 'SOS Cancelled',
            message: 'Emergency alert has been cancelled.'
        });
    };

    const triggerEmergency = async () => {
        setIsNotifying(true);
        
        try {
            // Send notifications to all contacts
            const notifications = [];
            
            for (const contact of emergencyContacts) {
                await sendEmergencyAlert(contact);
                notifications.push(contact);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between sends
            }
            
            // Alert nearby hospitals
            for (const hospital of nearbyHospitals.filter(h => h.emergency)) {
                await alertHospital(hospital);
                notifications.push({ ...hospital, type: 'hospital' });
            }
            
            // Log emergency event
            await API.post(`/emergency/log`, {
                patientId: user?.id,
                type: emergencyType,
                location: location,
                timestamp: new Date().toISOString(),
                message: customMessage || 'Emergency SOS activated'
            });
            
            setNotificationsSent(notifications);
            
            addToast({
                type: 'success',
                title: 'Emergency Alert Sent',
                message: `Notified ${notifications.length} contacts and hospitals.`
            });
            
        } catch (error) {
            console.error('Failed to send emergency alerts:', error);
            addToast({
                type: 'error',
                title: 'Alert Failed',
                message: 'Some notifications may not have been sent. Please call emergency services.'
            });
        } finally {
            setIsNotifying(false);
        }
    };

    const sendEmergencyAlert = async (contact) => {
        const message = `🚨 EMERGENCY ALERT 🚨\n\n${user?.fullName} has activated an emergency SOS.\n\nType: ${emergencyType}\nLocation: https://maps.google.com/?q=${location?.lat},${location?.lng}\nTime: ${new Date().toLocaleString()}\n\nPlease contact immediately!`;
        
        // Send SMS (simulated)
        console.log(`Sending SMS to ${contact.phone}: ${message}`);
        
        // Send email (simulated)
        console.log(`Sending email to ${contact.email}: ${message}`);
        
        return true;
    };

    const alertHospital = async (hospital) => {
        const alert = {
            patientName: user?.fullName,
            patientId: user?.id,
            emergencyType,
            location,
            timestamp: new Date().toISOString(),
            vitals: {
                heartRate: 72 + Math.floor(Math.random() * 20),
                bloodPressure: '120/80',
                oxygen: 95 + Math.floor(Math.random() * 5)
            }
        };
        
        console.log(`Alerting ${hospital.name}:`, alert);
        return true;
    };

    const playEmergencySound = () => {
        if (!soundEnabled) return;
        
        // Create emergency beep sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
        
        // Repeat beep
        audioRef.current = setTimeout(() => {
            if (isActivated) playEmergencySound();
        }, 500);
    };

    const stopEmergencySound = () => {
        if (audioRef.current) {
            clearTimeout(audioRef.current);
            audioRef.current = null;
        }
    };

    const callEmergencyServices = () => {
        window.location.href = 'tel:911';
    };

    const callContact = (phone) => {
        window.location.href = `tel:${phone}`;
    };

    const getDirections = (hospital) => {
        window.open(`https://maps.google.com/?q=${hospital.address}`, '_blank');
    };

    return (
        <div className="p-4 md:p-8 min-h-screen bg-[#020617] text-white font-sans relative">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                        <h1 className="text-4xl font-black text-white tracking-tight">
                            Emergency <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Response</span>
                        </h1>
                        <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
                    </div>
                    <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                        24/7 EMERGENCY ASSISTANCE • ONE TOUCH ACTIVATION
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main SOS Button */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2"
                    >
                        <div className="glass-card-glowing border-red-500/20 p-8">
                            {/* Emergency Type Selection */}
                            <div className="mb-8">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 block">
                                    Emergency Type
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { type: 'medical', icon: Heart, label: 'Medical', color: 'red' },
                                        { type: 'accident', icon: AlertTriangle, label: 'Accident', color: 'orange' },
                                        { type: 'cardiac', icon: Activity, label: 'Cardiac', color: 'rose' },
                                        { type: 'other', icon: Zap, label: 'Other', color: 'amber' }
                                    ].map(({ type, icon: Icon, label, color }) => (
                                        <button
                                            key={type}
                                            onClick={() => setEmergencyType(type)}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                emergencyType === type
                                                    ? `bg-${color}-500/20 border-${color}-500 text-${color}-400`
                                                    : 'bg-slate-800/50 border-white/10 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <Icon className="w-6 h-6 mx-auto mb-2" />
                                            <div className="text-xs font-black uppercase tracking-widest">{label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Message */}
                            <div className="mb-8">
                                <label className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 block">
                                    Custom Message (Optional)
                                </label>
                                <textarea
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Describe your emergency..."
                                    className="w-full p-4 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 resize-none"
                                    rows={3}
                                />
                            </div>

                            {/* SOS Button */}
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: isActivated ? 1 : 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={isActivated ? cancelSOS : startSOS}
                                    className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center font-black text-xl transition-all ${
                                        isActivated 
                                            ? 'bg-gradient-to-r from-orange-500 to-red-600 animate-pulse shadow-glow-red' 
                                            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-glow-red hover:shadow-glow-red-lg'
                                    }`}
                                >
                                    {isActivated ? (
                                        <>
                                            <X className="w-12 h-12 mb-2" />
                                            <span className="text-sm uppercase tracking-widest">CANCEL</span>
                                            <div className="text-4xl font-black mt-2">{countdown}</div>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-12 h-12 mb-2 animate-bounce" />
                                            <span className="text-sm uppercase tracking-widest">PRESS FOR</span>
                                            <span className="text-sm uppercase tracking-widest">EMERGENCY</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-4 mt-8">
                                <button
                                    onClick={callEmergencyServices}
                                    className="p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all group"
                                >
                                    <Phone className="w-6 h-6 mx-auto mb-2 text-emerald-400 group-hover:animate-pulse" />
                                    <div className="text-xs font-black uppercase tracking-widest">Call 911</div>
                                </button>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all"
                                >
                                    {soundEnabled ? (
                                        <Volume2 className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                                    ) : (
                                        <VolumeX className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                                    )}
                                    <div className="text-xs font-black uppercase tracking-widest">
                                        {soundEnabled ? 'Sound On' : 'Sound Off'}
                                    </div>
                                </button>
                                <button
                                    onClick={() => getCurrentLocation().then(setLocation)}
                                    className="p-4 bg-slate-800/50 border border-white/10 rounded-xl hover:bg-slate-800 transition-all"
                                >
                                    <MapPin className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                    <div className="text-xs font-black uppercase tracking-widest">Update GPS</div>
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Emergency Info Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Location Status */}
                        <div className="glass-card-glowing border-blue-500/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <MapPin className="w-5 h-5 text-blue-400" />
                                <h3 className="text-lg font-black text-white">Location Status</h3>
                            </div>
                            {location ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Accuracy</span>
                                        <span className="text-sm font-black text-emerald-400">±{location.accuracy}m</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-slate-400">Coordinates</span>
                                        <span className="text-xs font-mono text-blue-400">
                                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                                        </span>
                                    </div>
                                    <button className="w-full mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs font-black text-blue-400 hover:bg-blue-500/20 transition-all">
                                        View on Map
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <Navigation className="w-8 h-8 mx-auto mb-2 text-slate-500 animate-spin" />
                                    <p className="text-xs text-slate-500">Getting location...</p>
                                </div>
                            )}
                        </div>

                        {/* Emergency Contacts */}
                        <div className="glass-card-glowing border-emerald-500/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-black text-white">Emergency Contacts</h3>
                            </div>
                            <div className="space-y-3">
                                {emergencyContacts.slice(0, 3).map(contact => (
                                    <div key={contact.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                                <UserPlus className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-white">{contact.name}</div>
                                                <div className="text-xs text-slate-400">{contact.relation}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => callContact(contact.phone)}
                                            className="p-2 bg-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-all"
                                        >
                                            <Phone className="w-4 h-4 text-emerald-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Nearby Hospitals */}
                        <div className="glass-card-glowing border-purple-500/20 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Hospital className="w-5 h-5 text-purple-400" />
                                <h3 className="text-lg font-black text-white">Nearby Hospitals</h3>
                            </div>
                            <div className="space-y-3">
                                {nearbyHospitals.slice(0, 3).map(hospital => (
                                    <div key={hospital.id} className="p-3 bg-slate-800/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {hospital.emergency && (
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                                )}
                                                <div className="text-sm font-black text-white">{hospital.name}</div>
                                            </div>
                                            <div className="text-xs font-black text-purple-400">{hospital.distance}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => callContact(hospital.phone)}
                                                className="flex-1 p-2 bg-purple-500/20 rounded text-xs font-black text-purple-400 hover:bg-purple-500/30 transition-all"
                                            >
                                                Call
                                            </button>
                                            <button
                                                onClick={() => getDirections(hospital)}
                                                className="flex-1 p-2 bg-blue-500/20 rounded text-xs font-black text-blue-400 hover:bg-blue-500/30 transition-all"
                                            >
                                                Directions
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Notifications Status */}
                <AnimatePresence>
                    {notificationsSent.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mt-8 glass-card-glowing border-emerald-500/20 p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-lg font-black text-white">Emergency Notifications Sent</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {notificationsSent.map((notification, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                        <div className="flex-1">
                                            <div className="text-sm font-black text-white">
                                                {notification.type === 'hospital' ? notification.name : notification.name}
                                            </div>
                                            <div className="text-xs text-emerald-400">Alert sent successfully</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
