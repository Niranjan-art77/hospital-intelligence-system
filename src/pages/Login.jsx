import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, Fingerprint, Cpu, Globe, 
  Lock, Mail, ChevronRight, Zap, 
  Activity, Radar, Sparkles 
} from 'lucide-react';

export default function Login() {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setIsScanning(true);

        // Simulate biometric scan
        setTimeout(async () => {
            const res = await login(formData.email, formData.password);
            if (res.success) {
                navigate("/");
            } else {
                setError(res.message);
                setIsLoading(false);
                setIsScanning(false);
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen medical-grid flex items-center justify-center p-6 relative overflow-hidden selection:bg-blue-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            
            <div className="absolute inset-0 scanline opacity-5" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20 }}
                className="w-full max-w-lg glass-card p-12 border-blue-500/20 relative z-10"
            >
                <div className="hud-corner top-left" />
                <div className="hud-corner top-right" />
                
                <div className="text-center mb-12">
                    <motion.div 
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                        className="w-20 h-20 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(37,99,235,0.2)]"
                    >
                        <Shield className="w-10 h-10 text-blue-500" />
                    </motion.div>
                    <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">
                        NOVA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">HEALTH</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em] mb-8">Quantum Medical Operating System</p>
                    
                    <div className="flex items-center justify-center gap-6 opacity-30">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">Live Telemetry</span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500">AES-256 Auth</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl text-[10px] font-black tracking-widest mb-8 text-center uppercase"
                        >
                            Access Denied: {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Network Identifier</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                            <input
                                type="email"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-700 shadow-inner"
                                placeholder="operator@nova.ai"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Protocol</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-all" />
                            <input
                                type="password"
                                className="w-full bg-slate-900 border border-white/5 rounded-2xl px-12 py-5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder:text-slate-700 shadow-inner"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                        <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-all">
                            <input type="checkbox" className="w-4 h-4 rounded-md border-white/10 bg-slate-900 checked:bg-blue-600" />
                            Persist Link
                        </label>
                        <a href="#" className="hover:text-blue-400 transition-all">Secure Recovery</a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-blue-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        {isScanning ? (
                            <div className="flex items-center gap-3">
                                <Radar className="w-5 h-5 animate-spin-slow text-white" />
                                <span>Verifying Biometrics...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Fingerprint className="w-5 h-5" />
                                <span>Initialize Authentication</span>
                            </div>
                        )}
                    </button>
                </form>

                <div className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">
                        New Operator?{" "}
                        <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-all italic">Request Credentials</Link>
                    </p>
                    <div className="flex justify-center gap-8 opacity-20 group hover:opacity-50 transition-opacity">
                        <Cpu className="w-4 h-4" />
                        <Globe className="w-4 h-4" />
                        <Zap className="w-4 h-4" />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
