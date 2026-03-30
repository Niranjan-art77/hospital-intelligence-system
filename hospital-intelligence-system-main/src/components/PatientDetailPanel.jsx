import { useState, useEffect } from "react";
import API from "../services/api";

export default function PatientDetailPanel({ appointment, onClose }) {
    const [reports, setReports] = useState([]);
    const [history, setHistory] = useState([]);
    const patient = appointment?.patient || {};

    useEffect(() => {
        if (patient.id) {
            API.get(`/reports/patient/${patient.id}`)
                .then(res => setReports(res.data))
                .catch(err => console.error(err));

            API.get(`/appointments/patient/${patient.id}`)
                .then(res => {
                    const sorted = res.data.sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
                    setHistory(sorted);
                })
                .catch(err => console.error(err));
        }
    }, [patient.id]);

    const downloadReport = async (id, name) => {
        try {
            const res = await API.get(`/reports/download/${id}`, { responseType: 'blob' });
            const blob = new Blob([res.data], { type: res.headers['content-type'] || 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', name || 'report.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error("Failed to download", error);
        }
    };

    return (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "600px", maxWidth: "100vw", background: "rgba(10, 22, 40, 0.95)", backdropFilter: "blur(20px)", borderLeft: "1px solid rgba(168,85,247,0.3)", zIndex: 1050, display: "flex", flexDirection: "column", boxShadow: "-10px 0 30px rgba(0,0,0,0.5)", color: "#e2f0ff", fontFamily: "'Inter', sans-serif", overflowY: "auto" }}>

            {/* Header */}
            <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(10, 22, 40, 0.95)", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "linear-gradient(135deg, #a855f7, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "white" }}>
                        {patient.name?.charAt(0) || "P"}
                    </div>
                    <div>
                        <h2 style={{ margin: "0 0 4px", fontSize: "1.4rem", fontWeight: 800 }}>{patient.name || "Unknown Patient"}</h2>
                        <div style={{ display: "flex", gap: "10px", fontSize: "0.8rem", color: "#94a3b8" }}>
                            <span>PID: #{patient.id}</span>
                            <span>•</span>
                            <span>Age: {patient.age || "N/A"}</span>
                            <span>•</span>
                            <span>Blood: <strong style={{ color: "#ef4444" }}>{patient.bloodGroup || "O+"}</strong></span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.5rem", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "white"} onMouseLeave={e => e.target.style.color = "#94a3b8"}>✖</button>
            </div>

            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

                {/* Health Overview */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>⚠️ Allergies</div>
                        <div style={{ color: "#fca5a5" }}>{patient.allergies || "Penicillin, Peanuts (Mocked)"}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px" }}>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>❤️ Chronic Diseases</div>
                        <div style={{ color: "#fdba74" }}>{patient.chronicConditions || "None reported"}</div>
                    </div>
                </div>

                <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#10b981", marginBottom: "8px", textTransform: "uppercase", fontWeight: 700 }}>🩺 Current Symptoms (Reported)</div>
                    <div style={{ color: "#e2f0ff", fontSize: "0.95rem" }}>
                        {appointment?.diagnosisNotes ? "Update: " + appointment.diagnosisNotes : "Patient reported severe headaches and mild fever over the last 48 hours. Requested visual consultation. (Mocked Input)"}
                    </div>
                </div>

                {/* Medical Reports */}
                <div>
                    <h3 style={{ margin: "0 0 12px", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#38bdf8" }}>📄</span> Uploaded Reports
                    </h3>
                    {reports.length === 0 ? (
                        <div style={{ padding: "16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px", color: "#64748b", fontSize: "0.85rem", textAlign: "center" }}>No reports found.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {reports.map(r => (
                                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{r.reportName}</div>
                                    <button onClick={() => downloadReport(r.id, r.reportName)} style={{ background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}>Download ⬇️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Timeline */}
                <div>
                    <h3 style={{ margin: "0 0 16px", fontSize: "1.1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#a855f7" }}>⏳</span> Medical History Timeline
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", marginLeft: "10px", paddingLeft: "20px", borderLeft: "2px solid rgba(168,85,247,0.3)" }}>
                        {history.length === 0 ? (
                            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>No previous appointments.</div>
                        ) : history.map((h, i) => (
                            <div key={h.id} style={{ position: "relative" }}>
                                <div style={{ position: "absolute", left: "-27px", top: "4px", width: "12px", height: "12px", borderRadius: "50%", background: "#a855f7", border: "2px solid #0a1628" }}></div>
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                        <strong style={{ fontSize: "0.9rem", color: "#e2f0ff" }}>Appointment - {h.status}</strong>
                                        <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(h.appointmentTime).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>Dr. {h.doctor?.name || "Unknown"}</div>
                                    {h.diagnosisNotes && (
                                        <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#94a3b8", background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: "6px" }}>
                                            "{h.diagnosisNotes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
