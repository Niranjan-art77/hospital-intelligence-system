import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function PrescriptionManager() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [form, setForm] = useState({ patientId: "", appointmentId: "" });
    const [medicines, setMedicines] = useState([{ medicineName: "", dosage: "", days: "", notes: "" }]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [pRes, aRes] = await Promise.all([
                API.get("/patients"),
                API.get("/appointments")
            ]);
            setPatients(Array.isArray(pRes.data) ? pRes.data : []);
            setAppointments(Array.isArray(aRes.data) ? aRes.data : []);
        } catch (e) {
            console.error("Failed to fetch initial data", e);
        }
    };

    const addMedicineField = () => {
        setMedicines([...medicines, { medicineName: "", dosage: "", days: "", notes: "" }]);
    };

    const removeMedicineField = (index) => {
        const newMeds = [...medicines];
        newMeds.splice(index, 1);
        setMedicines(newMeds);
    };

    const handleMedicineChange = (index, field, value) => {
        const newMeds = [...medicines];
        newMeds[index][field] = value;
        setMedicines(newMeds);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!form.patientId || !form.appointmentId) {
            setError("Patient and Appointment are required.");
            return;
        }

        const validMeds = medicines.filter(m => m.medicineName && m.dosage && m.days);
        if (validMeds.length === 0) {
            setError("At least one completely filled medicine is required.");
            return;
        }

        try {
            const payload = {
                patientId: form.patientId,
                doctorId: user?.id || 1, // Fallback if doctor ID is not numeric
                appointmentId: form.appointmentId,
                items: validMeds
            };

            await API.post("/prescriptions/create", payload);

            setSuccess("Prescription added successfully and sent to Pharmacy!");
            setForm({ patientId: "", appointmentId: "" });
            setMedicines([{ medicineName: "", dosage: "", days: "", notes: "" }]);
            setTimeout(() => setSuccess(""), 4000);
        } catch (err) {
            setError("Failed to create prescription.");
        }
    };

    const inputStyle = { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#e2f0ff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "0.78rem", color: "#94a3b8", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" };

    return (
        <div style={{ padding: "28px", minHeight: "100vh", background: "#060d1f", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ margin: "0 0 4px", fontSize: "1.5rem", fontWeight: 700 }}>📋 Prescription Manager</h1>
            <p style={{ margin: "0 0 28px", color: "#64748b", fontSize: "0.875rem" }}>Create and manage patient prescriptions dynamically</p>

            <div style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "24px", maxWidth: "800px" }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 600 }}>➕ New Prescription Form</h3>
                {success && <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: "8px", color: "#34d399", fontSize: "0.85rem", marginBottom: "16px" }}>{success}</div>}
                {error && <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "8px", color: "#f87171", fontSize: "0.85rem", marginBottom: "16px" }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={labelStyle}>Select Patient</label>
                            <select value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })} style={inputStyle}>
                                <option value="">-- Select Patient --</option>
                                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Select Appointment</label>
                            <select value={form.appointmentId} onChange={e => setForm({ ...form, appointmentId: e.target.value })} style={inputStyle}>
                                <option value="">-- Select Appointment --</option>
                                {appointments.map(a => <option key={a.id} value={a.id}>{a.id} - {new Date(a.appointmentTime).toLocaleDateString()}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: "#94a3b8" }}>Medicines List</h4>
                            <button type="button" onClick={addMedicineField} style={{ padding: "6px 12px", background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer", fontWeight: "bold" }}>+ Add Medicine</button>
                        </div>

                        {medicines.map((med, index) => (
                            <div key={index} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 2fr auto", gap: "10px", alignItems: "start", marginBottom: "10px", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "10px" }}>
                                <div>
                                    <label style={labelStyle}>Medicine Name</label>
                                    <input type="text" placeholder="E.g. Amoxicillin" value={med.medicineName} onChange={e => handleMedicineChange(index, "medicineName", e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Dosage</label>
                                    <input type="text" placeholder="E.g. 500mg" value={med.dosage} onChange={e => handleMedicineChange(index, "dosage", e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Days</label>
                                    <input type="number" placeholder="E.g. 7" value={med.days} onChange={e => handleMedicineChange(index, "days", e.target.value)} style={inputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Notes</label>
                                    <input type="text" placeholder="E.g. After meals" value={med.notes} onChange={e => handleMedicineChange(index, "notes", e.target.value)} style={inputStyle} />
                                </div>
                                <div style={{ paddingTop: "24px" }}>
                                    {medicines.length > 1 && (
                                        <button type="button" onClick={() => removeMedicineField(index)} style={{ padding: "8px", background: "rgba(239,68,68,0.2)", color: "#f87171", border: "none", borderRadius: "6px", cursor: "pointer" }}>✕</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="submit" style={{ padding: "14px", background: "linear-gradient(135deg, #10b981, #059669)", border: "none", borderRadius: "10px", color: "white", fontSize: "1rem", fontWeight: 600, cursor: "pointer", marginTop: "10px" }}>
                        Generate Prescription & Notify Pharmacy
                    </button>
                </form>
            </div>
        </div>
    );
}
