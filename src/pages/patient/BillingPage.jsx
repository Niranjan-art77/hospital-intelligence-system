import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function BillingPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchApprovedPrescriptions();
    }, [user]);

    const fetchApprovedPrescriptions = async () => {
        try {
            // Reusing the get by patient API, then filtering APPROVED
            const res = await API.get(`/prescriptions/${user?.id || 1}`);
            const data = Array.isArray(res.data) ? res.data : [];
            setPrescriptions(data.filter(p => p.status === "APPROVED"));
        } catch (error) {
            console.error("Failed to load billing", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (prescription) => {
        try {
            const totalItems = prescription.items?.length || 1;
            const amount = totalItems * 25.0; // Simulated flat rate price for now

            const payload = {
                prescriptionId: prescription.id,
                amount: amount,
                paymentMethod: "Card" // Simulated method
            };

            await API.post("/payments/create", payload);
            setMessage(`Payment of $${amount} successful! Medicines issued.`);
            fetchApprovedPrescriptions();
            setTimeout(() => setMessage(""), 4000);
        } catch (error) {
            setMessage("Payment processing failed.");
            setTimeout(() => setMessage(""), 4000);
        }
    };

    const downloadInvoicePDF = (p, amount) => {
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(16, 185, 129);
        doc.text("NOVA HEALTH AI", 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.text("Official Invoice & Billing Statement", 14, 30);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Patient Name: ${user.fullName}`, 14, 45);
        doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 52);
        doc.text(`Prescription Ref: #${p.id}`, 14, 59);

        const tableColumn = ["Description", "Quantity", "Rate", "Total"];
        const tableRows = [];

        // Add medicines
        p.items?.forEach(req => {
            tableRows.push([`Medicine: ${req.medicineName} (${req.dosage})`, req.days.toString(), "$25.00", `$${(25.0 * 1).toFixed(2)}`]);
        });

        // Add consultation
        tableRows.push(["Consultation Fee", "1", "$50.00", "$50.00"]);

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 70,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });

        const finalY = doc.lastAutoTable.finalY || 70;
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text(`Total Amount Due: $${(amount + 50).toFixed(2)}`, 14, finalY + 15);

        doc.save(`Nova_Invoice_${p.id}.pdf`);
    };

    return (
        <div style={{ padding: "30px", background: "#060d1f", minHeight: "100vh", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ marginBottom: "30px" }}>
                <h1 style={{ fontSize: "2rem", margin: "0 0 8px 0", fontWeight: "800", background: "linear-gradient(90deg, #10b981, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Patient Billing & Payments
                </h1>
                <p style={{ color: "#94a3b8", margin: 0 }}>Pay for your verified prescriptions to issue medicines.</p>
            </div>

            {message && (
                <div style={{ marginBottom: "20px", padding: "15px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "10px", color: "#10b981", fontWeight: "600" }}>
                    {message}
                </div>
            )}

            {loading ? (
                <p>Loading invoices...</p>
            ) : prescriptions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px", background: "rgba(255,255,255,0.02)", borderRadius: "16px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "15px" }}>💳</div>
                    <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>No Pending Bills</h3>
                    <p style={{ color: "#64748b", margin: 0 }}>You have no verified prescriptions awaiting payment.</p>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {prescriptions.map((p) => {
                        const amount = (p.items?.length || 1) * 25.0; // Simulated price

                        return (
                            <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "stretch", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", overflow: "hidden" }}>

                                <div style={{ padding: "24px", flex: 1 }}>
                                    <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "700" }}>Invoice for Prescription #{p.id}</h3>

                                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                        <thead>
                                            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", textAlign: "left" }}>
                                                <th style={{ paddingBottom: "10px" }}>Medicine</th>
                                                <th style={{ paddingBottom: "10px" }}>Dosage</th>
                                                <th style={{ paddingBottom: "10px" }}>Days</th>
                                                <th style={{ paddingBottom: "10px", textAlign: "right" }}>Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {p.items?.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                                    <td style={{ padding: "12px 0", fontWeight: "600", color: "#38bdf8" }}>{item.medicineName}</td>
                                                    <td style={{ padding: "12px 0", color: "#cbd5e1" }}>{item.dosage}</td>
                                                    <td style={{ padding: "12px 0", color: "#cbd5e1" }}>{item.days}</td>
                                                    <td style={{ padding: "12px 0", textAlign: "right", color: "#e2f0ff" }}>$25.00</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ background: "rgba(0,0,0,0.2)", padding: "24px", width: "250px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                                    <span style={{ fontSize: "0.85rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Total Amount</span>
                                    <span style={{ fontSize: "2.5rem", fontWeight: "800", color: "#10b981", marginBottom: "20px" }}>${amount.toFixed(2)}</span>

                                    <button
                                        onClick={() => downloadInvoicePDF(p, amount)}
                                        style={{ width: "100%", background: "transparent", color: "#10b981", border: "1px solid #10b981", padding: "12px", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", transition: "transform 0.2s", marginBottom: "10px" }}
                                    >
                                        📄 Download PDF Invoice
                                    </button>
                                    <button
                                        onClick={() => handlePayment(p)}
                                        style={{ width: "100%", background: "#10b981", color: "white", padding: "12px", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", transition: "transform 0.2s", boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)" }}
                                        onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                                        onMouseLeave={(e) => e.target.style.transform = "none"}
                                    >
                                        💳 Pay & Issue Medicine
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
