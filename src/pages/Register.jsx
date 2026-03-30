import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";

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
            return setError("Passwords do not match!");
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
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#EC4899] opacity-10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#0EA5E9] opacity-10 blur-[120px] rounded-full"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg card-nova p-10 relative z-10 backdrop-blur-2xl border border-white/10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">Platform Enrollment</h1>
                    <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">Create Nova Health Credentials</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Full Identity Name</label>
                        <input
                            type="text"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                            placeholder="Dr. John Doe"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Secure Email</label>
                        <input
                            type="email"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                            placeholder="auth@nova.ai"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Access Password</label>
                        <input
                            type="password"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Access</label>
                        <input
                            type="password"
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Operational Role</label>
                        <select
                            className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold bg-[#0f172a] border border-white/10"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="PATIENT">PATIENT</option>
                            <option value="DOCTOR">MEDICAL DOCTOR</option>
                            <option value="STAFF">HOSPITAL STAFF</option>
                            <option value="ADMIN">ADMINISTRATOR</option>
                        </select>
                    </div>

                    {formData.role === "PATIENT" && (
                        <>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Blood Group</label>
                                <select
                                    className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold bg-[#0f172a] border border-white/10"
                                    value={formData.bloodGroup}
                                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Insurance Provider</label>
                                <input
                                    type="text"
                                    className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                                    placeholder="e.g. Blue Shield"
                                    value={formData.insuranceProvider}
                                    onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Allergies (Optional)</label>
                                <input
                                    type="text"
                                    className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                                    placeholder="e.g. Peanuts, Pollen"
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Chronic Conditions (Optional)</label>
                                <input
                                    type="text"
                                    className="input-tech w-full px-6 py-4 rounded-xl text-white font-bold"
                                    placeholder="e.g. Diabetes, Asthma"
                                    value={formData.chronicConditions}
                                    onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="md:col-span-2 btn-primary w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase shadow-[0_10px_30px_rgba(236,72,153,0.3)] hover:shadow-[0_15px_40px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isLoading ? "Syncing..." : "Generate Secure Account"}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500 text-xs font-bold">
                    Already verified?{" "}
                    <Link to="/login" className="text-[#EC4899] hover:underline">Access Portal</Link>
                </p>
            </motion.div>
        </div>
    );
}
