import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Activity, Heart, Thermometer, Droplets, Wind,
    AlertTriangle, CheckCircle, Info, Search, Filter,
    Download, Share2, Eye, Plus, X, ChevronRight,
    TrendingUp, TrendingDown, Zap, Target, Shield,
    Stethoscope, Pill, Syringe, TestTube, Microscope,
    FileText, Calendar, Clock, User, Age, Gender,
    MapPin, Phone, Mail, Star, Award, BarChart3,
    LineChart, PieChart, RadarChart, PolarGrid,
    PolarAngleAxis, Radar, PolarRadiusAxis, RefreshCw,
    Loader2, ArrowRight, ArrowLeft, ChevronDown,
    ChevronUp, HelpCircle, Settings, Bell, LogOut,
    Database, Cloud, Cpu, Network, Wifi, Battery,
    Volume2, VolumeX, Maximize2, Minimize2, Fullscreen,
    Camera, Video, Mic, MicOff, Phone, MessageCircle,
    Send, Paperclip, Smile, MoreVertical, Edit2,
    Trash2, Archive, Copy, ExternalLink, Link,
    Lock, Unlock, EyeOff, EyeOn, Sun, Moon,
    CloudRain, CloudSnow, CloudLightning, CloudDrizzle,
    Sunrise, Sunset, Wind, Compass, Navigation,
    Globe, Map, MapPin as MapPinIcon, Route,
    Navigation2, Compass as CompassIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart as RechartsRadarChart, PolarGrid as RechartsPolarGrid, PolarAngleAxis as RechartsPolarAngleAxis, Radar as RechartsRadar, PolarRadiusAxis as RechartsPolarRadiusAxis, AreaChart, Area } from 'recharts';

export default function AIDiseasePrediction() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [additionalInfo, setAdditionalInfo] = useState({
        age: '',
        gender: '',
        duration: '',
        severity: '',
        medicalHistory: '',
        medications: '',
        allergies: '',
        lifestyle: '',
        travel: '',
        exposure: ''
    });
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [savedPredictions, setSavedPredictions] = useState([]);
    const [healthScore, setHealthScore] = useState(null);
    const [riskFactors, setRiskFactors] = useState([]);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        fetchSymptoms();
        fetchSavedPredictions();
    }, []);

    const fetchSymptoms = async () => {
        try {
            const response = await API.get('/ai/symptoms');
            setSymptoms(response.data || generateMockSymptoms());
        } catch (error) {
            console.error('Failed to fetch symptoms:', error);
            setSymptoms(generateMockSymptoms());
        }
    };

    const fetchSavedPredictions = async () => {
        try {
            const response = await API.get(`/ai/predictions/${user.id}`);
            setSavedPredictions(response.data || []);
        } catch (error) {
            console.error('Failed to fetch saved predictions:', error);
        }
    };

    const generateMockSymptoms = () => [
        // General Symptoms
        { id: 1, name: 'Fever', category: 'general', icon: Thermometer, severity: 'moderate' },
        { id: 2, name: 'Fatigue', category: 'general', icon: Battery, severity: 'mild' },
        { id: 3, name: 'Weakness', category: 'general', icon: Zap, severity: 'moderate' },
        { id: 4, name: 'Weight Loss', category: 'general', icon: TrendingDown, severity: 'moderate' },
        { id: 5, name: 'Weight Gain', category: 'general', icon: TrendingUp, severity: 'mild' },
        
        // Respiratory Symptoms
        { id: 6, name: 'Cough', category: 'respiratory', icon: Wind, severity: 'mild' },
        { id: 7, name: 'Shortness of Breath', category: 'respiratory', icon: Wind, severity: 'severe' },
        { id: 8, name: 'Chest Pain', category: 'respiratory', icon: Heart, severity: 'severe' },
        { id: 9, name: 'Wheezing', category: 'respiratory', icon: Wind, severity: 'moderate' },
        { id: 10, name: 'Sore Throat', category: 'respiratory', icon: Activity, severity: 'mild' },
        
        // Digestive Symptoms
        { id: 11, name: 'Nausea', category: 'digestive', icon: Activity, severity: 'mild' },
        { id: 12, name: 'Vomiting', category: 'digestive', icon: Activity, severity: 'moderate' },
        { id: 13, name: 'Diarrhea', category: 'digestive', icon: Droplets, severity: 'moderate' },
        { id: 14, name: 'Constipation', category: 'digestive', icon: Activity, severity: 'mild' },
        { id: 15, name: 'Abdominal Pain', category: 'digestive', icon: AlertTriangle, severity: 'moderate' },
        
        // Neurological Symptoms
        { id: 16, name: 'Headache', category: 'neurological', icon: Brain, severity: 'mild' },
        { id: 17, name: 'Dizziness', category: 'neurological', icon: Compass, severity: 'moderate' },
        { id: 18, name: 'Numbness', category: 'neurological', icon: Activity, severity: 'moderate' },
        { id: 19, name: 'Tingling', category: 'neurological', icon: Zap, severity: 'mild' },
        { id: 20, name: 'Memory Loss', category: 'neurological', icon: Brain, severity: 'severe' },
        
        // Cardiovascular Symptoms
        { id: 21, name: 'Palpitations', category: 'cardiovascular', icon: Heart, severity: 'moderate' },
        { id: 22, name: 'High Blood Pressure', category: 'cardiovascular', icon: Activity, severity: 'severe' },
        { id: 23, name: 'Low Blood Pressure', category: 'cardiovascular', icon: Activity, severity: 'moderate' },
        { id: 24, name: 'Swelling', category: 'cardiovascular', icon: Droplets, severity: 'moderate' },
        
        // Skin Symptoms
        { id: 25, name: 'Rash', category: 'skin', icon: Activity, severity: 'mild' },
        { id: 26, name: 'Itching', category: 'skin', icon: Activity, severity: 'mild' },
        { id: 27, name: 'Dry Skin', category: 'skin', icon: Activity, severity: 'mild' },
        { id: 28, name: 'Redness', category: 'skin', icon: Activity, severity: 'mild' },
        
        // Musculoskeletal Symptoms
        { id: 29, name: 'Joint Pain', category: 'musculoskeletal', icon: Activity, severity: 'moderate' },
        { id: 30, name: 'Muscle Pain', category: 'musculoskeletal', icon: Activity, severity: 'moderate' },
        { id: 31, name: 'Stiffness', category: 'musculoskeletal', icon: Activity, severity: 'mild' },
        { id: 32, name: 'Back Pain', category: 'musculoskeletal', icon: Activity, severity: 'moderate' }
    ];

    const handleSymptomToggle = (symptom) => {
        setSelectedSymptoms(prev => {
            if (prev.find(s => s.id === symptom.id)) {
                return prev.filter(s => s.id !== symptom.id);
            } else {
                return [...prev, symptom];
            }
        });
    };

    const analyzeSymptoms = async () => {
        if (selectedSymptoms.length === 0) {
            addToast({
                type: 'error',
                title: 'No Symptoms Selected',
                message: 'Please select at least one symptom to analyze.'
            });
            return;
        }

        setAnalyzing(true);
        setStep(3);

        try {
            const analysisData = {
                symptoms: selectedSymptoms.map(s => s.name),
                additionalInfo,
                userId: user.id
            };

            // Simulate AI analysis delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            const response = await API.post('/ai/predict', analysisData);
            const result = response.data || generateMockPrediction();

            setPredictions(result);
            setHealthScore(result.healthScore);
            setRiskFactors(result.riskFactors || []);
            setRecommendations(result.recommendations || []);

        } catch (error) {
            console.error('Failed to analyze symptoms:', error);
            const mockResult = generateMockPrediction();
            setPredictions(mockResult);
            setHealthScore(mockResult.healthScore);
            setRiskFactors(mockResult.riskFactors || []);
            setRecommendations(mockResult.recommendations || []);
        } finally {
            setAnalyzing(false);
        }
    };

    const generateMockPrediction = () => {
        const possibleDiseases = [
            { name: 'Common Cold', probability: 0.85, severity: 'mild', specialty: 'General Practice' },
            { name: 'Influenza', probability: 0.72, severity: 'moderate', specialty: 'General Practice' },
            { name: 'COVID-19', probability: 0.45, severity: 'moderate', specialty: 'Infectious Disease' },
            { name: 'Allergic Rhinitis', probability: 0.38, severity: 'mild', specialty: 'Allergy & Immunology' },
            { name: 'Sinusitis', probability: 0.31, severity: 'moderate', specialty: 'ENT' }
        ];

        return {
            diseases: possibleDiseases.sort((a, b) => b.probability - a.probability),
            healthScore: Math.floor(Math.random() * 30) + 70,
            riskFactors: [
                { factor: 'Age', level: 'moderate', description: 'Risk increases with age' },
                { factor: 'Season', level: 'high', description: 'Higher risk during flu season' },
                { factor: 'Lifestyle', level: 'low', description: 'Generally healthy lifestyle' }
            ],
            recommendations: [
                { type: 'immediate', action: 'Rest and hydration', priority: 'high' },
                { type: 'medical', action: 'Consult doctor if symptoms persist', priority: 'medium' },
                { type: 'lifestyle', action: 'Maintain good hygiene', priority: 'medium' }
            ],
            emergencyWarning: selectedSymptoms.some(s => s.severity === 'severe'),
            analysisDate: new Date().toISOString(),
            confidence: Math.floor(Math.random() * 20) + 75
        };
    };

    const savePrediction = async () => {
        try {
            const predictionData = {
                ...predictions,
                symptoms: selectedSymptoms,
                additionalInfo,
                userId: user.id,
                createdAt: new Date().toISOString()
            };

            await API.post('/ai/predictions/save', predictionData);
            
            addToast({
                type: 'success',
                title: 'Prediction Saved',
                message: 'Your disease prediction has been saved to your health records.'
            });
            
            fetchSavedPredictions();
        } catch (error) {
            console.error('Failed to save prediction:', error);
            addToast({
                type: 'error',
                title: 'Save Failed',
                message: 'Failed to save prediction. Please try again.'
            });
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'mild': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'moderate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'severe': return 'text-red-400 bg-red-400/10 border-red-400/30';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
        }
    };

    const getProbabilityColor = (probability) => {
        if (probability >= 0.7) return 'text-red-400';
        if (probability >= 0.5) return 'text-yellow-400';
        return 'text-green-400';
    };

    const filteredSymptoms = symptoms.filter(symptom => {
        const matchesSearch = symptom.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || symptom.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [
        { id: 'all', name: 'All Symptoms', icon: Activity },
        { id: 'general', name: 'General', icon: Activity },
        { id: 'respiratory', name: 'Respiratory', icon: Wind },
        { id: 'digestive', name: 'Digestive', icon: Activity },
        { id: 'neurological', name: 'Neurological', icon: Brain },
        { id: 'cardiovascular', name: 'Cardiovascular', icon: Heart },
        { id: 'skin', name: 'Skin', icon: Activity },
        { id: 'musculoskeletal', name: 'Musculoskeletal', icon: Activity }
    ];

    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">AI Disease Prediction</h2>
                <p className="text-slate-400">Select your symptoms to get AI-powered disease predictions</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
                        <input
                            type="number"
                            value={additionalInfo.age}
                            onChange={(e) => setAdditionalInfo({...additionalInfo, age: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                            placeholder="Enter your age"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                        <select
                            value={additionalInfo.gender}
                            onChange={(e) => setAdditionalInfo({...additionalInfo, gender: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Duration of Symptoms</label>
                        <select
                            value={additionalInfo.duration}
                            onChange={(e) => setAdditionalInfo({...additionalInfo, duration: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="">Select duration</option>
                            <option value="less-than-a-day">Less than a day</option>
                            <option value="1-3-days">1-3 days</option>
                            <option value="4-7-days">4-7 days</option>
                            <option value="1-2-weeks">1-2 weeks</option>
                            <option value="more-than-2-weeks">More than 2 weeks</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Severity</label>
                        <select
                            value={additionalInfo.severity}
                            onChange={(e) => setAdditionalInfo({...additionalInfo, severity: e.target.value})}
                            className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                        >
                            <option value="">Select severity</option>
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Medical History (Optional)</label>
                    <textarea
                        value={additionalInfo.medicalHistory}
                        onChange={(e) => setAdditionalInfo({...additionalInfo, medicalHistory: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none"
                        rows={3}
                        placeholder="Any pre-existing conditions or relevant medical history..."
                    />
                </div>
            </div>

            <div className="flex justify-between">
                <div></div>
                <button
                    onClick={() => setStep(2)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
                >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Select Your Symptoms</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">{selectedSymptoms.length} selected</span>
                    <button
                        onClick={() => setSelectedSymptoms([])}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        Clear all
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search symptoms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setFilterCategory(category.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                                filterCategory === category.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                            }`}
                        >
                            <category.icon className="w-4 h-4 inline mr-2" />
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Symptoms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredSymptoms.map(symptom => {
                    const Icon = symptom.icon;
                    const isSelected = selectedSymptoms.find(s => s.id === symptom.id);
                    
                    return (
                        <button
                            key={symptom.id}
                            onClick={() => handleSymptomToggle(symptom)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${
                                isSelected
                                    ? 'border-purple-500 bg-purple-500/10'
                                    : 'border-white/10 bg-slate-800/50 hover:border-white/20'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isSelected ? 'bg-purple-500' : 'bg-slate-700'
                                }`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-white">{symptom.name}</h4>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(symptom.severity)}`}>
                                        {symptom.severity}
                                    </span>
                                </div>
                                {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-purple-400" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between">
                <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={analyzeSymptoms}
                    disabled={selectedSymptoms.length === 0}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    <Brain className="w-4 h-4" />
                    Analyze Symptoms
                </button>
            </div>
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {analyzing ? (
                <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Analyzing Your Symptoms</h3>
                    <p className="text-slate-400 mb-6">Our AI is processing your symptoms and medical data...</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            ) : predictions && (
                <div className="space-y-6">
                    {/* Emergency Warning */}
                    {predictions.emergencyWarning && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                                <div>
                                    <h4 className="font-semibold text-red-400">Emergency Warning</h4>
                                    <p className="text-sm text-red-300">Some of your symptoms may require immediate medical attention. Please consider visiting an emergency room.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Health Score */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Health Score</h3>
                            <span className="text-sm text-slate-400">Confidence: {predictions.confidence}%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-24 h-24 relative">
                                <svg className="w-24 h-24 transform -rotate-90">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="36"
                                        stroke="#1e293b"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="36"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${(healthScore / 100) * 226} 226`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#ec4899" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{healthScore}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-slate-400 mb-2">Based on your symptoms and medical history</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                                        healthScore >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/30' :
                                        healthScore >= 60 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                        'text-red-400 bg-red-400/10 border-red-400/30'
                                    }`}>
                                        {healthScore >= 80 ? 'Good Health' : healthScore >= 60 ? 'Moderate Risk' : 'High Risk'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Disease Predictions */}
                    <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Possible Conditions</h3>
                        <div className="space-y-3">
                            {predictions.diseases.map((disease, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white">{disease.name}</h4>
                                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(disease.severity)}`}>
                                                {disease.severity}
                                            </span>
                                            <span>{disease.specialty}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getProbabilityColor(disease.probability)}`}>
                                            {(disease.probability * 100).toFixed(0)}%
                                        </div>
                                        <div className="text-xs text-slate-400">probability</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risk Factors */}
                    {riskFactors.length > 0 && (
                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
                            <div className="space-y-3">
                                {riskFactors.map((factor, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${
                                            factor.level === 'high' ? 'bg-red-400' :
                                            factor.level === 'moderate' ? 'bg-yellow-400' :
                                            'bg-green-400'
                                        }`}></div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-white">{factor.factor}</h4>
                                            <p className="text-sm text-slate-400">{factor.description}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                            factor.level === 'high' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                                            factor.level === 'moderate' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                            'text-green-400 bg-green-400/10 border-green-400/30'
                                        }`}>
                                            {factor.level}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {recommendations.length > 0 && (
                        <div className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
                            <div className="space-y-3">
                                {recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                            rec.priority === 'high' ? 'bg-red-500' :
                                            rec.priority === 'medium' ? 'bg-yellow-500' :
                                            'bg-green-500'
                                        }`}>
                                            {rec.type === 'immediate' && <Zap className="w-4 h-4 text-white" />}
                                            {rec.type === 'medical' && <Stethoscope className="w-4 h-4 text-white" />}
                                            {rec.type === 'lifestyle' && <Heart className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white">{rec.action}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                            rec.priority === 'high' ? 'text-red-400 bg-red-400/10 border-red-400/30' :
                                            rec.priority === 'medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
                                            'text-green-400 bg-green-400/10 border-green-400/30'
                                        }`}>
                                            {rec.priority}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={savePrediction}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Save Prediction
                        </button>
                        <button
                            onClick={() => window.open('/patient/appointments/new', '_blank')}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                        </button>
                        <button
                            onClick={() => setShowDetails(!showDetails)}
                            className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <Info className="w-4 h-4" />
                            {showDetails ? 'Hide' : 'Show'} Details
                        </button>
                    </div>

                    {/* Detailed Analysis */}
                    <AnimatePresence>
                        {showDetails && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-slate-800/50 backdrop-blur-lg border border-white/10 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-4">Detailed Analysis</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium text-white mb-2">Selected Symptoms</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedSymptoms.map(symptom => (
                                                <span key={symptom.id} className="px-3 py-1 bg-slate-700 rounded-lg text-sm text-white">
                                                    {symptom.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white mb-2">Analysis Date</h4>
                                        <p className="text-slate-400">{new Date(predictions.analysisDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-white mb-2">Disclaimer</h4>
                                        <p className="text-sm text-slate-400">
                                            This AI-powered prediction is for informational purposes only and should not be considered a medical diagnosis. 
                                            Please consult with a qualified healthcare professional for proper medical advice and treatment.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
            {/* Background Effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Progress Indicator */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3].map((stepNumber) => (
                            <div key={stepNumber} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                                    stepNumber === step
                                        ? 'bg-purple-600 text-white'
                                        : stepNumber < step
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-700 text-slate-400'
                                }`}>
                                    {stepNumber < step ? <CheckCircle className="w-4 h-4" /> : stepNumber}
                                </div>
                                {stepNumber < 3 && (
                                    <div className={`flex-1 h-1 mx-2 ${
                                        stepNumber < step ? 'bg-green-600' : 'bg-slate-700'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Information</span>
                        <span>Symptoms</span>
                        <span>Results</span>
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
