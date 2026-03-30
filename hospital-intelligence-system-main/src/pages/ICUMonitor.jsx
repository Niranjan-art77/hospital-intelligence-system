import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ICU_BEDS = [
    { id: "ICU-301", patient: "Rahul S.", severity: "Critical" },
    { id: "ICU-302", patient: "Priya M.", severity: "Stable" },
    { id: "ICU-303", patient: "Amit K.", severity: "Guarded" },
    { id: "ICU-304", patient: "Sita R.", severity: "Critical" },
];

export default function ICUMonitor() {
    const [activeBed, setActiveBed] = useState(ICU_BEDS[0]);
    const [data, setData] = useState([]);
    const [vitals, setVitals] = useState({ hr: 72, bp: "120/80", spo2: 98, temp: 37.0 });
    const [alerts, setAlerts] = useState([]);

    // Mock vital data stream
    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const newData = [...prev, { time: new Date().toLocaleTimeString(), val: 60 + Math.random() * 40 }];
                if (newData.length > 20) return newData.slice(1);
                return newData;
            });

            setVitals(v => ({
                hr: Math.floor(70 + Math.random() * 30),
                bp: `${Math.floor(110 + Math.random() * 20)}/${Math.floor(70 + Math.random() * 15)}`,
                spo2: Math.floor(95 + Math.random() * 5),
                temp: (36.5 + Math.random() * 1.5).toFixed(1)
            }));

            // Random alert trigger
            if (Math.random() > 0.95) {
                const newAlert = { id: Date.now(), msg: `Tachycardia Alert: ${activeBed.id}`, type: "danger" };
                setAlerts(prev => [newAlert, ...prev].slice(0, 5));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeBed]);

    return (
        <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 800, background: "linear-gradient(135deg, #10b981, #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: "0 0 4px" }}>
                        🏢 ICU Live Monitoring
                    </h1>
                    <p style={{ color: "#64748b", margin: 0 }}>Precision vital signs tracking and emergency triage system</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(16,185,129,0.1)", padding: "8px 16px", borderRadius: "12px", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", animation: "ping 1s infinite" }} />
                    <span style={{ fontWeight: 700, color: "#10b981", fontSize: "0.85rem" }}>CENTRALIZED LIVE SYSTEM</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "20px" }}>

                {/* Left Column: Bed Selection */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {ICU_BEDS.map(bed => (
                        <motion.div
                            key={bed.id}
                            whileHover={{ x: 5 }}
                            onClick={() => setActiveBed(bed)}
                            style={{
                                padding: "16px", borderRadius: "16px", cursor: "pointer", transition: "all 0.3s",
                                background: activeBed.id === bed.id ? "rgba(14,165,233,0.12)" : "rgba(255,255,255,0.03)",
                                border: activeBed.id === bed.id ? "1px solid rgba(14,165,233,0.4)" : "1px solid rgba(255,255,255,0.06)"
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontWeight: 800, color: activeBed.id === bed.id ? "#0ea5e9" : "#e2f0ff" }}>{bed.id}</span>
                                <span style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "4px", background: bed.severity === "Critical" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: bed.severity === "Critical" ? "#f87171" : "#34d399", fontWeight: 700 }}>
                                    {bed.severity.toUpperCase()}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Patient: {bed.patient}</div>
                        </motion.div>
                    ))}

                    {/* Alert Feed */}
                    <div style={{ marginTop: "20px", flex: 1, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.1)", borderRadius: "16px", padding: "16px" }}>
                        <h4 style={{ margin: "0 0 12px", fontSize: "0.85rem", color: "#f87171", fontWeight: 800 }}>🚨 SYSTEM ALERTS</h4>
                        <AnimatePresence>
                            {alerts.map(alert => (
                                <motion.div
                                    key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    style={{ background: "rgba(239,68,68,0.1)", padding: "8px 12px", borderRadius: "8px", borderLeft: "4px solid #ef4444", marginBottom: "8px", fontSize: "0.75rem", color: "#e2f0ff" }}
                                >
                                    {alert.msg}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {alerts.length === 0 && <div style={{ textAlign: "center", color: "#475569", fontSize: "0.75rem", padding: "20px" }}>No active alerts</div>}
                    </div>
                </div>

                {/* Right Column: Vitals Monitor */}
                <div style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontWeight: 800, fontSize: "1.2rem" }}>Monitoring: {activeBed.patient}</h3>
                            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.8rem" }}>Bed Unit {activeBed.id} · Connected since 08:00 AM</p>
                        </div>
                        <button style={{ padding: "8px 16px", borderRadius: "10px", background: "#ef4444", border: "none", color: "white", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}>
                            Trigger Emergency Code
                        </button>
                    </div>

                    {/* Vitals Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                        {[
                            { label: "Heart Rate", val: vitals.hr, unit: "BPM", color: "#ef4444", icon: "❤️" },
                            { label: "Blood Pressure", val: vitals.bp, unit: "mmHg", color: "#10b981", icon: "🩸" },
                            { label: "SpO2", val: vitals.spo2, unit: "%", color: "#0ea5e9", icon: "🫁" },
                            { label: "Temperature", val: vitals.temp, unit: "°C", color: "#f59e0b", icon: "🌡️" },
                        ].map(v => (
                            <div key={v.label} style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: "20px", border: `1px solid ${v.color}22`, textAlign: "center" }}>
                                <div style={{ fontSize: "1.2rem", marginBottom: "4px" }}>{v.icon}</div>
                                <div style={{ fontSize: "1.8rem", fontWeight: 900, color: v.color }}>{v.val}</div>
                                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{v.label} ({v.unit})</div>
                            </div>
                        ))}
                    </div>

                    {/* ECG Simulation Graph */}
                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "20px", padding: "20px", border: "1px solid rgba(16,185,129,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#10b981" }}>ECG (Live Waveform)</span>
                            <span style={{ fontSize: "0.7rem", color: "#475569" }}>Sweep Speed: 25mm/s</span>
                        </div>
                        <div style={{ height: "200px" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                                    <YAxis hide domain={[0, 120]} />
                                    <XAxis hide />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <h4 style={{ margin: "0 0 8px", fontSize: "0.8rem", color: "#94a3b8" }}>Recent Findings</h4>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "#e2f0ff", fontStyle: "italic" }}>"Patient stable, continuing medication flow. Monitoring for sudden HR spikes."</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                            <button style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.8rem", fontWeight: 600 }}>Update Notes</button>
                            <button style={{ flex: 1, padding: "12px", borderRadius: "12px", background: "rgba(14,165,233,0.1)", border: "1px solid #0ea5e9", color: "#0ea5e9", fontSize: "0.8rem", fontWeight: 700 }}>Request Lab Test</button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
