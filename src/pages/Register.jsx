import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, UserPlus, Cpu, Globe, 
  Lock, Mail, User, Activity, 
  Droplets, Heart, Sparkles, ChevronRight,
  ShieldCheck, Database
} from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "PATIENT",
        bloodGroup: "",
        allergies: "",
        chronicConditions: "",
        insuranceProvider: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            return setError("PROTOCOL ERROR: Password mismatch.");
        }

        setIsLoading(true);
        setError("");
        
        const res = await register(formData);
        if (res.success) {
            navigate("/login");
        } else {
            setError(res.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen medical-grid flex items-center justify-center p-6 relative overflow-hidden selection:bg-purple-500/30">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute inset-0 scanline opacity-5" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-2xl glass-card p-12 border-purple-500/20 relative z-10"
            >
                <div className="hud-corner top-left" />
                <div className="hud-corner bottom-right" />
                
                <div className="text-center mb-12">
                    <motion.div 
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 bg-purple-600/10 border border-purple-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(147,51,234,0.2)]"
                    >
                        <ShieldCheck className="w-10 h-10 text-purple-500" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                        NETWORK <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">ENROLLMENT</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Establishing Quantum Health Profile</p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[10px] font-black tracking-widest mb-8 text-center uppercase"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Primary Credentials */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Tag</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-all" />
                                    <input
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-bold placeholder:text-slate-700"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Uplink Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-all" />
                                    <input
                                        type="email"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-bold placeholder:text-slate-700"
                                        placeholder="operator@nova.ai"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Protocols */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Security Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-all" />
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-bold placeholder:text-slate-700"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verify Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-500 transition-all" />
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-4 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-bold placeholder:text-slate-700"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational Designation</label>
                        <select
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-5 text-white text-sm focus:outline-none focus:border-purple-500/50 transition-all font-black appearance-none cursor-pointer"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="PATIENT">PATIENT (CLINICAL SUBJECT)</option>
                            <option value="DOCTOR">MEDICAL SPECIALIST</option>
                            <option value="STAFF">HOSPITAL OPERATIONS</option>
                            <option value="ADMIN">SYSTEM ADMINISTRATOR</option>
                        </select>
                    </div>

                    {formData.role === "PATIENT" && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5"
                        >
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Biotype (Blood)</label>
                                <select
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-bold"
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                >
                                    <option value="">Select Biotype</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Insurance Provider</label>
                                <input
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-bold placeholder:text-slate-700"
                                    placeholder="e.g. Quantum Care"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                                />
                            </div>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-purple-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isLoading ? (
                            <Activity className="w-5 h-5 animate-spin" />
                        ) : (
                            <Database className="w-5 h-5" />
                        )}
                        {isLoading ? "Syncing Identity..." : "Synchronize New Profile"}
                    </button>
                </form>

                <p className="text-center mt-10 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    Already Synced?{" "}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 transition-all italic">Access Portal</Link>
                </p>
            </motion.div>
        </div>
    );
}
