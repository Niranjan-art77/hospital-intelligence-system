import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import API from "../../services/api";
import "./DoctorDashboard.css";

const weekData = [
    { day: "Mon", patients: 6 }, { day: "Tue", patients: 8 }, { day: "Wed", patients: 5 },
    { day: "Thu", patients: 10 }, { day: "Fri", patients: 7 }, { day: "Sat", patients: 3 }, { day: "Sun", patients: 2 },
];

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = user?.token;
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            API.get("/patients").catch(() => ({ data: [] })),
            API.get("/appointments").catch(() => ({ data: [] })),
        ]).then(([pRes, aRes]) => {
            setPatients(Array.isArray(pRes.data) ? pRes.data : []);
            setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
            setLoading(false);
        });
    }, [user]);

    const criticalPatients = patients.filter(p => p.riskLevel === "HIGH" || p.criticalAlert);
    const todayAppts = appointments.filter(a => a.status === "BOOKED").slice(0, 5);

    return (
        <div className="doctor-dashboard">
            <div className="dd-header">
                <div>
                    <h1 className="dd-title">Good {new Date().getHours() < 12 ? "Morning" : "Afternoon"}, Dr. {user?.fullName?.split(" ")[0]} 👋</h1>
                    <p className="dd-subtitle">Here's your clinical overview for today</p>
                </div>
                <div className="dd-date">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>

            <div className="dd-stats">
                {[
                    { icon: "👥", label: "Total Patients", value: patients.length, color: "#0ea5e9", bg: "rgba(14,165,233,0.1)" },
                    { icon: "📅", label: "Today's Appointments", value: todayAppts.length, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
                    { icon: "⚠️", label: "Critical Alerts", value: criticalPatients.length, color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                    { icon: "✅", label: "Completed Today", value: appointments.filter(a => a.status === "COMPLETED").length, color: "#a855f7", bg: "rgba(168,85,247,0.1)" },
                ].map((stat, i) => (
                    <div key={i} className="dd-stat-card" style={{ "--accent": stat.color, "--accent-bg": stat.bg }}>
                        <div className="dd-stat-icon" style={{ fontSize: "1.3rem" }}>{stat.icon}</div>
                        <div className="dd-stat-val">{stat.value}</div>
                        <div className="dd-stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>

            <div className="dd-grid">
                <div className="dd-card dd-chart-card">
                    <div className="dd-card-header">
                        <h3>📈 Weekly Patient Activity</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={weekData}>
                            <defs>
                                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: "8px", color: "#e2f0ff" }} />
                            <Area type="monotone" dataKey="patients" stroke="#10b981" fill="url(#dg)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="dd-card">
                    <div className="dd-card-header"><h3>🚨 Critical Patient Alerts</h3></div>
                    {criticalPatients.length === 0 ? (
                        <div className="dd-empty">✅ No critical alerts</div>
                    ) : (
                        <div className="dd-alert-list">
                            {criticalPatients.slice(0, 4).map(p => (
                                <div key={p.id} className="dd-alert-item">
                                    <div className="dd-alert-dot" />
                                    <div>
                                        <div className="dd-alert-name">{p.name}</div>
                                        <div className="dd-alert-info">{p.chronicConditions || "Critical condition"}</div>
                                    </div>
                                    <span className="dd-badge-danger">CRITICAL</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dd-card dd-appt-card">
                    <div className="dd-card-header">
                        <h3>⏰ Today's Schedule</h3>
                        <Link to="/doctor/appointments" className="dd-see-all">View All</Link>
                    </div>
                    {todayAppts.length === 0 ? (
                        <div className="dd-empty">No appointments today</div>
                    ) : (
                        <div className="dd-appt-list">
                            {todayAppts.map((a, i) => (
                                <div key={a.id || i} className="dd-appt-item">
                                    <div className="dd-appt-time">{a.appointmentTime ? new Date(a.appointmentTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</div>
                                    <div className="dd-appt-patient">{a.patient?.name || "Unknown Patient"}</div>
                                    <span className={`dd-badge ${a.status === "COMPLETED" ? "badge-green" : "badge-blue"}`}>{a.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dd-card">
                    <div className="dd-card-header">
                        <h3>👥 Recent Patients</h3>
                        <Link to="/doctor/patients" className="dd-see-all">View All</Link>
                    </div>
                    <div className="dd-patient-list">
                        {patients.slice(0, 5).map((p, i) => (
                            <div key={p.id || i} className="dd-patient-row">
                                <div className="dd-patient-avatar">{p.name?.[0]?.toUpperCase()}</div>
                                <div className="dd-patient-info">
                                    <div className="dd-patient-name">{p.name}</div>
                                    <div className="dd-patient-meta">Age {p.age} · {p.bloodGroup}</div>
                                </div>
                                <span className={`dd-risk ${p.riskLevel?.toLowerCase()}`}>{p.riskLevel || "LOW"}</span>
                            </div>
                        ))}
                        {patients.length === 0 && <div className="dd-empty">No patients yet</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
