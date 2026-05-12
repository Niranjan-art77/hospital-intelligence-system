import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
import { 
    Trophy, TrendingUp, Users, Star, 
    Clock, CheckCircle, Download, Calendar,
    Zap, Activity, Target, Shield, Brain
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

const monthlyData = [
    { name: "Jan", patients: 120, rating: 4.8 },
    { name: "Feb", patients: 145, rating: 4.7 },
    { name: "Mar", patients: 132, rating: 4.9 },
    { name: "Apr", patients: 168, rating: 4.8 },
    { name: "May", patients: 185, rating: 4.9 },
    { name: "Jun", patients: 156, rating: 5.0 },
];

const patientTypeData = [
    { name: "General", value: 45 },
    { name: "Emergency", value: 25 },
    { name: "Follow-up", value: 30 },
];

export default function DoctorPerformance() {
    const { user } = useAuth();

    return (
        <div className="p-8 space-y-10 selection:bg-indigo-500/30">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Clinical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Integrity</span> Dashboard
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <Trophy size={12} className="text-indigo-500" /> Neural Analytics & Performance Metrics
                    </p>
                </div>
                
                <div className="flex items-center gap-4">
                    <select className="bg-slate-900/50 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] font-black text-slate-400 uppercase tracking-widest focus:outline-none focus:border-indigo-500/30 transition-all">
                        <option>Last 6 Months</option>
                        <option>Current Fiscal</option>
                        <option>Global Baseline</option>
                    </select>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
                        <Download size={14} /> Export Protocol
                    </button>
                </div>
            </div>

            {/* Performance HUD Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Subjects Treated", val: "1,248", change: "+12%", color: "text-blue-400", bg: "bg-blue-400/10", icon: Users },
                    { label: "Neural Rating", val: "4.92", change: "+0.1", color: "text-amber-400", bg: "bg-amber-400/10", icon: Star },
                    { label: "Consult Latency", val: "14m", change: "-2m", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: Clock },
                    { label: "Success Index", val: "94%", change: "+3%", color: "text-purple-400", bg: "bg-purple-400/10", icon: CheckCircle },
                ].map((s, i) => (
                    <motion.div 
                        key={i} 
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 border-white/5 relative overflow-hidden group"
                    >
                        <div className="hud-corner top-left opacity-20" />
                        <div className="flex justify-between items-start mb-6">
                            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center ${s.color}`}>
                                <s.icon size={24} />
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.change.startsWith("+") ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                {s.change}
                            </span>
                        </div>
                        <h4 className="text-3xl font-black text-white italic mb-1">{s.val}</h4>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Subject Volume Area Chart */}
                <div className="xl:col-span-8 glass-card p-10 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
                    <div className="hud-corner top-left" />
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <Activity size={20} className="text-indigo-400" /> Subject Volume & Satisfaction
                            </h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Bi-annual clinical throughput analysis</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>
                    
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="indigoHUD" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(129,140,248,0.2)', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="patients" stroke="#818cf8" strokeWidth={4} fillOpacity={1} fill="url(#indigoHUD)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Case Distribution Donut */}
                <div className="xl:col-span-4 glass-card p-10 border-white/5 relative overflow-hidden">
                    <div className="hud-corner top-right opacity-20" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3">
                        <Target size={18} className="text-purple-400" /> Case Distribution
                    </h3>
                    <div className="h-[250px] w-full mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={patientTypeData} innerRadius={70} outerRadius={90} dataKey="value" stroke="none">
                                    {patientTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                        {patientTypeData.map((d, i) => (
                            <div key={d.name} className="flex justify-between items-center p-3 bg-white/[0.02] rounded-xl border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{d.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Neural Feedback Ledger */}
            <div className="glass-card p-10 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
                <div className="hud-corner bottom-left opacity-20" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-10 flex items-center gap-3 italic">
                    <Brain size={20} className="text-indigo-400" /> Neural Feedback Ledger
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { patient: "Rahul S.", rating: 5, text: "Excellent consultation! The AI-assisted diagnosis was explained perfectly.", color: "indigo" },
                        { patient: "Priya M.", rating: 5, text: "Dr. Sanjay is very patient. The digital health card integration is a lifesaver.", color: "cyan" },
                        { patient: "Amit K.", rating: 4, text: "Wait time was a bit more than expected, but the treatment plan is solid.", color: "amber" },
                    ].map((f, i) => (
                        <div key={i} className={`p-6 bg-slate-950/50 rounded-2xl border border-${f.color}-500/10 group hover:border-${f.color}-500/30 transition-all`}>
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-white text-[11px] uppercase tracking-tighter">{f.patient}</span>
                                <div className="flex gap-1">
                                    {[...Array(f.rating)].map((_, i) => <Star key={i} size={10} className="text-amber-500 fill-current" />)}
                                </div>
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold leading-relaxed italic opacity-80">"{f.text}"</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02]" />
        </div>
    );
}
