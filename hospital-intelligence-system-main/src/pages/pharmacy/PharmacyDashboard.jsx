import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function PharmacyDashboard() {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMsg, setActionMsg] = useState("");

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await API.get("/pharmacy/prescriptions");
            setPrescriptions(res.data);
        } catch (error) {
            console.error("Failed to load pharmacy queue", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id) => {
        try {
            await API.post("/pharmacy/verify", { prescriptionId: id });
            setActionMsg("Prescription verified successfully! Ready for billing.");
            fetchPending();
            setTimeout(() => setActionMsg(""), 3000);
        } catch (error) {
            setActionMsg("Verification failed.");
            setTimeout(() => setActionMsg(""), 3000);
        }
    };

    return (
        <div style={{ padding: "30px", background: "#060d1f", minHeight: "100vh", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0", fontWeight: "800", background: "linear-gradient(90deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Pharmacy Verification
                    </h1>
                    <p style={{ color: "#94a3b8", margin: 0 }}>Review pending prescriptions and verify medicine stock.</p>
                </div>
                <div style={{ background: "rgba(56, 189, 248, 0.1)", padding: "10px 20px", borderRadius: "20px", border: "1px solid rgba(56,189,248,0.2)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }}></div>
                    <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#38bdf8" }}>{prescriptions.length} Pending Actions</span>
                </div>
            </div>

            {actionMsg && (
                <div style={{ marginBottom: "20px", padding: "15px", background: "rgba(52, 211, 153, 0.1)", border: "1px solid rgba(52, 211, 153, 0.3)", borderRadius: "10px", color: "#34d399", fontWeight: "600" }}>
                    {actionMsg}
                </div>
            )}

            {loading ? (
                <p>Loading pharmacy queue...</p>
            ) : prescriptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>⚕️</div>
                    <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Queue is Empty</h3>
                    <p style={{ color: "#64748b", margin: 0 }}>There are no new prescriptions to verify.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {prescriptions.map((p) => (
                        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(145deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "24px", transition: "all 0.3s ease" }}>

                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
                                    <div style={{ background: "rgba(56,189,248,0.1)", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>📄</div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "700" }}>Prescription ID: #{p.id}</h3>
                                        <p style={{ margin: "4px 0 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Date: {new Date(p.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                                    {p.items?.map((item, idx) => (
                                        <div key={idx} style={{ background: "rgba(0,0,0,0.2)", padding: "10px 16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.04)" }}>
                                            <div style={{ fontSize: "1rem", fontWeight: "600", color: "#e2f0ff" }}>{item.medicineName}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>{item.dosage} • {item.days} days</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px", marginLeft: "30px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "0.8rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600" }}>Status</span>
                                    <span style={{ background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700" }}>PENDING</span>
                                </div>
                                <button
                                    onClick={() => handleVerify(p.id)}
                                    style={{
                                        background: "linear-gradient(135deg, #10b981, #059669)",
                                        color: "white", padding: "12px 24px", border: "none", borderRadius: "10px",
                                        fontSize: "0.95rem", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 15px rgba(16,185,129,0.3)"
                                    }}
                                >
                                    Verify Stock & Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
