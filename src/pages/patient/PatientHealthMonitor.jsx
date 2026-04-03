import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar,
    BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import {
    Activity, Heart, Brain, Thermometer, Droplets,
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
    RefreshCw, Settings, Download, Share2, Zap,
    Clock, Calendar, Battery, Wifi, WifiOff,
    Play, Pause, SkipForward, Volume2, VolumeX,
    Monitor, Smartphone, Watch, Tablet
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import API from "../../services/api";

const generateData = (base, variance, days = 14) =>
    Array.from({ length: days }, (_, i) => ({
        day: `D${i + 1}`,
        value: Math.round(base + (Math.random() - 0.5) * variance * 2)
    }));

const heartData = generateData(72, 10);
const bpData = generateData(120, 8);
const sugarData = generateData(96, 12);

const radarData = [
    { metric: "Heart Rate", value: 85, fullMark: 100 },
    { metric: "Blood Pressure", value: 78, fullMark: 100 },
    { metric: "Blood Sugar", value: 90, fullMark: 100 },
    { metric: "Sleep Quality", value: 72, fullMark: 100 },
    { metric: "Activity", value: 65, fullMark: 100 },
];

export default function PatientHealthMonitor() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [activeMetric, setActiveMetric] = useState("heart");
    const [isLive, setIsLive] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [realTimeData, setRealTimeData] = useState({});
    const [historicalData, setHistoricalData] = useState({});
    const [alerts, setAlerts] = useState([]);
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState('default');
    const [monitoringSettings, setMonitoringSettings] = useState({
        updateInterval: 5000,
        soundEnabled: true,
        notifications: true,
        autoExport: false
    });
    const intervalRef = useRef(null);

    const metrics = {
        heart: { label: "Heart Rate", color: "#ef4444", unit: "bpm", normal: "60–100 bpm", icon: Heart },
        bp: { label: "Blood Pressure", color: "#f59e0b", unit: "mmHg", normal: "90–120 mmHg", icon: Activity },
        sugar: { label: "Blood Sugar", color: "#3b82f6", unit: "mg/dL", normal: "70–140 mg/dL", icon: Brain },
        oxygen: { label: "Oxygen Saturation", color: "#10b981", unit: "%", normal: "95–100%", icon: Droplets },
        temperature: { label: "Temperature", color: "#f97316", unit: "°C", normal: "36.5–37.5°C", icon: Thermometer },
        stress: { label: "Stress Level", color: "#8b5cf6", unit: "%", normal: "< 30%", icon: Brain }
    };

    const fetchHealthData = async () => {
        try {
            const vitalsRes = await API.get(`/patients/${user.id}/vitals`);
            if (vitalsRes.data && vitalsRes.data.length > 0) {
                const mappedVitals = vitalsRes.data.map(v => {
                    const bpParts = typeof v.bloodPressure === 'string' ? v.bloodPressure.split('/') : [120, 80];
                    return {
                        day: new Date(v.recordedAt).toLocaleDateString('en', { day: 'numeric', month: 'short' }),
                        heartRate: parseInt(v.heartRate) || 72,
                        oxygenLevel: parseInt(v.oxygenLevel) || 98,
                        bloodPressure: parseInt(bpParts[0]) || 120,
                        temperature: parseFloat(v.temperature) || 98.6
                    };
                }).reverse();
                setHistoricalData(mappedVitals);
                
                const latest = mappedVitals[mappedVitals.length - 1];
                setRealTimeData({
                    heart: `${latest.heartRate} bpm`,
                    bp: `${vitalsRes.data[0].bloodPressure} mmHg`,
                    oxygen: `${latest.oxygenLevel} %`,
                    temp: `${latest.temperature} °F`
                });
            }
        } catch (error) {
            console.error("Health Data Fetch Failed", error);
        }
    };

    useEffect(() => {
        if (user?.id) fetchHealthData();
    }, [user?.id]);

    const getMetricData = (metric) => {
        const keyMap = { heart: 'heartRate', bp: 'bloodPressure', oxygen: 'oxygenLevel', temperature: 'temperature' };
        const key = keyMap[metric] || 'heartRate';
        return historicalData.length > 0 ? historicalData.map(d => ({ day: d.day, value: d[key] })) : [];
    };

    const selected = { ...metrics[activeMetric], data: getMetricData(activeMetric) };

    return (
        <div style={{ padding: "28px", minHeight: "100vh", background: "#060d1f", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 700 }}>📊 Health Monitor</h1>
            <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.875rem" }}>Your real-time health metrics dashboard</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
                {[
                    { key: "heart", icon: "❤️", label: "Heart Rate", value: "72 bpm", color: "#ef4444" },
                    { key: "bp", icon: "🩺", label: "Blood Pressure", value: "120/80 mmHg", color: "#f59e0b" },
                    { key: "sugar", icon: "🧬", label: "Blood Sugar", value: "95 mg/dL", color: "#3b82f6" },
                ].map(m => (
                    <button key={m.key} onClick={() => setActiveMetric(m.key)}
                        style={{ padding: "18px", background: activeMetric === m.key ? `${m.color}18` : "rgba(255,255,255,0.04)", border: `1px solid ${activeMetric === m.key ? m.color + "44" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                        <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{m.icon}</div>
                        <div style={{ fontSize: "1.4rem", fontWeight: 800, color: m.color }}>{m.value}</div>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>{m.label}</div>
                    </button>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "18px" }}>
                <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600 }}>{selected.label} Trend (14 days)</h3>
                        <div style={{ fontSize: "0.78rem", color: "#64748b" }}>Normal: {selected.normal}</div>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={selected.data}>
                            <defs>
                                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={selected.color} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={selected.color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={{ background: "#0a1628", border: "none", borderRadius: "8px", color: "#e2f0ff", fontSize: "0.8rem" }} />
                            <Area type="monotone" dataKey="value" stroke={selected.color} fill="url(#hg)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 16px", fontSize: "0.95rem", fontWeight: 600 }}>🎯 Overall Health Score</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                        {[
                            { label: "Overall Score", val: "78/100", color: "#a855f7" },
                            { label: "Status", val: "Good ✅", color: "#10b981" },
                            { label: "Recovery Progress", val: "68%", color: "#0ea5e9" },
                        ].map(m => (
                            <div key={m.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                                <span style={{ color: "#64748b" }}>{m.label}</span>
                                <span style={{ color: m.color, fontWeight: 600 }}>{m.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
