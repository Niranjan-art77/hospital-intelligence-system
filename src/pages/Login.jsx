import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const res = await login(email, password);
        if (res.success) {
            // Role-based redirect
            const role = res.user?.role || "";
            if (role === "ADMIN" || role === "STAFF") navigate("/admin");
            else if (role === "DOCTOR") navigate("/doctor");
            else if (role === "PATIENT") navigate("/patient");
            else navigate("/admin"); // fallback
        } else {
            setError(res.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0EA5E9] opacity-10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#8B5CF6] opacity-10 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md card-nova p-10 relative z-10 backdrop-blur-2xl border border-white/10"
            >
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Welcome Back</h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">Nova Health AI Access</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold placeholder:text-slate-600 focus:border-[#0EA5E9] transition-all"
                            placeholder="name@hospital.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
                        <input
                            type="password"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold placeholder:text-slate-600 focus:border-[#8B5CF6] transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_40px_rgba(14,165,233,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? "Validating..." : "Sign In Gateway"}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-xs font-bold">
                    Don't have access?{" "}
                    <Link to="/register" className="text-[#0EA5E9] hover:underline">Request Credentials</Link>
                </p>
            </motion.div>
        </div>
    );
}
