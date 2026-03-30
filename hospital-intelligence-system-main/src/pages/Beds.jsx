import { useState, useRef, useEffect } from "react";
import API from "../services/api";

// ✅ Generated ONCE — never re-randomized
const DEFAULT_BEDS = [
    { id: 1, bedNumber: "ICU-01", type: "ICU", status: "OCCUPIED", wardName: "ICU Ward" },
    { id: 2, bedNumber: "ICU-02", type: "ICU", status: "AVAILABLE", wardName: "ICU Ward" },
    { id: 3, bedNumber: "ICU-03", type: "ICU", status: "AVAILABLE", wardName: "ICU Ward" },
    { id: 4, bedNumber: "ICU-04", type: "ICU", status: "OCCUPIED", wardName: "ICU Ward" },
    { id: 5, bedNumber: "EMG-01", type: "EMERGENCY", status: "AVAILABLE", wardName: "Emergency Ward" },
    { id: 6, bedNumber: "EMG-02", type: "EMERGENCY", status: "OCCUPIED", wardName: "Emergency Ward" },
    { id: 7, bedNumber: "EMG-03", type: "EMERGENCY", status: "AVAILABLE", wardName: "Emergency Ward" },
    { id: 8, bedNumber: "A-01", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 9, bedNumber: "A-02", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 10, bedNumber: "A-03", type: "GENERAL", status: "OCCUPIED", wardName: "Ward A" },
    { id: 11, bedNumber: "A-04", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 12, bedNumber: "A-05", type: "GENERAL", status: "MAINTENANCE", wardName: "Ward A" },
    { id: 13, bedNumber: "B-01", type: "GENERAL", status: "AVAILABLE", wardName: "Ward B" },
    { id: 14, bedNumber: "B-02", type: "GENERAL", status: "AVAILABLE", wardName: "Ward B" },
    { id: 15, bedNumber: "B-03", type: "GENERAL", status: "OCCUPIED", wardName: "Ward B" },
    { id: 16, bedNumber: "B-04", type: "GENERAL", status: "AVAILABLE", wardName: "Ward B" },
    { id: 17, bedNumber: "C-01", type: "GENERAL", status: "AVAILABLE", wardName: "Ward C" },
    { id: 18, bedNumber: "C-02", type: "GENERAL", status: "OCCUPIED", wardName: "Ward C" },
];

const SAMPLE_PATIENTS = [
    { id: "p1", name: "Ravi Kumar", chronicConditions: "Severe Chest Pain" },
    { id: "p2", name: "Priya Sharma", chronicConditions: "Cardiac Arrest" },
    { id: "p3", name: "Suresh Rao", chronicConditions: "Stroke" },
    { id: "p4", name: "Anita Devi", chronicConditions: "Road Accident" },
    { id: "p5", name: "Mohammed Ali", chronicConditions: "Respiratory Failure" },
];

const STATUS_COLOR = {
    AVAILABLE: { border: "#10b981", bg: "#10b98118", text: "#10b981", emoji: "✅" },
    OCCUPIED: { border: "#f43f5e", bg: "#f43f5e18", text: "#f43f5e", emoji: "🔴" },
    MAINTENANCE: { border: "#f59e0b", bg: "#f59e0b18", text: "#f59e0b", emoji: "🔧" },
};

const TYPE_EMOJI = { ICU: "🏥", EMERGENCY: "🚨", GENERAL: "🛏️" };

export default function Beds() {
    const [beds, setBeds] = useState(DEFAULT_BEDS);
    const [patients, setPatients] = useState(SAMPLE_PATIENTS);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [allocResult, setAllocResult] = useState(null);
    const [allocating, setAllocating] = useState(false);
    const [filterType, setFilterType] = useState("ALL");

    // Load real data from backend once (no polling to avoid freeze)
    useEffect(() => {
        API.get("/api/beds")
            .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setBeds(r.data); })
            .catch(() => {/* keep defaults */ });

        API.get("/patients")
            .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setPatients(r.data); })
            .catch(() => {/* keep sample patients */ });
    }, []);

    const allocateBed = () => {
        if (!selectedPatient || allocating) return;
        setAllocating(true);

        const patient = patients.find(p => String(p.id) === String(selectedPatient));

        // Priority: ICU available → EMERGENCY available → GENERAL available
        const priority = ["ICU", "EMERGENCY", "GENERAL"];
        let assigned = null;
        for (const type of priority) {
            assigned = beds.find(b => b.status === "AVAILABLE" && b.type === type);
            if (assigned) break;
        }
        // Fallback: any available bed
        if (!assigned) assigned = beds.find(b => b.status === "AVAILABLE");

        if (!assigned) {
            setAllocResult({ success: false, msg: "⚠️ No available beds. All beds are occupied." });
            setAllocating(false);
            return;
        }

        // Instantly update UI (no API wait that could freeze)
        setBeds(prev => prev.map(b => b.id === assigned.id ? { ...b, status: "OCCUPIED" } : b));
        setAllocResult({
            success: true,
            bedNumber: assigned.bedNumber,
            type: assigned.type,
            ward: assigned.wardName,
            patientName: patient?.name || "Patient",
        });
        setSelectedPatient("");
        setAllocating(false);

        // Fire API update in background (don't await)
        API.put(`/api/beds/${assigned.id}/status?status=OCCUPIED`).catch(() => { });

        setTimeout(() => setAllocResult(null), 7000);
    };

    const total = beds.length;
    const available = beds.filter(b => b.status === "AVAILABLE").length;
    const occupied = beds.filter(b => b.status === "OCCUPIED").length;
    const icu = beds.filter(b => b.type === "ICU").length;
    const emergency = beds.filter(b => b.type === "EMERGENCY").length;

    const displayed = filterType === "ALL" ? beds
        : filterType === "AVAILABLE" || filterType === "OCCUPIED" || filterType === "MAINTENANCE"
            ? beds.filter(b => b.status === filterType)
            : beds.filter(b => b.type === filterType);

    const s = { fontFamily: "'Inter', sans-serif", color: "#e2f0ff", background: "#060d1f", minHeight: "100vh", padding: "28px" };

    return (
        <div style={s}>
            {/* Header */}
            <h1 style={{ margin: "0 0 4px", fontSize: "1.8rem", fontWeight: 800, background: "linear-gradient(135deg,#8b5cf6,#0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                🛏️ Facility & Bed Management
            </h1>
            <p style={{ margin: "0 0 24px", color: "#64748b" }}>Smart Bed Allocation & Emergency Response Center</p>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "12px", marginBottom: "20px" }}>
                {[
                    { label: "Total Beds", val: total, color: "#0ea5e9", icon: "🛏️" },
                    { label: "Available", val: available, color: "#10b981", icon: "✅" },
                    { label: "Occupied", val: occupied, color: "#f43f5e", icon: "🔴" },
                    { label: "ICU Beds", val: icu, color: "#a855f7", icon: "🏥" },
                    { label: "Emergency", val: emergency, color: "#f59e0b", icon: "🚨" },
                ].map(s => (
                    <div key={s.label} style={{ background: `${s.color}10`, border: `1px solid ${s.color}33`, borderRadius: "14px", padding: "16px", textAlign: "center" }}>
                        <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: s.color }}>{s.val}</div>
                        <div style={{ fontSize: "0.72rem", color: "#64748b" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Emergency Allocation */}
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
                <h3 style={{ margin: "0 0 8px", color: "#f87171", fontWeight: 700 }}>🚨 Emergency Auto Bed Allocation</h3>
                <p style={{ margin: "0 0 14px", color: "#94a3b8", fontSize: "0.83rem" }}>
                    Select a patient — system auto-assigns best available bed (ICU → Emergency → General priority).
                </p>

                {allocResult && (
                    <div style={{ padding: "12px 16px", background: allocResult.success ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${allocResult.success ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "10px", marginBottom: "12px" }}>
                        {allocResult.success ? (
                            <div>
                                <strong style={{ color: "#34d399" }}>✅ Bed Allocated!</strong>
                                <div style={{ color: "#94a3b8", fontSize: "0.83rem", marginTop: "4px" }}>
                                    <strong style={{ color: "#e2f0ff" }}>{allocResult.patientName}</strong> → Bed <strong style={{ color: "#34d399" }}>{allocResult.bedNumber}</strong> ({allocResult.type}) · {allocResult.ward}
                                </div>
                            </div>
                        ) : (
                            <span style={{ color: "#f87171" }}>{allocResult.msg}</span>
                        )}
                    </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                    <select
                        value={selectedPatient}
                        onChange={e => setSelectedPatient(e.target.value)}
                        style={{ flex: 1, padding: "11px 14px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", color: selectedPatient ? "#e2f0ff" : "#64748b", fontSize: "0.875rem", outline: "none", cursor: "pointer" }}
                    >
                        <option value="">-- Select Emergency Patient --</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>
                                🚨 {p.name}{p.chronicConditions ? ` · ${p.chronicConditions}` : ""}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={allocateBed}
                        disabled={!selectedPatient || allocating}
                        style={{ padding: "11px 24px", background: (!selectedPatient || allocating) ? "rgba(239,68,68,0.2)" : "linear-gradient(135deg,#ef4444,#f43f5e)", border: "none", borderRadius: "10px", color: "white", fontWeight: 700, fontSize: "0.875rem", cursor: (!selectedPatient || allocating) ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}
                    >
                        {allocating ? "Allocating..." : "🚨 Auto-Allocate Bed"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "18px" }}>
                {/* Bed Grid */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h3 style={{ margin: 0, fontWeight: 700 }}>Ward Layout & Occupancy</h3>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {["ALL", "AVAILABLE", "OCCUPIED", "ICU", "EMERGENCY"].map(f => (
                                <button key={f} onClick={() => setFilterType(f)}
                                    style={{
                                        padding: "5px 12px", borderRadius: "8px", border: "1px solid", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                                        background: filterType === f ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.04)",
                                        borderColor: filterType === f ? "#0ea5e9" : "rgba(255,255,255,0.08)",
                                        color: filterType === f ? "#38bdf8" : "#94a3b8"
                                    }}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(108px, 1fr))", gap: "10px" }}>
                        {displayed.map(bed => {
                            const c = STATUS_COLOR[bed.status] || STATUS_COLOR.AVAILABLE;
                            return (
                                <div key={bed.id}
                                    style={{ border: `1px solid ${c.border}55`, background: c.bg, borderRadius: "12px", padding: "12px 8px", textAlign: "center" }}>
                                    <div style={{ fontSize: "1.1rem", marginBottom: "4px" }}>{TYPE_EMOJI[bed.type] || "🛏️"}</div>
                                    <div style={{ fontSize: "0.72rem", fontWeight: 800, color: c.text, letterSpacing: "0.5px" }}>{bed.bedNumber}</div>
                                    <div style={{ fontSize: "0.62rem", color: c.text, textTransform: "uppercase", marginTop: "2px" }}>{c.emoji} {bed.status}</div>
                                    <div style={{ fontSize: "0.58rem", color: "#475569", marginTop: "2px" }}>{bed.type}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "16px", padding: "18px" }}>
                    <h3 style={{ margin: "0 0 14px", color: "#f87171", fontSize: "0.9rem", fontWeight: 700 }}>🚨 Critical Alerts</h3>
                    <div style={{ textAlign: "center", padding: "24px 10px", color: "#64748b" }}>
                        <div style={{ fontSize: "2rem" }}>✅</div>
                        <div style={{ fontSize: "0.8rem", marginTop: "6px" }}>No Active Emergencies</div>
                        <div style={{ fontSize: "0.72rem", marginTop: "2px", color: "#475569" }}>All environments optimal</div>
                    </div>

                    <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Legend</div>
                        {[
                            { color: "#10b981", label: "Available" },
                            { color: "#f43f5e", label: "Occupied" },
                            { color: "#f59e0b", label: "Maintenance" },
                        ].map(l => (
                            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color }} />
                                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{l.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bed Type Legend */}
                    <div style={{ marginTop: "16px" }}>
                        <div style={{ fontSize: "0.72rem", color: "#64748b", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Bed Types</div>
                        {[
                            { icon: "🏥", label: "ICU" },
                            { icon: "🚨", label: "Emergency" },
                            { icon: "🛏️", label: "General Ward" },
                        ].map(l => (
                            <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                                <span style={{ fontSize: "0.9rem" }}>{l.icon}</span>
                                <span style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
