import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Edit2, Camera, Shield, Settings, Download, Share2,
    Heart, Brain, Activity, Calendar, MapPin, Phone, Mail,
    FileText, Pill, Stethoscope, Hospital, AlertTriangle,
    CheckCircle2, TrendingUp, TrendingDown, Award, Target,
    Zap, Clock, BarChart3, PieChart, LineChart, Star,
    Users, Globe, Lock, Eye, EyeOff, RefreshCw, Save,
    X, ChevronRight, Plus, Minus, Info, Bell, BellOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';

export default function PatientProfileEngine() {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const [profileData, setProfileData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [healthScore, setHealthScore] = useState(0);
    const [healthTrends, setHealthTrends] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [goals, setGoals] = useState([]);
    const [medicalSummary, setMedicalSummary] = useState({});
    const [privacySettings, setPrivacySettings] = useState({});
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    const [editedProfile, setEditedProfile] = useState({});

    useEffect(() => {
        fetchProfileData();
        return () => {};
    }, []);

    const fetchProfileData = async () => {
        try {
            const [profileRes, healthRes, achievementsRes, goalsRes] = await Promise.all([
                API.get(`/patients/${user?.id}/profile`),
                API.get(`/patients/${user?.id}/health-summary`),
                API.get(`/patients/${user?.id}/achievements`),
                API.get(`/patients/${user?.id}/goals`)
            ]);

            const profile = profileRes.data || generateMockProfile();
            setProfileData(profile);
            setEditedProfile(profile);
            setHealthScore(healthRes.data?.score || 82);
            setHealthTrends(healthRes.data?.trends || generateMockHealthTrends());
            setAchievements(achievementsRes.data || generateMockAchievements());
            setGoals(goalsRes.data || generateMockGoals());
            setMedicalSummary(healthRes.data?.summary || generateMockMedicalSummary());
            setPrivacySettings(profile.privacy || generateMockPrivacySettings());
            
        } catch (error) {
            console.error('Failed to fetch profile data:', error);
            const mockProfile = generateMockProfile();
            setProfileData(mockProfile);
            setEditedProfile(mockProfile);
            setHealthScore(82);
            setHealthTrends(generateMockHealthTrends());
            setAchievements(generateMockAchievements());
            setGoals(generateMockGoals());
            setMedicalSummary(generateMockMedicalSummary());
            setPrivacySettings(generateMockPrivacySettings());
        } finally {
            setLoading(false);
        }
    };

    const generateMockProfile = () => ({
        personalInfo: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1985-06-15',
            age: 38,
            gender: 'Male',
            bloodType: 'O+',
            height: '5\'10"',
            weight: '175 lbs',
            email: 'john.doe@email.com',
            phone: '+1-555-0123',
            address: '123 Main St, Bangalore, Karnataka 560001',
            emergencyContact: {
                name: 'Sarah Johnson',
                relation: 'Spouse',
                phone: '+1-555-0124'
            }
        },
        medicalInfo: {
            primaryCarePhysician: 'Dr. Emily Rodriguez',
            allergies: ['Penicillin', 'Peanuts'],
            medications: ['Metformin', 'Lisinopril'],
            conditions: ['Type 2 Diabetes', 'Hypertension'],
            surgeries: ['Appendectomy - 2010'],
            familyHistory: ['Diabetes', 'Heart Disease'],
            lifestyle: {
                exercise: 'Moderate',
                diet: 'Balanced',
                smoking: 'Never',
                alcohol: 'Social',
                sleep: '6-7 hours'
            }
        },
        preferences: {
            language: 'English',
            timezone: 'IST',
            units: 'Metric',
            notifications: true,
            dataSharing: true
        },
        privacy: {
            profileVisibility: 'limited',
            dataSharing: 'medical-staff',
            emergencyAccess: true,
            researchParticipation: false
        }
    });

    const generateMockHealthTrends = () => [
        { month: 'Jan', score: 75, vitals: 72, adherence: 80 },
        { month: 'Feb', score: 78, vitals: 75, adherence: 85 },
        { month: 'Mar', score: 82, vitals: 78, adherence: 88 },
        { month: 'Apr', score: 80, vitals: 80, adherence: 82 },
        { month: 'May', score: 85, vitals: 82, adherence: 90 },
        { month: 'Jun', score: 82, vitals: 85, adherence: 85 }
    ];

    const generateMockAchievements = () => [
        {
            id: 1,
            title: 'Medication Adherence Champion',
            description: 'Maintained 90%+ medication adherence for 30 days',
            icon: Pill,
            date: '2024-01-15',
            category: 'adherence',
            points: 100
        },
        {
            id: 2,
            title: 'Health Goal Crusher',
            description: 'Achieved 5 consecutive health goals',
            icon: Target,
            date: '2024-01-10',
            category: 'goals',
            points: 150
        },
        {
            id: 3,
            title: 'Vital Monitoring Pro',
            description: 'Tracked vitals daily for 60 days',
            icon: Activity,
            date: '2024-01-05',
            category: 'monitoring',
            points: 75
        },
        {
            id: 4,
            title: 'Emergency Ready',
            description: 'Completed emergency profile setup',
            icon: Shield,
            date: '2024-01-01',
            category: 'safety',
            points: 50
        }
    ];

    const generateMockGoals = () => [
        {
            id: 1,
            title: 'Lower Blood Pressure',
            description: 'Reduce systolic BP to below 130 mmHg',
            category: 'vitals',
            target: 130,
            current: 145,
            unit: 'mmHg',
            deadline: '2024-03-01',
            status: 'in-progress'
        },
        {
            id: 2,
            title: 'Daily Exercise',
            description: 'Exercise for 30 minutes daily',
            category: 'lifestyle',
            target: 30,
            current: 20,
            unit: 'minutes',
            deadline: '2024-02-01',
            status: 'in-progress'
        },
        {
            id: 3,
            title: 'Weight Management',
            description: 'Lose 10 pounds through diet and exercise',
            category: 'lifestyle',
            target: 165,
            current: 175,
            unit: 'lbs',
            deadline: '2024-04-01',
            status: 'not-started'
        }
    ];

    const generateMockMedicalSummary = () => ({
        overallHealth: 'Good',
        riskFactors: ['Hypertension', 'Family History of Diabetes'],
        recommendations: [
            'Continue blood pressure medication',
            'Increase physical activity',
            'Maintain balanced diet',
            'Regular monitoring of blood sugar'
        ],
        lastCheckup: '2024-01-10',
        nextCheckup: '2024-04-10',
        primaryConcerns: ['Blood Pressure Management', 'Weight Control']
    });

    const generateMockPrivacySettings = () => ({
        profileVisibility: 'limited',
        dataSharing: 'medical-staff',
        emergencyAccess: true,
        researchParticipation: false,
        marketingEmails: false,
        thirdPartyApps: false
    });

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            await API.put(`/patients/${user?.id}/profile`, editedProfile);
            setProfileData(editedProfile);
            setIsEditing(false);
            
            addToast({
                type: 'success',
                title: 'Profile Updated',
                message: 'Your profile has been successfully updated.'
            });
        } catch (error) {
            console.error('Failed to save profile:', error);
            addToast({
                type: 'error',
                title: 'Save Failed',
                message: 'Unable to save profile changes. Please try again.'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const formData = new FormData();
                formData.append('avatar', file);
                
                const response = await API.post(`/patients/${user?.id}/avatar`, formData);
                setEditedProfile(prev => ({
                    ...prev,
                    avatar: response.data.avatarUrl
                }));
                
                addToast({
                    type: 'success',
                    title: 'Avatar Updated',
                    message: 'Your profile picture has been updated.'
                });
            } catch (error) {
                console.error('Failed to upload avatar:', error);
                addToast({
                    type: 'error',
                    title: 'Upload Failed',
                    message: 'Unable to upload avatar. Please try again.'
                });
            }
        }
    };

    const handlePrivacyUpdate = async (key, value) => {
        try {
            await API.put(`/patients/${user?.id}/privacy`, { [key]: value });
            setPrivacySettings(prev => ({ ...prev, [key]: value }));
            
            addToast({
                type: 'success',
                title: 'Privacy Updated',
                message: 'Your privacy settings have been updated.'
            });
        } catch (error) {
            console.error('Failed to update privacy:', error);
            addToast({
                type: 'error',
                title: 'Update Failed',
                message: 'Unable to update privacy settings.'
            });
        }
    };

    const getHealthScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400';
        if (score >= 75) return 'text-blue-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getHealthScoreGradient = (score) => {
        if (score >= 90) return 'from-emerald-500 to-emerald-600';
        if (score >= 75) return 'from-blue-500 to-blue-600';
        if (score >= 60) return 'from-yellow-500 to-yellow-600';
        return 'from-red-500 to-red-600';
    };

    const getGoalProgress = (goal) => {
        if (goal.category === 'vitals' && goal.target < goal.current) {
            return Math.round(((goal.current - goal.target) / (goal.current - goal.target)) * 100);
        }
        return Math.round((goal.current / goal.target) * 100);
    };

    const getGoalStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
            case 'in-progress': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
            case 'not-started': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6"
                >
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                            Patient <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Profile</span>
                            <User className="w-8 h-8 text-purple-500" />
                        </h1>
                        <p className="text-slate-500 font-bold tracking-[0.3em] text-xs uppercase">
                            COMPREHENSIVE HEALTH PROFILE • PERSONALIZED INSIGHTS
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-black transition-all flex items-center gap-2"
                        >
                            {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleSaveProfile}
                                disabled={saving}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg rounded-xl font-black transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Changes
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* Health Score Overview */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-glowing border-purple-500/20 p-8 mb-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getHealthScoreGradient(healthScore)} p-1`}>
                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                        <div className={`text-4xl font-black ${getHealthScoreColor(healthScore)}`}>
                                            {healthScore}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-800 rounded-full text-xs font-black text-white">
                                    Health Score
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="text-xl font-black text-white mb-4">Health Summary</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <Heart className="w-5 h-5 text-red-400" />
                                    <div>
                                        <div className="text-sm text-slate-400">Blood Pressure</div>
                                        <div className="font-black text-white">145/92 mmHg</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="text-sm text-slate-400">Heart Rate</div>
                                        <div className="font-black text-white">78 bpm</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Brain className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="text-sm text-slate-400">Stress Level</div>
                                        <div className="font-black text-white">Moderate</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="w-5 h-5 text-green-400" />
                                    <div>
                                        <div className="text-sm text-slate-400">Next Checkup</div>
                                        <div className="font-black text-white">Apr 10, 2024</div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-800/50 rounded-xl">
                                <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Primary Recommendations</div>
                                <ul className="space-y-1">
                                    {medicalSummary.recommendations?.slice(0, 3).map((rec, idx) => (
                                        <li key={idx} className="text-sm text-slate-300 flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-8 border-b border-white/10">
                    {[
                        { id: 'overview', label: 'Overview', icon: User },
                        { id: 'medical', label: 'Medical Info', icon: Stethoscope },
                        { id: 'goals', label: 'Health Goals', icon: Target },
                        { id: 'achievements', label: 'Achievements', icon: Award },
                        { id: 'privacy', label: 'Privacy', icon: Shield }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-black text-sm transition-all border-b-2 ${
                                activeTab === tab.id
                                    ? 'text-blue-400 border-blue-400'
                                    : 'text-slate-400 border-transparent hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-4 h-4 inline mr-2" />
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
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-card-glowing border-blue-500/20 p-6">
                                    <h3 className="text-lg font-black text-white mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                                                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                                                        <User className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                                    >
                                                        <Camera className="w-3 h-3 text-white" />
                                                    </button>
                                                )}
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    className="hidden"
                                                />
                                            </div>
                                            <div>
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            value={editedProfile.personalInfo?.firstName || ''}
                                                            onChange={(e) => setEditedProfile(prev => ({
                                                                ...prev,
                                                                personalInfo: {
                                                                    ...prev.personalInfo,
                                                                    firstName: e.target.value
                                                                }
                                                            }))}
                                                            className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editedProfile.personalInfo?.lastName || ''}
                                                            onChange={(e) => setEditedProfile(prev => ({
                                                                ...prev,
                                                                personalInfo: {
                                                                    ...prev.personalInfo,
                                                                    lastName: e.target.value
                                                                }
                                                            }))}
                                                            className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="text-xl font-black text-white">
                                                            {profileData.personalInfo?.firstName} {profileData.personalInfo?.lastName}
                                                        </div>
                                                        <div className="text-sm text-slate-400">
                                                            {profileData.personalInfo?.age} years • {profileData.personalInfo?.gender}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Blood Type</div>
                                                <div className="font-black text-white">{profileData.personalInfo?.bloodType}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Height/Weight</div>
                                                <div className="font-black text-white">
                                                    {profileData.personalInfo?.height} • {profileData.personalInfo?.weight}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Contact</div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Mail className="w-3 h-3" />
                                                    {profileData.personalInfo?.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                                    <Phone className="w-3 h-3" />
                                                    {profileData.personalInfo?.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card-glowing border-green-500/20 p-6">
                                    <h3 className="text-lg font-black text-white mb-4">Health Trends</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={healthTrends}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                                            <YAxis stroke="#64748b" fontSize={12} />
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                                            <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                                            <Line type="monotone" dataKey="vitals" stroke="#10b981" strokeWidth={2} />
                                            <Line type="monotone" dataKey="adherence" stroke="#f59e0b" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {activeTab === 'medical' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass-card-glowing border-red-500/20 p-6">
                                    <h3 className="text-lg font-black text-white mb-4">Medical Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Primary Care Physician</div>
                                            <div className="font-black text-white">{profileData.medicalInfo?.primaryCarePhysician}</div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Allergies</div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.medicalInfo?.allergies?.map((allergy, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                                                        {allergy}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Current Medications</div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.medicalInfo?.medications?.map((med, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-400">
                                                        {med}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">Medical Conditions</div>
                                            <div className="flex flex-wrap gap-2">
                                                {profileData.medicalInfo?.conditions?.map((condition, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-lg text-sm text-orange-400">
                                                        {condition}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card-glowing border-purple-500/20 p-6">
                                    <h3 className="text-lg font-black text-white mb-4">Lifestyle</h3>
                                    <div className="space-y-4">
                                        {Object.entries(profileData.medicalInfo?.lifestyle || {}).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="text-sm font-black capitalize text-white">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="text-sm text-slate-300">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'goals' && (
                            <div className="glass-card-glowing border-yellow-500/20 p-6">
                                <h3 className="text-lg font-black text-white mb-6">Health Goals</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {goals.map((goal, idx) => (
                                        <motion.div
                                            key={goal.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-4 bg-slate-800/50 rounded-xl"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-black text-white mb-1">{goal.title}</h4>
                                                    <p className="text-sm text-slate-400">{goal.description}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-xs font-black border ${getGoalStatusColor(goal.status)}`}>
                                                    {goal.status.replace('-', ' ')}
                                                </span>
                                            </div>

                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-sm mb-1">
                                                    <span className="text-slate-400">Progress</span>
                                                    <span className="font-black text-white">
                                                        {goal.current} / {goal.target} {goal.unit}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-700 rounded-full h-2">
                                                    <div
                                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                                        style={{ width: `${Math.min(getGoalProgress(goal), 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                                                </span>
                                                <span>{getGoalProgress(goal)}% Complete</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'achievements' && (
                            <div className="glass-card-glowing border-emerald-500/20 p-6">
                                <h3 className="text-lg font-black text-white mb-6">Achievements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {achievements.map((achievement, idx) => (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-xl"
                                        >
                                            <div className="p-3 bg-emerald-500/20 rounded-xl">
                                                <achievement.icon className="w-6 h-6 text-emerald-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-white mb-1">{achievement.title}</h4>
                                                <p className="text-sm text-slate-400 mb-2">{achievement.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(achievement.date).toLocaleDateString()}
                                                    </span>
                                                    <span className="text-xs font-black text-emerald-400">
                                                        +{achievement.points} points
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="glass-card-glowing border-slate-500/20 p-6">
                                <h3 className="text-lg font-black text-white mb-6">Privacy Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Data Sharing</h4>
                                        <div className="space-y-3">
                                            {[
                                                { key: 'profileVisibility', label: 'Profile Visibility', description: 'Control who can see your profile' },
                                                { key: 'dataSharing', label: 'Medical Data Sharing', description: 'Share data with healthcare providers' },
                                                { key: 'emergencyAccess', label: 'Emergency Access', description: 'Allow emergency access to medical info' },
                                                { key: 'researchParticipation', label: 'Research Participation', description: 'Participate in medical research' }
                                            ].map(setting => (
                                                <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                                    <div>
                                                        <div className="font-black text-white">{setting.label}</div>
                                                        <div className="text-sm text-slate-400">{setting.description}</div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={privacySettings[setting.key]}
                                                            onChange={(e) => handlePrivacyUpdate(setting.key, e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Notifications</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                                                <div>
                                                    <div className="font-black text-white">Email Notifications</div>
                                                    <div className="text-sm text-slate-400">Receive health updates via email</div>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        defaultChecked={profileData.preferences?.notifications}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
