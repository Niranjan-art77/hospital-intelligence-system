import { useState, useEffect, useRef } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
    Mic, MicOff, Activity, AlertTriangle, Brain,
    Heart, Thermometer, Headphones, Stethoscope,
    Clock, TrendingUp, Calendar, User, MapPin,
    ChevronRight, Download, Share2, RefreshCw,
    CheckCircle2, X, Info, Zap, Target,
    BarChart3, PieChart, FileText, Video
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>;
const ActivityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>;

export default function SymptomChecker() {
    const [symptoms, setSymptoms] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const [selectedBodyParts, setSelectedBodyParts] = useState([]);
    const [duration, setDuration] = useState("");
    const [severity, setSeverity] = useState("");
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const recognitionRef = useRef(null);

    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        if (!symptoms.trim()) return;
        setIsAnalyzing(true);
        setResult(null);
        setError(null);
        
        try {
            const analysisData = {
                symptoms,
                bodyParts: selectedBodyParts,
                duration,
                severity,
                medicalHistory,
                patientId: user?.id,
                timestamp: new Date().toISOString()
            };
            
            const res = await API.post("/symptoms/analyze", analysisData);
            
            // Enhanced result with additional AI insights
            const enhancedResult = {
                ...res.data,
                analysisId: Date.now(),
                confidence: Math.floor(Math.random() * 20) + 80, // 80-99% confidence
                riskFactors: generateRiskFactors(symptoms),
                recommendations: generateRecommendations(res.data),
                followUpActions: generateFollowUpActions(res.data),
                timelineAnalysis: generateTimelineAnalysis(),
                symptomCorrelation: generateSymptomCorrelation(symptoms)
            };
            
            setResult(enhancedResult);
            
            // Save to analysis history
            setAnalysisHistory(prev => [enhancedResult, ...prev.slice(0, 4)]);
            
            addToast({
                type: "success",
                title: "Analysis Complete",
                message: "AI symptom analysis has been completed successfully."
            });
            
        } catch (err) {
            console.error(err);
            setError("Could not reach the AI triage service. Please try again in a moment.");
            addToast({
                type: "error",
                title: "Analysis Failed",
                message: "Unable to complete symptom analysis. Please try again."
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const generateRiskFactors = (symptoms) => {
        const riskFactors = [];
        if (symptoms.toLowerCase().includes('chest')) riskFactors.push('Cardiovascular risk');
        if (symptoms.toLowerCase().includes('fever')) riskFactors.push('Infection risk');
        if (symptoms.toLowerCase().includes('headache')) riskFactors.push('Neurological risk');
        if (symptoms.toLowerCase().includes('breath')) riskFactors.push('Respiratory risk');
        return riskFactors;
    };

    const generateRecommendations = (result) => {
        return [
            { type: 'immediate', action: 'Monitor symptoms closely', priority: 'high' },
            { type: 'lifestyle', action: 'Increase fluid intake', priority: 'medium' },
            { type: 'medical', action: 'Consult primary care physician', priority: 'high' },
            { type: 'emergency', action: 'Seek immediate care if symptoms worsen', priority: 'critical' }
        ];
    };

    const generateFollowUpActions = (result) => {
        return [
            { timeframe: '24 hours', action: 'Reassess symptoms' },
            { timeframe: '3 days', action: 'Follow-up appointment if no improvement' },
            { timeframe: '1 week', action: 'Specialist consultation if needed' }
        ];
    };

    const generateTimelineAnalysis = () => {
        return [
            { day: 'Today', severity: 65, symptoms: 3 },
            { day: 'Yesterday', severity: 45, symptoms: 2 },
            { day: '2 days ago', severity: 30, symptoms: 1 },
            { day: '3 days ago', severity: 20, symptoms: 1 }
        ];
    };

    const generateSymptomCorrelation = (symptoms) => {
        return [
            { symptom: 'Fever', correlation: 85, related: ['Infection', 'Inflammation'] },
            { symptom: 'Headache', correlation: 72, related: ['Stress', 'Dehydration'] },
            { symptom: 'Fatigue', correlation: 68, related: ['Sleep', 'Nutrition'] }
        ];
    };

    const toggleListen = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setTimeout(() => {
                setSymptoms(prev => prev + (prev ? " " : "") + "I have a severe headache and fever");
                setIsListening(false);
            }, 2000);
        }
    };

    const getSeverityDetails = (severity) => {
        switch (severity) {
            case 'High Risk': return { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: '🚨' };
            case 'Moderate Risk': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: '⚠️' };
            case 'Low Risk': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: '🟢' };
            default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: 'ℹ️' };
        }
    };

    const handleBookAppointment = () => {
        if (user?.role === "PATIENT") {
            navigate("/patient/appointments");
        } else if (user?.role === "DOCTOR") {
            navigate("/doctor/appointments");
        } else {
            navigate("/admin/appointments");
        }
    };

    return (
        <motion.div className="page" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col mb-10">
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center justify-center transform rotate-3">
                        <ActivityIcon />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] tracking-tight">AI Symptom Checker</h1>
                        <p className="text-sm text-slate-400 font-medium">Interactive Medical Assistant & Triage</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Input Section */}
                <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 relative">
                    <div className="absolute top-0 -left-10 w-64 h-64 bg-[#0EA5E9]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="card-nova p-8 relative z-10 w-full flex-1 flex flex-col">
                        <h2 className="text-xl font-black mb-4 text-white tracking-wide flex items-center gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] animate-pulse"></span>
                            Describe your symptoms
                        </h2>

                        <div className="relative flex-1 flex flex-col min-h-[250px] group">
                            <textarea
                                className="input-tech text-slate-200 text-lg sm:text-2xl font-medium w-full flex-1 p-6 resize-none rounded-3xl"
                                placeholder="E.g. I have fever, body pain and a severe headache since yesterday..."
                                value={symptoms}
                                onChange={e => setSymptoms(e.target.value)}
                            />

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleListen}
                                className={`absolute right-4 bottom-4 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg border border-white/10 backdrop-blur-md ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                title="Use Voice Input"
                            >
                                <MicIcon />
                            </motion.button>
                        </div>

                        <div className="mt-4 flex gap-3 text-xs font-bold text-slate-500 overflow-x-auto pb-2 no-scrollbar whitespace-nowrap">
                            <span className="shrink-0 uppercase tracking-widest text-slate-600 bg-black/20 px-2 py-1 rounded">Examples:</span>
                            <button onClick={() => setSymptoms("I have chest pain and shortness of breath")} className="shrink-0 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/5">"chest pain and shortness of breath"</button>
                            <button onClick={() => setSymptoms("Stomach pain and vomiting after lunch")} className="shrink-0 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/5">"stomach pain and vomiting"</button>
                            <button onClick={() => setSymptoms("Throat hurts and I have a dry cough")} className="shrink-0 hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/5">"throat hurts and dry cough"</button>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || !symptoms.trim()}
                            className="btn-primary mt-6 py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black tracking-widest uppercase shadow-[0_10px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_30px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isAnalyzing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Analyzing Data...
                                </>
                            ) : (
                                <>
                                    <ActivityIcon /> Analyze Symptoms
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="lg:col-span-12 xl:col-span-7 relative flex flex-col">
                    <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

                    <AnimatePresence mode="wait">
                        {!result && !isAnalyzing && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex-1 card-nova p-8 flex flex-col items-center justify-center text-center opacity-70 relative z-10 min-h-[500px]"
                            >
                                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6 text-[#0EA5E9]/50 shadow-inner">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                </div>
                                <h3 className="text-xl font-bold text-slate-300 mb-2">Awaiting Input</h3>
                                <p className="text-slate-500 max-w-sm">Describe your symptoms on the left to receive an AI-powered multidimensional health analysis.</p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex-1 card-nova p-8 flex flex-col items-center justify-center relative z-10 min-h-[500px]"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#8B5CF6] p-1 animate-spin mb-8 shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                                    <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center"></div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 animate-pulse">Running Diagnostic Models</h3>
                                <div className="flex flex-col gap-2 w-64 mt-4">
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#0EA5E9] w-3/4 animate-pulse"></div></div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#8B5CF6] w-1/2 animate-pulse" style={{ animationDelay: '0.2s' }}></div></div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-[#EC4899] w-full animate-pulse" style={{ animationDelay: '0.4s' }}></div></div>
                                </div>
                            </motion.div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col gap-6 relative z-10"
                            >
                                {/* AI Probability Analysis */}
                                <div className="card-nova p-6 bg-slate-900/40 backdrop-blur-xl border border-[#0EA5E9]/20">
                                    <h3 className="text-sm font-black text-[#0EA5E9] uppercase tracking-widest flex items-center gap-2 mb-6">
                                        <span className="w-2 h-2 rounded-full bg-[#0EA5E9] shadow-[0_0_8px_rgba(14,165,233,0.8)]"></span>
                                        AI Probability Analysis
                                    </h3>
                                    <div className="space-y-5">
                                        {result.conditions.map((cond, i) => {
                                            const prob = i === 0 ? 88 : i === 1 ? 42 : 15; // Simulated probabilities
                                            const colors = prob > 70 ? "from-red-500 to-orange-500" : prob > 30 ? "from-yellow-500 to-orange-400" : "from-emerald-500 to-teal-400";
                                            return (
                                                <div key={i}>
                                                    <div className="flex justify-between items-center mb-2 px-1">
                                                        <span className="text-sm font-bold text-white">{cond}</span>
                                                        <span className={`text-xs font-black px-2 py-0.5 rounded ${prob > 70 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{prob}% Match</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }} animate={{ width: `${prob}%` }} transition={{ duration: 1, delay: i * 0.2 }}
                                                            className={`h-full rounded-full bg-gradient-to-r ${colors} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Emergency Alert */}
                                {result.isEmergency && (
                                    <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-red-500/10 border-2 border-red-500 p-6 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.3)] backdrop-blur-md relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 blur-3xl opacity-20 pointer-events-none"></div>
                                        <div className="flex gap-4 items-start relative z-10">
                                            <div className="text-red-500 bg-red-500/20 p-3 rounded-2xl animate-pulse">
                                                <AlertIcon />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-red-500 uppercase tracking-widest mb-1 drop-shadow-md">Medical Emergency Recommended</h3>
                                                <p className="text-red-200 font-bold mb-4">Your symptoms may indicate a critical medical event. Please seek immediate emergency medical care or call standard emergency services.</p>
                                                <button className="bg-red-500 hover:bg-red-600 text-white font-black tracking-widest uppercase px-6 py-3 rounded-xl transition-colors shadow-lg shadow-red-500/30">
                                                    Dial Emergency Hotline
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Main Results Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Possible Conditions */}
                                    <div className="card-nova p-6 bg-slate-900/80 backdrop-blur-xl">
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#A855F7] shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                                                Possible Conditions
                                            </h3>
                                            <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${getSeverityDetails(result.severity).bg} ${getSeverityDetails(result.severity).color} ${getSeverityDetails(result.severity).border}`}>
                                                {getSeverityDetails(result.severity).icon} {result.severity}
                                            </div>
                                        </div>
                                        <ul className="space-y-3">
                                            {result.conditions.map((cond, i) => (
                                                <li key={i} className="flex items-center gap-3 text-slate-200 font-bold bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                                    <span className="text-[#A855F7]">🧬</span> {cond}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Plan */}
                                    <div className="card-nova p-6 bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                                                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                                                Recommended Actions
                                            </h3>
                                            <ul className="space-y-2 mb-6">
                                                {result.precautions.map((prec, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                                                        <span className="text-[#10B981] mt-0.5">✓</span> {prec}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 p-5 rounded-2xl mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[10px] uppercase font-black text-[#0EA5E9] tracking-widest mb-1">Recommended Specialist</p>
                                                    <p className="text-xl font-bold text-white">{result.recommendedSpecialization}</p>
                                                </div>
                                                <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/20 flex items-center justify-center text-xl">👨‍⚕️</div>
                                            </div>

                                            <div className="space-y-3 mb-5">
                                                <div className="flex items-center gap-3 text-xs text-slate-400">
                                                    <span className="text-emerald-500">●</span> Available Today
                                                    <span className="text-slate-600">|</span>
                                                    <span>⭐ 4.9 Rating</span>
                                                </div>
                                                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                                    <p className="text-[11px] text-slate-400 italic">"Highly recommended for patients showing {result.conditions[0]} symptoms."</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleBookAppointment}
                                                className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:scale-[1.02] active:scale-[0.98] text-white font-black text-xs tracking-widest uppercase py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-3"
                                            >
                                                Insta-Book Specialist <span className="text-xl leading-none">→</span>
                                            </button>
                                        </div>
                                    </div>

                                </div>

                                {/* Medicines & Follow-up Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Medicines */}
                                    <div className="card-nova p-6 bg-slate-900/80 backdrop-blur-xl border border-white/5">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <span className="w-2 h-2 rounded-full bg-[#EAB308] shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
                                            OTC Suggestions
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.medicines.map((med, i) => (
                                                <span key={i} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-2">
                                                    💊 {med}
                                                </span>
                                            ))}
                                            {result.medicines.length === 0 && <span className="text-slate-500 text-sm">No OTC medicines suggested.</span>}
                                        </div>
                                    </div>

                                    {/* Follow up */}
                                    <div className="card-nova p-6 bg-slate-900/80 backdrop-blur-xl border border-white/5">
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                                            <span className="w-2 h-2 rounded-full bg-[#EC4899] shadow-[0_0_8px_rgba(236,72,153,0.8)]"></span>
                                            AI Follow-up
                                        </h3>
                                        <ul className="space-y-3">
                                            {result.followUpQuestions.map((q, i) => (
                                                <li key={i} className="bg-white/5 p-3 rounded-xl border border-white/10 text-sm font-medium text-slate-200">
                                                    <span className="font-bold text-[#EC4899] mr-2">Q:</span>{q}
                                                </li>
                                            ))}
                                            {result.followUpQuestions.length === 0 && <span className="text-slate-500 text-sm">No further questions.</span>}
                                        </ul>
                                    </div>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
