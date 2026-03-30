import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function DoctorPatients() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/patients", {
            headers: { Authorization: `Bearer ${user?.token}` }
        }).then(r => { setPatients(Array.isArray(r.data) ? r.data : []); setLoading(false); })
            .catch(() => { setPatients([]); setLoading(false); });
    }, [user]);

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.chronicConditions?.toLowerCase().includes(search.toLowerCase())
    );

    const riskColor = { HIGH: "#ef4444", MEDIUM: "#eab308", LOW: "#10b981" };

    return (
        <div style={{ padding: "28px", minHeight: "100vh", background: "#060d1f", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>👥 My Patients</h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.875rem" }}>{patients.length} patients under your care</p>
                </div>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search patients..."
                    style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "#e2f0ff", fontSize: "0.875rem", outline: "none", width: "240px" }} />
            </div>

            {loading ? <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading patients...</div> : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                    {filtered.map((p, i) => (
                        <div key={p.id || i} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", transition: "transform 0.2s" }}
                            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                            onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", color: "white" }}>
                                        {p.name?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "1rem" }}>{p.name}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Age {p.age} · Blood {p.bloodGroup}</div>
                                    </div>
                                </div>
                                <span style={{ padding: "4px 10px", background: `${riskColor[p.riskLevel] || "#10b981"}22`, color: riskColor[p.riskLevel] || "#10b981", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700 }}>
                                    {p.riskLevel || "LOW"}
                                </span>
                            </div>
                            {p.criticalAlert && (
                                <div style={{ color: "#f87171", fontSize: "0.8rem", marginBottom: "10px", padding: "6px 10px", background: "rgba(239,68,68,0.08)", borderRadius: "8px" }}>
                                    ⚠️ Critical Alert Active
                                </div>
                            )}
                            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                                <div><span style={{ color: "#64748b" }}>Condition: </span>{p.chronicConditions || "None reported"}</div>
                                <div style={{ marginTop: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                    <div style={{ width: `${p.recoveryProgress || 50}%`, height: "100%", background: "linear-gradient(90deg, #10b981, #059669)", borderRadius: "4px" }} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", color: "#64748b", padding: "40px" }}>No patients found</div>}
                </div>
            )}
        </div>
    );
}
