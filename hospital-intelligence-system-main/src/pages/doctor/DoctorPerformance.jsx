import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, AreaChart, Area, PieChart, Pie, Cell
} from "recharts";
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
        <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, background: "linear-gradient(135deg, #a855f7, #6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" }}>
                        🏆 Performance Analytics
                    </h1>
                    <p style={{ color: "#64748b", margin: 0 }}>Clinical excellence & productivity metrics for {user?.fullName || "Dr. Sanjay"}</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <select style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 12px", borderRadius: "10px", outline: "none", fontSize: "0.85rem" }}>
                        <option>Last 6 Months</option>
                        <option>This Year</option>
                    </select>
                    <button style={{ background: "linear-gradient(135deg, #a855f7, #6366f1)", border: "none", color: "white", padding: "8px 16px", borderRadius: "10px", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}>
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Patients Treated", val: "1,248", change: "+12%", color: "#0ea5e9", icon: "👥" },
                    { label: "Avg Rating", val: "4.92", change: "+0.1", color: "#f59e0b", icon: "⭐" },
                    { label: "Consultation Time", val: "14m", change: "-2m", color: "#10b981", icon: "🕒" },
                    { label: "Success Rate", val: "94%", change: "+3%", color: "#a855f7", icon: "✅" },
                ].map(s => (
                    <div key={s.label} style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                            <div style={{ fontSize: "1.5rem" }}>{s.icon}</div>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: s.change.startsWith("+") ? "#10b981" : "#ef4444", background: s.change.startsWith("+") ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "6px" }}>
                                {s.change}
                            </div>
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "white", marginBottom: "4px" }}>{s.val}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* Patient Volume Area Chart */}
                <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px" }}>
                    <h3 style={{ margin: "0 0 24px", fontSize: "1.1rem", fontWeight: 800 }}>📈 Patient Volume & Satisfaction</h3>
                    <div style={{ height: "300px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={12} />
                                <YAxis stroke="#475569" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                                />
                                <Area type="monotone" dataKey="patients" stroke="#a855f7" fillOpacity={1} fill="url(#colorPat)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Patient Categories Donut */}
                <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px" }}>
                    <h3 style={{ margin: "0 0 24px", fontSize: "1.1rem", fontWeight: 800 }}>🧬 Case Distribution</h3>
                    <div style={{ height: "240px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={patientTypeData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                    {patientTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                        {patientTypeData.map((d, i) => (
                            <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: COLORS[i] }} />
                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{d.name}</span>
                                </div>
                                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "white" }}>{d.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feedback Highlights */}
            <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800 }}>💬 Patient Feedback Highlights</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {[
                        { patient: "Rahul S.", rating: 5, text: "Excellent consultation! The AI-assisted diagnosis was explained perfectly.", color: "#10b981" },
                        { patient: "Priya M.", rating: 5, text: "Dr. Sanjay is very patient. The digital health card integration is a lifesaver.", color: "#0ea5e9" },
                        { patient: "Amit K.", rating: 4, text: "Wait time was a bit more than expected, but the treatment plan is solid.", color: "#f59e0b" },
                    ].map((f, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.02)", padding: "16px", borderRadius: "16px", border: `1px solid ${f.color}15` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <span style={{ fontWeight: 800, fontSize: "0.85rem", color: "white" }}>{f.patient}</span>
                                <span style={{ color: "#f59e0b", fontSize: "0.8rem" }}>{"★".repeat(f.rating)}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic", lineHeight: 1.4 }}>"{f.text}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
