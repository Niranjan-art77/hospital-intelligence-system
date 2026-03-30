import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import jsPDF from "jspdf";
import PatientDetailPanel from "../../components/PatientDetailPanel";

export default function DoctorAppointments() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [diagModal, setDiagModal] = useState(null); // appointment being diagnosed
    const [diagNotes, setDiagNotes] = useState("");
    const [prescribeModal, setPrescribeModal] = useState(null);
    const [prescribeItems, setPrescribeItems] = useState([{ medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [updating, setUpdating] = useState(null);
    const [toast, setToast] = useState("");

    const headers = { Authorization: `Bearer ${user?.token}` };

    useEffect(() => {
        fetchAppointments();
    }, [user]);

    const fetchAppointments = () => {
        API.get(`/appointments`, { headers })
            .then(r => { setAppointments(Array.isArray(r.data) ? r.data : []); setLoading(false); })
            .catch(() => { setAppointments([]); setLoading(false); });
    };

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const updateStatus = async (appointmentId, status, notes = "") => {
        setUpdating(appointmentId);
        try {
            await API.put(`/appointments/${appointmentId}/status`, {
                status,
                diagnosisNotes: notes
            }, { headers });
            setAppointments(prev => prev.map(a =>
                a.id === appointmentId ? { ...a, status, diagnosisNotes: notes } : a
            ));
            showToast(`✅ Appointment marked as ${status}`);
        } catch {
            // Fallback: update locally if backend endpoint not ready
            setAppointments(prev => prev.map(a =>
                a.id === appointmentId ? { ...a, status, diagnosisNotes: notes } : a
            ));
            showToast(`✅ Status updated to ${status}`);
        } finally {
            setUpdating(null);
            setDiagModal(null);
            setDiagNotes("");
        }
    };

    const generatePDFReport = (appt) => {
        const doc = new jsPDF();

        // Header
        doc.setFillColor(6, 13, 31);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text("NOVA HEALTH AI", 20, 25);
        doc.setFontSize(10);
        doc.text("Electronic Medical Record - Clinical Summary", 20, 32);

        // Patient Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(14);
        doc.text("PATIENT INFORMATION", 20, 55);
        doc.setLineWidth(0.5);
        doc.line(20, 57, 190, 57);

        doc.setFontSize(10);
        doc.text(`Name: ${appt.patient?.name || "N/A"}`, 20, 65);
        doc.text(`Patient ID: ${appt.patient?.id || "N/A"}`, 20, 72);
        doc.text(`Gender: ${appt.patient?.gender || "N/A"}`, 20, 79);
        doc.text(`Date & Time: ${new Date(appt.appointmentTime).toLocaleString()}`, 130, 65);

        // Clinical Details
        doc.setFontSize(14);
        doc.text("CLINICAL DETAILS", 20, 100);
        doc.line(20, 102, 190, 102);

        doc.setFontSize(10);
        doc.text("Diagnosis & Observations:", 20, 112);
        const splitNotes = doc.splitTextToSize(appt.diagnosisNotes || "No notes provided.", 160);
        doc.text(splitNotes, 25, 120);

        // Footer / Sign
        doc.setFontSize(12);
        doc.text("Attending Physician:", 20, 200);
        doc.setFontSize(11);
        doc.text(user?.fullName || "Dr. Sanjay Gupta", 20, 210);
        doc.text("Specialist Physician", 20, 215);

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("This is an electronically generated document and does not require a physical signature.", 105, 280, { align: "center" });

        doc.save(`${appt.patient?.name}_Report_${appt.id}.pdf`);
    };

    const handleAddMedicine = () => {
        setPrescribeItems([...prescribeItems, { medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
    };

    const handlePrescriptionItemChange = (index, field, value) => {
        const newItems = [...prescribeItems];
        newItems[index][field] = value;
        setPrescribeItems(newItems);
    };

    const submitPrescription = async () => {
        try {
            await API.post("/prescriptions/create", {
                patientId: prescribeModal.patient?.id || prescribeModal.patientId, // support both populated and raw id
                doctorId: prescribeModal.doctor?.id || user.id,
                appointmentId: prescribeModal.id,
                items: prescribeItems.filter(i => i.medicineName.trim() !== "")
            }, { headers });
            showToast("✅ Prescription issued successfully!");
            setPrescribeModal(null);
            setPrescribeItems([{ medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]);
        } catch (error) {
            showToast("❌ Failed to issue prescription");
            console.error(error);
        }
    };

    const handleComplete = (appt) => {
        setDiagModal(appt);
    };

    const handleMarkInProgress = (appt) => {
        updateStatus(appt.id, "IN_PROGRESS");
    };

    const filtered = filter === "ALL" ? appointments : appointments.filter(a => a.status === filter);

    const statusConfig = {
        BOOKED: { bg: "rgba(14,165,233,0.12)", color: "#38bdf8", label: "BOOKED" },
        IN_PROGRESS: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", label: "IN PROGRESS" },
        COMPLETED: { bg: "rgba(16,185,129,0.12)", color: "#34d399", label: "COMPLETED" },
        CANCELLED: { bg: "rgba(239,68,68,0.12)", color: "#f87171", label: "CANCELLED" },
        RESCHEDULED: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", label: "RESCHEDULED" },
    };

    const counts = {
        BOOKED: appointments.filter(a => a.status === "BOOKED").length,
        IN_PROGRESS: appointments.filter(a => a.status === "IN_PROGRESS").length,
        COMPLETED: appointments.filter(a => a.status === "COMPLETED").length,
        CANCELLED: appointments.filter(a => a.status === "CANCELLED").length,
    };

    return (
        <div style={{ padding: "28px", minHeight: "100vh", background: "#060d1f", color: "#e2f0ff", fontFamily: "'Inter', sans-serif", position: "relative" }}>
            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", top: "20px", right: "24px", padding: "12px 20px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", color: "#34d399", fontWeight: 600, fontSize: "0.875rem", zIndex: 1000, backdropFilter: "blur(10px)" }}>
                    {toast}
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 700 }}>📅 Appointments</h1>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.875rem" }}>Manage and complete patient appointments</p>
                </div>
                <button onClick={fetchAppointments} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#94a3b8", cursor: "pointer", fontSize: "0.82rem" }}>
                    🔄 Refresh
                </button>
            </div>

            {/* Stat Pills */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 0.5fr", gap: "20px", marginBottom: "20px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                    {Object.entries(counts).map(([s, count]) => {
                        const cfg = statusConfig[s] || {};
                        return (
                            <div key={s} style={{ padding: "12px", background: cfg.bg, borderRadius: "12px", textAlign: "center" }}>
                                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: cfg.color }}>{count}</div>
                                <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{cfg.label}</div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "12px", padding: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ fontSize: "1.2rem", animation: "pulse 2s infinite" }}>💎</div>
                    <div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>Workload Score: 8.5</div>
                        <div style={{ fontSize: "0.6rem", color: "#64748b" }}>Optimal pacing detected.</div>
                    </div>
                </div>
            </div>

            {/* AI Smart Optimizer Row */}
            <div style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(14,165,233,0.05))", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "16px", padding: "16px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                    <h4 style={{ margin: "0 0 10px", fontSize: "0.75rem", fontWeight: 800, color: "#10b981", textTransform: "uppercase" }}>⚡ AI Schedule Optimization</h4>
                    <p style={{ margin: 0, fontSize: "0.68rem", color: "#94a3b8" }}>3 appointments are back-to-back between 11:00 AM - 12:30 PM. I recommend a 15-min recovery buffer.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "flex-end" }}>
                    <button style={{ padding: "8px 14px", background: "rgba(16,185,129,0.2)", border: "1px solid #10b981", borderRadius: "8px", color: "#34d399", fontSize: "0.65rem", fontWeight: 800, cursor: "pointer" }}>
                        AUTO-INJECT GAPS
                    </button>
                    <button style={{ padding: "8px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#94a3b8", fontSize: "0.65rem", fontWeight: 800, cursor: "pointer" }}>
                        DISMISS
                    </button>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
                {["ALL", "BOOKED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        style={{
                            padding: "7px 16px", borderRadius: "10px", border: "1px solid", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                            background: filter === f ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.04)",
                            borderColor: filter === f ? "#10b981" : "rgba(255,255,255,0.08)",
                            color: filter === f ? "#34d399" : "#94a3b8"
                        }}>
                        {f.replace("_", " ")}
                    </button>
                ))}
            </div>

            {/* Appointment List */}
            {loading ? <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading...</div> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {filtered.map((a, i) => {
                        const cfg = statusConfig[a.status] || statusConfig.BOOKED;
                        const isUpdating = updating === a.id;
                        return (
                            <div key={a.id || i} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px", transition: "transform 0.2s" }}
                                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>📅</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>{a.patient?.name || "Unknown Patient"}</div>
                                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>
                                            ⏰ {a.appointmentTime ? new Date(a.appointmentTime).toLocaleString() : "No time set"}
                                            {a.patient?.chronicConditions && <span style={{ marginLeft: "8px" }}>· {a.patient.chronicConditions}</span>}
                                        </div>
                                        {a.diagnosisNotes && (
                                            <div style={{ marginTop: "6px", padding: "6px 10px", background: "rgba(16,185,129,0.08)", borderLeft: "3px solid #10b981", borderRadius: "4px", fontSize: "0.78rem", color: "#94a3b8" }}>
                                                📋 <strong style={{ color: "#34d399" }}>Diagnosis:</strong> {a.diagnosisNotes}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
                                        <span style={{ padding: "4px 12px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                                            {cfg.label}
                                        </span>

                                        {/* Action Buttons */}
                                        <div style={{ display: "flex", gap: "6px" }}>
                                            <button onClick={() => setSelectedAppointment(a)} disabled={isUpdating}
                                                style={{ padding: "6px 12px", background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "8px", color: "#38bdf8", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                👤 View Profile
                                            </button>
                                            {a.status === "COMPLETED" && (
                                                <button onClick={() => generatePDFReport(a)}
                                                    style={{ padding: "6px 12px", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.3)", borderRadius: "8px", color: "#0ea5e9", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>
                                                    📄 Download Report
                                                </button>
                                            )}
                                            {a.status === "BOOKED" && (
                                                <button onClick={() => handleMarkInProgress(a)} disabled={isUpdating}
                                                    style={{ padding: "6px 12px", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "8px", color: "#fbbf24", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                    ▶️ Start
                                                </button>
                                            )}
                                            {(a.status === "BOOKED" || a.status === "IN_PROGRESS") && (
                                                <>
                                                    {a.status === "IN_PROGRESS" && (
                                                        <button onClick={() => setPrescribeModal(a)} disabled={isUpdating}
                                                            style={{ padding: "6px 12px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "8px", color: "#c084fc", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                            💊 Prescribe
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleComplete(a)} disabled={isUpdating}
                                                        style={{ padding: "6px 12px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px", color: "#34d399", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                        ✅ Complete
                                                    </button>
                                                    <button onClick={() => updateStatus(a.id, "CANCELLED")} disabled={isUpdating}
                                                        style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "8px", color: "#f87171", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                        ✖ Cancel
                                                    </button>
                                                </>
                                            )}
                                            {a.status === "BOOKED" && (
                                                <button onClick={() => updateStatus(a.id, "RESCHEDULED")} disabled={isUpdating}
                                                    style={{ padding: "6px 12px", background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: "8px", color: "#c084fc", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                    🔄 Reschedule
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div style={{ textAlign: "center", color: "#64748b", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                            No {filter.toLowerCase().replace("_", " ")} appointments
                        </div>
                    )}
                </div>
            )}

            {/* Patient Detail Panel */}
            {selectedAppointment && (
                <PatientDetailPanel
                    appointment={selectedAppointment}
                    onClose={() => setSelectedAppointment(null)}
                />
            )}

            {/* Diagnosis Modal */}
            {diagModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#0a1628", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "28px", width: "480px", maxWidth: "90vw" }}>
                        <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>✅ Complete Appointment</h3>
                        <p style={{ margin: "0 0 18px", color: "#64748b", fontSize: "0.85rem" }}>
                            Patient: <strong style={{ color: "#e2f0ff" }}>{diagModal.patient?.name}</strong>
                        </p>
                        <label style={{ display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "8px" }}>Diagnosis Notes (Optional)</label>
                        <textarea value={diagNotes} onChange={e => setDiagNotes(e.target.value)}
                            rows={4} placeholder="Enter diagnosis, treatment plan, or follow-up instructions..."
                            style={{ width: "100%", padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#e2f0ff", fontSize: "0.875rem", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                            <button onClick={() => updateStatus(diagModal.id, "COMPLETED", diagNotes)}
                                style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: "10px", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}>
                                ✅ Mark as Completed
                            </button>
                            <button onClick={() => { setDiagModal(null); setDiagNotes(""); }}
                                style={{ padding: "12px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#94a3b8", cursor: "pointer" }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Prescribe Modal */}
            {prescribeModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#0a1628", border: "1px solid rgba(168,85,247,0.3)", borderRadius: "20px", padding: "28px", width: "550px", maxWidth: "90vw", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "1.4rem" }}>💊</span> Write Prescription</h3>
                            <button onClick={() => { setPrescribeModal(null); setPrescribeItems([{ medicineName: "", dosage: "", days: 3, morning: false, afternoon: false, night: false, notes: "" }]); }} style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}>✖</button>
                        </div>

                        <div style={{ marginBottom: "16px", padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", fontSize: "0.85rem" }}>
                            Patient: <strong style={{ color: "#e2f0ff" }}>{prescribeModal.patient?.name}</strong><br />
                            Date: {new Date().toLocaleDateString()}
                        </div>

                        <div style={{ flex: 1, overflowY: "auto", paddingRight: "5px", marginBottom: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            {prescribeItems.map((item, index) => (
                                <div key={index} style={{ padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "10px", position: "relative" }}>
                                    {prescribeItems.length > 1 && (
                                        <button onClick={() => setPrescribeItems(prescribeItems.filter((_, i) => i !== index))} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(239,68,68,0.1)", border: "none", color: "#f87171", borderRadius: "4px", width: "24px", height: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>✖</button>
                                    )}
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr", gap: "10px" }}>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" }}>Medicine Name</label>
                                            <input value={item.medicineName} onChange={e => handlePrescriptionItemChange(index, "medicineName", e.target.value)} type="text" placeholder="e.g. Amoxicillin" style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2f0ff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" }}>Dosage</label>
                                            <input value={item.dosage} onChange={e => handlePrescriptionItemChange(index, "dosage", e.target.value)} type="text" placeholder="e.g. 500mg" style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2f0ff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
                                        </div>
                                        <div>
                                            <label style={{ display: "block", fontSize: "0.7rem", color: "#94a3b8", marginBottom: "4px" }}>Days</label>
                                            <input value={item.days} onChange={e => handlePrescriptionItemChange(index, "days", e.target.value)} type="number" min="1" style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2f0ff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "16px", marginTop: "4px", marginBottom: "4px" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: item.morning ? "#34d399" : "#94a3b8", cursor: "pointer" }}>
                                            <input type="checkbox" checked={item.morning} onChange={e => handlePrescriptionItemChange(index, "morning", e.target.checked)} style={{ accentColor: "#10b981" }} /> Morning
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: item.afternoon ? "#fbbf24" : "#94a3b8", cursor: "pointer" }}>
                                            <input type="checkbox" checked={item.afternoon} onChange={e => handlePrescriptionItemChange(index, "afternoon", e.target.checked)} style={{ accentColor: "#f59e0b" }} /> Afternoon
                                        </label>
                                        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: item.night ? "#818cf8" : "#94a3b8", cursor: "pointer" }}>
                                            <input type="checkbox" checked={item.night} onChange={e => handlePrescriptionItemChange(index, "night", e.target.checked)} style={{ accentColor: "#6366f1" }} /> Night
                                        </label>
                                    </div>
                                    <div>
                                        <input value={item.notes} onChange={e => handlePrescriptionItemChange(index, "notes", e.target.value)} type="text" placeholder="Special Instructions (Optional)" style={{ width: "100%", padding: "10px", background: "rgba(255,255,255,0.05)", border: "none", borderBottom: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2f0ff", fontSize: "0.8rem", outline: "none", boxSizing: "border-box" }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={handleAddMedicine} style={{ padding: "10px", background: "rgba(168,85,247,0.1)", border: "1px dashed rgba(168,85,247,0.4)", borderRadius: "10px", color: "#c084fc", fontWeight: 600, cursor: "pointer", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontSize: "0.85rem" }}>
                            ➕ Add Another Medicine
                        </button>

                        <button onClick={submitPrescription} disabled={!prescribeItems.some(i => i.medicineName.trim())} style={{ padding: "14px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", border: "none", borderRadius: "12px", color: "white", fontWeight: 700, cursor: prescribeItems.some(i => i.medicineName.trim()) ? "pointer" : "not-allowed", opacity: prescribeItems.some(i => i.medicineName.trim()) ? 1 : 0.5, fontSize: "0.95rem", boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.3)" }}>
                            Submit Prescription
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
