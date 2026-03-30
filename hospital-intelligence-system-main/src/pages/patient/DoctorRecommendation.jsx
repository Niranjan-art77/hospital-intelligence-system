import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";
import {
    Search, Filter, Star, MapPin, Clock, Calendar,
    Phone, Mail, User, Stethoscope, Heart, Brain,
    Activity, Hospital, CheckCircle2, TrendingUp,
    Award, BookOpen, Languages, Video, MessageCircle,
    ChevronRight, X, Zap, Target, BarChart3,
    Users, Shield, AlertCircle, Info
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function DoctorRecommendation() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [symptoms, setSymptoms] = useState("");
    const [recommendedDoctors, setRecommendedDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedExperience, setSelectedExperience] = useState("");
    const [priceRange, setPriceRange] = useState([0, 500]);
    const [sortBy, setSortBy] = useState("match");
    const [showFilters, setShowFilters] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [comparisonList, setComparisonList] = useState([]);
    const navigate = useNavigate();

    const specialties = [
        "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
        "Dermatology", "Psychiatry", "Gynecology", "Oncology",
        "Endocrinology", "Gastroenterology", "Pulmonology", "Nephrology"
    ];

    const experienceRanges = [
        { label: "0-5 years", min: 0, max: 5 },
        { label: "5-10 years", min: 5, max: 10 },
        { label: "10-15 years", min: 10, max: 15 },
        { label: "15+ years", min: 15, max: 50 }
    ];

    const analyzeSymptoms = async () => {
        if (!symptoms.trim()) return;
        setLoading(true);
        setSearched(true);
        
        try {
            const analysisData = {
                symptoms,
                patientId: user?.id,
                preferences: {
                    specialty: selectedSpecialty,
                    experience: selectedExperience,
                    priceRange,
                    sortBy
                },
                location: user?.location || { lat: 12.9716, lng: 77.5946 }, // Default Bangalore
                medicalHistory: user?.medicalHistory || [],
                age: user?.age || 30,
                gender: user?.gender || 'prefer-not-to-say'
            };

            // Simulate AI processing with enhanced matching
            const mockDoctors = generateEnhancedDoctorRecommendations(analysisData);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setRecommendedDoctors(mockDoctors);
            
            addToast({
                type: "success",
                title: "AI Analysis Complete",
                message: `Found ${mockDoctors.length} highly matched doctors for your symptoms.`
            });
            
        } catch (error) {
            console.error("AI mapping failed", error);
            addToast({
                type: "error",
                title: "Analysis Failed",
                message: "Unable to process symptoms. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const generateEnhancedDoctorRecommendations = (analysisData) => {
        const baseDoctors = [
            {
                id: 1,
                name: "Dr. Sarah Johnson",
                specialty: "Cardiology",
                experience: 12,
                rating: 4.8,
                reviews: 234,
                consultationFee: 150,
                availability: "Available Today",
                hospital: "City General Hospital",
                location: "2.3 km away",
                languages: ["English", "Hindi", "Tamil"],
                education: "MD - Harvard Medical School",
                achievements: ["Top Cardiologist 2023", "Published 50+ Papers"],
                specialties: ["Interventional Cardiology", "Heart Failure", "Arrhythmia"],
                consultationTypes: ["In-Person", "Video", "Chat"],
                responseTime: "< 2 hours",
                nextAvailable: "Today, 3:00 PM",
                matchScore: 0,
                aiAnalysis: {
                    symptomMatch: 95,
                    experienceMatch: 88,
                    locationMatch: 92,
                    priceMatch: 78,
                    availabilityMatch: 95
                }
            },
            {
                id: 2,
                name: "Dr. Michael Chen",
                specialty: "Neurology",
                experience: 8,
                rating: 4.9,
                reviews: 189,
                consultationFee: 120,
                availability: "Tomorrow",
                hospital: "Apollo Medical Center",
                location: "3.7 km away",
                languages: ["English", "Mandarin", "Hindi"],
                education: "MD - Johns Hopkins",
                achievements: ["Neurology Research Award", "Best Resident Award"],
                specialties: ["Stroke", "Epilepsy", "Movement Disorders"],
                consultationTypes: ["In-Person", "Video"],
                responseTime: "< 4 hours",
                nextAvailable: "Tomorrow, 10:00 AM",
                matchScore: 0,
                aiAnalysis: {
                    symptomMatch: 88,
                    experienceMatch: 75,
                    locationMatch: 85,
                    priceMatch: 85,
                    availabilityMatch: 70
                }
            },
            {
                id: 3,
                name: "Dr. Emily Rodriguez",
                specialty: "Internal Medicine",
                experience: 15,
                rating: 4.7,
                reviews: 312,
                consultationFee: 100,
                availability: "Available Today",
                hospital: "St. Mary's Hospital",
                location: "1.8 km away",
                languages: ["English", "Spanish", "French"],
                education: "MD - Stanford Medical",
                achievements: ["Excellence in Teaching", "Patient Care Award"],
                specialties: ["Primary Care", "Chronic Diseases", "Preventive Medicine"],
                consultationTypes: ["In-Person", "Video", "Chat", "Phone"],
                responseTime: "< 1 hour",
                nextAvailable: "Today, 5:30 PM",
                matchScore: 0,
                aiAnalysis: {
                    symptomMatch: 82,
                    experienceMatch: 95,
                    locationMatch: 98,
                    priceMatch: 90,
                    availabilityMatch: 88
                }
            }
        ];

        // Calculate AI match scores based on analysis
        return baseDoctors.map(doctor => {
            let matchScore = 0;
            
            // Symptom matching (40% weight)
            if (analysisData.symptoms.toLowerCase().includes('chest') && doctor.specialty === 'Cardiology') {
                matchScore += 40;
            } else if (analysisData.symptoms.toLowerCase().includes('headache') && doctor.specialty === 'Neurology') {
                matchScore += 40;
            } else if (analysisData.symptoms.toLowerCase().includes('fever') && doctor.specialty === 'Internal Medicine') {
                matchScore += 35;
            } else {
                matchScore += 25;
            }
            
            // Experience matching (20% weight)
            const expScore = Math.min(20, (doctor.experience / 20) * 20);
            matchScore += expScore;
            
            // Location matching (15% weight)
            const distance = parseFloat(doctor.location);
            const locationScore = Math.max(0, 15 - (distance * 2));
            matchScore += locationScore;
            
            // Price matching (15% weight)
            const priceScore = Math.max(0, 15 - ((doctor.consultationFee - analysisData.preferences.priceRange[0]) / 50));
            matchScore += priceScore;
            
            // Availability matching (10% weight)
            const availabilityScore = doctor.availability === "Available Today" ? 10 : 5;
            matchScore += availabilityScore;
            
            return {
                ...doctor,
                matchScore: Math.round(matchScore),
                aiAnalysis: {
                    ...doctor.aiAnalysis,
                    symptomMatch: Math.round((matchScore / 100) * 95),
                    experienceMatch: Math.round(expScore),
                    locationMatch: Math.round(locationScore),
                    priceMatch: Math.round(priceScore),
                    availabilityMatch: availabilityScore
                }
            };
        }).sort((a, b) => {
            switch (analysisData.preferences.sortBy) {
                case "match": return b.matchScore - a.matchScore;
                case "rating": return b.rating - a.rating;
                case "price": return a.consultationFee - b.consultationFee;
                case "experience": return b.experience - a.experience;
                default: return b.matchScore - a.matchScore;
            }
        });
    };

    const addToComparison = (doctor) => {
        if (comparisonList.find(d => d.id === doctor.id)) {
            setComparisonList(prev => prev.filter(d => d.id !== doctor.id));
            addToast({
                type: "info",
                title: "Removed from Comparison",
                message: `${doctor.name} has been removed from comparison.`
            });
        } else if (comparisonList.length < 3) {
            setComparisonList(prev => [...prev, doctor]);
            addToast({
                type: "success",
                title: "Added to Comparison",
                message: `${doctor.name} has been added to comparison.`
            });
        } else {
            addToast({
                type: "error",
                title: "Comparison Limit",
                message: "You can compare up to 3 doctors at a time."
            });
        }
    };

    const bookAppointment = (doctor) => {
        navigate('/patient/appointments', { 
            state: { 
                selectedDoctor: doctor,
                fromRecommendation: true 
            } 
        });
    };

    return (
        <div style={{ padding: "30px", background: "#060d1f", minHeight: "100vh", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{ fontSize: "4rem", marginBottom: "10px" }}>🤖</div>
                    <h1 style={{ fontSize: "2.5rem", margin: "0 0 10px 0", fontWeight: "800", background: "linear-gradient(90deg, #38bdf8, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        AI Doctor Recommendation
                    </h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>Describe your symptoms, and our intelligent engine will match you with the right specialist immediately.</p>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "30px", marginBottom: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
                    <h3 style={{ margin: "0 0 15px 0", fontSize: "1.2rem" }}>What are you experiencing?</h3>
                    <div style={{ display: "flex", gap: "15px" }}>
                        <input
                            type="text"
                            placeholder="E.g., severe chest pain and shortness of breath..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && analyzeSymptoms()}
                            style={{ flex: 1, padding: "16px 20px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "12px", color: "white", fontSize: "1rem", outline: "none" }}
                        />
                        <button
                            onClick={analyzeSymptoms}
                            disabled={loading || !symptoms.trim()}
                            style={{ padding: "0 30px", background: "linear-gradient(135deg, #38bdf8, #2563eb)", color: "white", border: "none", borderRadius: "12px", fontSize: "1rem", fontWeight: "700", cursor: loading || !symptoms.trim() ? "not-allowed" : "pointer", opacity: loading || !symptoms.trim() ? 0.7 : 1 }}
                        >
                            {loading ? "Analyzing..." : "Analyze"}
                        </button>
                    </div>
                </div>

                {searched && !loading && (
                    <div>
                        <h3 style={{ margin: "0 0 20px 0", fontSize: "1.3rem", color: "#38bdf8" }}>Best Matches for Your Symptoms:</h3>
                        {recommendedDoctors.length === 0 ? (
                            <div style={{ padding: "30px", background: "rgba(239,68,68,0.1)", borderRadius: "16px", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", textAlign: "center" }}>
                                We couldn't find an exact match for those symptoms in our current directory. Please consult a General Physician.
                            </div>
                        ) : (
                            <div style={{ display: "grid", gap: "20px" }}>
                                {recommendedDoctors.slice(0, 3).map((doc) => (
                                    <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(5px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                                            <img src={doc.profileImage} alt={doc.name} style={{ width: "70px", height: "70px", borderRadius: "50%", border: "2px solid rgba(56,189,248,0.4)" }} />
                                            <div>
                                                <h4 style={{ margin: "0 0 5px 0", fontSize: "1.2rem", fontWeight: "700" }}>{doc.name}</h4>
                                                <div style={{ color: "#38bdf8", fontWeight: "600", fontSize: "0.9rem" }}>{doc.specialization}</div>
                                                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>⭐ {doc.rating?.toFixed(1) || 4.8} · {doc.experience} Years Exp.</div>
                                            </div>
                                        </div>
                                        <button onClick={() => navigate(`/patient/appointments?doctor=${doc.id}`)} style={{ padding: "12px 24px", background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>
                                            Book Consultation
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
