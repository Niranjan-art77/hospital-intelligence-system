import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

// Mock real-time data generators
const generateDoctorWorkload = () => [
    { name: "Dr. Smith", patients: 12, rating: 4.8 },
    { name: "Dr. Jones", patients: 8, rating: 4.9 },
    { name: "Dr. Brown", patients: 15, rating: 4.7 },
    { name: "Dr. Wilson", patients: 10, rating: 4.6 },
    { name: "Dr. Garcia", patients: 6, rating: 5.0 },
];

const bedStats = [
    { name: "Occupied", value: 18, color: "#ef4444" },
    { name: "Available", value: 12, color: "#10b981" },
    { name: "Cleaning", value: 5, color: "#f59e0b" },
];

const patientDistribution = [
    { name: "Mon", patients: 45 },
    { name: "Tue", patients: 52 },
    { name: "Wed", patients: 38 },
    { name: "Thu", patients: 65 },
    { name: "Fri", patients: 48 },
    { name: "Sat", patients: 30 },
    { name: "Sun", patients: 25 },
];

export default function CommandCenter() {
    const [liveStats, setLiveStats] = useState({
        activeEmergencies: 3,
        availableAmbulances: 2,
        bedOccupancy: "72%",
        avgWaitTime: "14 min"
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setLiveStats(prev => ({
                ...prev,
                activeEmergencies: Math.max(0, prev.activeEmergencies + (Math.random() > 0.7 ? 1 : -1)),
                avgWaitTime: `${Math.floor(Math.random() * 5) + 10} min`
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "2.2rem", fontWeight: 800, background: "linear-gradient(135deg, #0ea5e9, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" }}>
                    🏛️ Hospital Command Center
                </h1>
                <p style={{ color: "#64748b", margin: 0 }}>Global operational intelligence & real-time hospital monitoring</p>
            </div>

            {/* Real-time Banners */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
                {[
                    { label: "Active Emergencies", value: liveStats.activeEmergencies, icon: "🚨", color: "#ef4444" },
                    { label: "Available Fleet", value: liveStats.availableAmbulances, icon: "🚑", color: "#10b981" },
                    { label: "Bed Occupancy", value: liveStats.bedOccupancy, icon: "🛏️", color: "#0ea5e9" },
                    { label: "Avg Wait Time", value: liveStats.avgWaitTime, icon: "🕒", color: "#f59e0b" },
                ].map(stat => (
                    <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${stat.color}33`, borderRadius: "16px", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ fontSize: "2rem", width: "50px", height: "50px", borderRadius: "12px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>{stat.icon}</div>
                        <div>
                            <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

                {/* Bed Distribution */}
                <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800 }}>📊 Bed Status Distribution</h3>
                    <div style={{ height: "250px", display: "flex", alignItems: "center" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bedStats}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {bedStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ paddingLeft: "20px" }}>
                            {bedStats.map(s => (
                                <div key={s.name} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                    <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: s.color }} />
                                    <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{s.name}: <strong>{s.value}</strong></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Doctor Workload */}
                <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800 }}>🩺 Doctor Workload (Today)</h3>
                    <div style={{ height: "250px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={generateDoctorWorkload()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" fontSize={10} stroke="#475569" />
                                <YAxis fontSize={10} stroke="#475569" />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                                />
                                <Bar dataKey="patients" fill="#a855f7" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Admission Trends */}
            <div style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 800 }}>📈 Weekly Patient Admission Trends</h3>
                <div style={{ height: "280px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={patientDistribution}>
                            <defs>
                                <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" fontSize={10} stroke="#475569" />
                            <YAxis fontSize={10} stroke="#475569" />
                            <Tooltip
                                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                            />
                            <Area type="monotone" dataKey="patients" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPat)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Footer Info */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", fontSize: "0.75rem", color: "#475569" }}>
                <div>System Status: <span style={{ color: "#10b981", fontWeight: 700 }}>OPTOMIZED</span></div>
                <div>Last Updated: {new Date().toLocaleTimeString()}</div>
                <div>Active Nodes: 12/12 Intelligence Modules Connected</div>
            </div>
        </motion.div>
    );
}
