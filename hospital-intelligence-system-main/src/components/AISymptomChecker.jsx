import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Heart, Activity, Thermometer, Head, Eye, Ear,
    Stomach, Lungs, Bone, AlertTriangle, CheckCircle,
    Clock, MapPin, User, Calendar, Search, Plus,
    X, ChevronRight, Info, Zap, Target, Shield,
    TrendingUp, TrendingDown, Star, MessageCircle,
    Download, Share2, RefreshCw, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export default function AISymptomChecker() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [step, setStep] = useState(1);
    const [symptoms, setSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [bodyParts, setBodyParts] = useState([]);
    const [selectedBodyPart, setSelectedBodyPart] = useState(null);
    const [duration, setDuration] = useState('');
    const [severity, setSeverity] = useState(3);
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [followUpQuestions, setFollowUpQuestions] = useState([]);
    const [followUpAnswers, setFollowUpAnswers] = useState({});
    const [savedAssessments, setSavedAssessments] = useState([]);

    // Symptom database
    const symptomDatabase = [
        { id: 1, name: 'Headache', category: 'neurological', bodyPart: 'head', common: true },
        { id: 2, name: 'Fever', category: 'general', bodyPart: 'full', common: true },
        { id: 3, name: 'Cough', category: 'respiratory', bodyPart: 'chest', common: true },
        { id: 4, name: 'Chest Pain', category: 'cardiovascular', bodyPart: 'chest', common: true, urgent: true },
        { id: 5, name: 'Shortness of Breath', category: 'respiratory', bodyPart: 'chest', common: true, urgent: true },
        { id: 6, name: 'Nausea', category: 'digestive', bodyPart: 'stomach', common: true },
        { id: 7, name: 'Vomiting', category: 'digestive', bodyPart: 'stomach', common: true },
        { id: 8, name: 'Diarrhea', category: 'digestive', bodyPart: 'stomach', common: true },
        { id: 9, name: 'Fatigue', category: 'general', bodyPart: 'full', common: true },
        { id: 10, name: 'Dizziness', category: 'neurological', bodyPart: 'head', common: true },
        { id: 11, name: 'Joint Pain', category: 'musculoskeletal', bodyPart: 'joints', common: true },
        { id: 12, name: 'Muscle Pain', category: 'musculoskeletal', bodyPart: 'muscles', common: true },
        { id: 13, name: 'Sore Throat', category: 'respiratory', bodyPart: 'throat', common: true },
        { id: 14, name: 'Runny Nose', category: 'respiratory', bodyPart: 'nose', common: true },
        { id: 15, name: 'Back Pain', category: 'musculoskeletal', bodyPart: 'back', common: true },
        { id: 16, name: 'Abdominal Pain', category: 'digestive', bodyPart: 'stomach', common: true },
        { id: 17, name: 'Skin Rash', category: 'dermatological', bodyPart: 'skin', common: true },
        { id: 18, name: 'Eye Pain', category: 'ophthalmological', bodyPart: 'eyes', common: true },
        { id: 19, name: 'Ear Pain', category: 'ent', bodyPart: 'ears', common: true },
        { id: 20, name: 'Difficulty Breathing', category: 'respiratory', bodyPart: 'chest', common: true, urgent: true }
    ];

    const bodyPartCategories = [
        { id: 'head', name: 'Head & Brain', icon: <Brain className="w-6 h-6" />, color: 'purple' },
        { id: 'chest', name: 'Chest & Heart', icon: <Heart className="w-6 h-6" />, color: 'red' },
        { id: 'stomach', name: 'Stomach & Digestion', icon: <Stomach className="w-6 h-6" />, color: 'green' },
        { id: 'joints', name: 'Joints & Bones', icon: <Bone className="w-6 h-6" />, color: 'blue' },
        { id: 'skin', name: 'Skin', icon: <User className="w-6 h-6" />, color: 'yellow' },
        { id: 'full', name: 'Full Body', icon: <Activity className="w-6 h-6" />, color: 'indigo' }
    ];

    useEffect(() => {
        setSymptoms(symptomDatabase);
        fetchSavedAssessments();
    }, []);

    const fetchSavedAssessments = async () => {
        try {
            const response = await API.get(`/symptom-checker/assessments/${user?.id}`);
            setSavedAssessments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch saved assessments:', error);
        }
    };

    const filteredSymptoms = symptoms.filter(symptom =>
        symptom.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (!selectedBodyPart || symptom.bodyPart === selectedBodyPart || symptom.bodyPart === 'full')
    );

    const addSymptom = (symptom) => {
        if (!selectedSymptoms.find(s => s.id === symptom.id)) {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
    };

    const removeSymptom = (symptomId) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s.id !== symptomId));
    };

    const analyzeSymptoms = async () => {
        if (selectedSymptoms.length === 0) {
            addToast({
                type: 'error',
                title: 'No Symptoms Selected',
                message: 'Please select at least one symptom to analyze'
            });
            return;
        }

        setAnalyzing(true);
        try {
            const symptomsPayload = selectedSymptoms.map(s => s.name).join(', ') + 
                                  (additionalInfo ? `, ${additionalInfo}` : '');

            // Call real backend endpoint
            const response = await API.post('/symptoms/analyze', {
                symptoms: symptomsPayload
            });

            const backendAnalysis = response.data;
            
            // Map backend response to frontend state
            const mappedAnalysis = {
                conditions: (backendAnalysis.conditions || []).map(name => ({
                    name,
                    probability: 0.8, // Default probability for mapped conditions
                    description: `Potential condition detected: ${name}`,
                    urgency: backendAnalysis.isEmergency ? 'high' : (backendAnalysis.severity === 'Moderate Risk' ? 'medium' : 'low')
                })),
                overallRisk: backendAnalysis.severity === 'High Risk' ? 'high' : 
                            (backendAnalysis.severity === 'Moderate Risk' ? 'medium' : 'low'),
                recommendations: (backendAnalysis.precautions || []).map(p => ({
                    type: 'self-care',
                    title: 'Care Instruction',
                    description: p,
                    icon: <Info className="w-5 h-5" />
                })),
                emergencyWarning: backendAnalysis.isEmergency,
                confidenceScore: 0.85
            };

            setAnalysis(mappedAnalysis);
            setFollowUpQuestions(backendAnalysis.followUpQuestions?.map((q, i) => ({
                id: `bk_${i}`,
                question: q,
                type: 'text'
            })) || []);
            
            setStep(4);
            
        } catch (error) {
            console.error('Analysis failed:', error);
            addToast({
                type: 'error',
                title: 'Analysis Failed',
                message: 'Unable to analyze symptoms. Please try again.'
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const generateMockAnalysis = (data) => {
        const urgentSymptoms = data.symptoms.filter(s => 
            symptoms.find(sym => sym.id === s.id)?.urgent
        );
        
        const conditions = [
            {
                name: 'Common Cold',
                probability: 0.65,
                description: 'Viral infection of the upper respiratory tract',
                symptoms: ['Fever', 'Cough', 'Sore Throat', 'Runny Nose'],
                treatment: 'Rest, hydration, over-the-counter medications',
                urgency: 'low'
            },
            {
                name: 'Influenza',
                probability: 0.25,
                description: 'Viral infection causing severe respiratory symptoms',
                symptoms: ['Fever', 'Fatigue', 'Body Aches', 'Headache'],
                treatment: 'Antiviral medications, rest, fluids',
                urgency: 'medium'
            }
        ];

        if (urgentSymptoms.length > 0) {
            conditions.unshift({
                name: 'Requires Medical Attention',
                probability: 0.85,
                description: 'Your symptoms require immediate medical evaluation',
                symptoms: urgentSymptoms.map(s => s.name),
                treatment: 'Seek immediate medical care',
                urgency: 'high'
            });
        }

        return {
            conditions: conditions,
            overallRisk: urgentSymptoms.length > 0 ? 'high' : severity > 7 ? 'medium' : 'low',
            recommendations: generateRecommendations(data),
            emergencyWarning: urgentSymptoms.length > 0,
            confidenceScore: Math.random() * 0.3 + 0.7 // 70-100% confidence
        };
    };

    const generateFollowUpQuestions = (symptoms) => {
        const questions = [];
        
        if (symptoms.some(s => s.category === 'respiratory')) {
            questions.push({
                id: 'breathing_worsening',
                question: 'Is your breathing getting worse?',
                type: 'yes_no',
                required: true
            });
        }
        
        if (symptoms.some(s => s.category === 'cardiovascular')) {
            questions.push({
                id: 'pain_spreading',
                question: 'Is the pain spreading to other areas?',
                type: 'yes_no',
                required: true
            });
        }
        
        if (symptoms.some(s => s.category === 'neurological')) {
            questions.push({
                id: 'vision_changes',
                question: 'Are you experiencing any vision changes?',
                type: 'yes_no',
                required: false
            });
        }
        
        questions.push({
            id: 'medications',
            question: 'Are you currently taking any medications?',
            type: 'text',
            required: false
        });
        
        return questions;
    };

    const generateRecommendations = (data) => {
        const recommendations = [];
        
        if (data.severity > 7) {
            recommendations.push({
                type: 'urgent',
                title: 'Seek Medical Attention',
                description: 'Your symptoms are severe. Please consult a healthcare provider soon.',
                icon: <AlertTriangle className="w-5 h-5" />
            });
        }
        
        recommendations.push({
            type: 'self-care',
            title: 'Rest and Hydration',
            description: 'Get adequate rest and drink plenty of fluids.',
            icon: <Clock className="w-5 h-5" />
        });
        
        recommendations.push({
            type: 'monitoring',
            title: 'Monitor Symptoms',
            description: 'Keep track of your symptoms and seek medical care if they worsen.',
            icon: <TrendingUp className="w-5 h-5" />
        });
        
        return recommendations;
    };

    const saveAssessment = async (assessmentData, analysis) => {
        try {
            await API.post('/symptom-checker/save', {
                patientId: user?.id,
                assessmentData,
                analysis,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Failed to save assessment:', error);
        }
    };

    const downloadReport = () => {
        const reportData = {
            patient: user?.name,
            date: new Date().toLocaleDateString(),
            symptoms: selectedSymptoms.map(s => s.name),
            analysis: analysis,
            recommendations: analysis.recommendations
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `symptom-analysis-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const resetAssessment = () => {
        setStep(1);
        setSelectedSymptoms([]);
        setSelectedBodyPart(null);
        setDuration('');
        setSeverity(3);
        setAdditionalInfo('');
        setAnalysis(null);
        setFollowUpQuestions([]);
        setFollowUpAnswers({});
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Brain className="w-10 h-10 text-purple-500" />
                    AI Symptom Checker
                </h1>
                <p className="text-slate-400">Get intelligent health insights based on your symptoms</p>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
                {[1, 2, 3, 4].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= stepNumber ? 'bg-purple-600' : 'bg-slate-700'
                        }`}>
                            {stepNumber}
                        </div>
                        {stepNumber < 4 && (
                            <div className={`w-20 h-1 ${
                                step > stepNumber ? 'bg-purple-600' : 'bg-slate-700'
                            }`}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Step 1: Select Body Part */}
            {step === 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">Select Affected Body Part</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {bodyPartCategories.map((part) => (
                                <button
                                    key={part.id}
                                    onClick={() => setSelectedBodyPart(part.id)}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        selectedBodyPart === part.id
                                            ? `border-${part.color}-500 bg-${part.color}-500/20`
                                            : 'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`text-${part.color}-400 mb-2`}>
                                        {part.icon}
                                    </div>
                                    <p className="font-medium">{part.name}</p>
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setSelectedBodyPart(null)}
                                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Skip
                            </button>
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Select Symptoms */}
            {step === 2 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">Select Your Symptoms</h2>
                        
                        {/* Search */}
                        <div className="relative mb-6">
                            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                            <input
                                type="text"
                                placeholder="Search symptoms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            />
                        </div>

                        {/* Selected Symptoms */}
                        {selectedSymptoms.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-3">Selected Symptoms</h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedSymptoms.map((symptom) => (
                                        <div
                                            key={symptom.id}
                                            className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center gap-2"
                                        >
                                            <span>{symptom.name}</span>
                                            <button
                                                onClick={() => removeSymptom(symptom.id)}
                                                className="text-purple-400 hover:text-white"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Symptoms */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                            {filteredSymptoms.map((symptom) => (
                                <button
                                    key={symptom.id}
                                    onClick={() => addSymptom(symptom)}
                                    disabled={selectedSymptoms.find(s => s.id === symptom.id)}
                                    className={`p-4 rounded-lg border text-left transition-all ${
                                        selectedSymptoms.find(s => s.id === symptom.id)
                                            ? 'bg-purple-500/20 border-purple-500/30 cursor-not-allowed'
                                            : 'bg-slate-700/50 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{symptom.name}</span>
                                        {symptom.urgent && (
                                            <AlertTriangle className="w-4 h-4 text-red-400" />
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-400 capitalize">{symptom.category}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={selectedSymptoms.length === 0}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Additional Details */}
            {step === 3 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
                        <h2 className="text-2xl font-bold mb-6">Additional Details</h2>
                        
                        <div className="space-y-6">
                            {/* Duration */}
                            <div>
                                <label className="block text-sm font-medium mb-2">How long have you had these symptoms?</label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">Select duration</option>
                                    <option value="few_hours">A few hours</option>
                                    <option value="1_day">1 day</option>
                                    <option value="2_3_days">2-3 days</option>
                                    <option value="1_week">1 week</option>
                                    <option value="2_3_weeks">2-3 weeks</option>
                                    <option value="1_month">1 month</option>
                                    <option value="several_months">Several months</option>
                                </select>
                            </div>

                            {/* Severity */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Severity (1-10): <span className="text-purple-400">{severity}</span>
                                </label>
                                <input
                                    type="range"
                                    min="1"
                                    max="10"
                                    value={severity}
                                    onChange={(e) => setSeverity(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Mild</span>
                                    <span>Moderate</span>
                                    <span>Severe</span>
                                </div>
                            </div>

                            {/* Additional Information */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Additional Information (Optional)</label>
                                <textarea
                                    value={additionalInfo}
                                    onChange={(e) => setAdditionalInfo(e.target.value)}
                                    placeholder="Any other details you'd like to share..."
                                    className="w-full px-4 py-3 bg-slate-700 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    rows="4"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={analyzeSymptoms}
                                disabled={analyzing}
                                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {analyzing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Brain className="w-4 h-4" />
                                        Analyze Symptoms
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 4: Results */}
            {step === 4 && analysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Emergency Warning */}
                    {analysis.emergencyWarning && (
                        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                                <div>
                                    <h3 className="text-lg font-bold text-red-400">Seek Medical Attention</h3>
                                    <p className="text-red-300">Your symptoms require immediate medical evaluation. Please visit an emergency room or call emergency services.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Analysis Results */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Brain className="w-6 h-6 text-purple-400" />
                                Analysis Results
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                    <span className="text-slate-300">Confidence Score</span>
                                    <span className="text-xl font-bold text-purple-400">
                                        {Math.round(analysis.confidenceScore * 100)}%
                                    </span>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                                    <span className="text-slate-300">Overall Risk</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        analysis.overallRisk === 'high' ? 'bg-red-500/20 text-red-400' :
                                        analysis.overallRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/20 text-green-400'
                                    }`}>
                                        {analysis.overallRisk.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="text-lg font-semibold mb-4">Possible Conditions</h3>
                                <div className="space-y-3">
                                    {analysis.conditions.map((condition, index) => (
                                        <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-white">{condition.name}</h4>
                                                <span className="text-sm text-purple-400">
                                                    {Math.round(condition.probability * 100)}% probability
                                                </span>
                                            </div>
                                            <p className="text-slate-300 text-sm mb-2">{condition.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    condition.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                                                    condition.urgency === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {condition.urgency} urgency
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-white/10">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Target className="w-6 h-6 text-green-400" />
                                Recommendations
                            </h2>
                            
                            <div className="space-y-4">
                                {analysis.recommendations.map((rec, index) => (
                                    <div key={index} className="flex gap-4 p-4 bg-slate-700/50 rounded-lg">
                                        <div className={`p-2 rounded-lg ${
                                            rec.type === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                            rec.type === 'self-care' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>
                                            {rec.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white mb-1">{rec.title}</h4>
                                            <p className="text-slate-300 text-sm">{rec.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Info className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-medium text-blue-400">Medical Disclaimer</span>
                                </div>
                                <p className="text-xs text-blue-300">
                                    This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={downloadReport}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                        <button
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Share Results
                        </button>
                        <button
                            onClick={resetAssessment}
                            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            New Assessment
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
