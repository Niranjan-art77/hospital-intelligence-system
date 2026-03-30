import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function DoctorMessages() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const scrollRef = useRef(null);

    useEffect(() => {
        // Load patients (We can load all users with role PATIENT)
        API.get("/patients").then(res => setPatients(res.data)).catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedPatient || !user?.id) return;
        const fetchMsgs = () => {
            API.get(`/chat/history?user1=${user.id}&user2=${selectedPatient.id}`)
                .then(res => setMessages(res.data))
                .catch(console.error);
        };
        fetchMsgs();
        const intv = setInterval(fetchMsgs, 3000);
        return () => clearInterval(intv);
    }, [selectedPatient, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedPatient) return;
        const msg = { senderId: user.id, receiverId: selectedPatient.id, senderRole: "DOCTOR", message: input };
        try {
            await API.post("/chat/send", msg);
            setMessages(prev => [...prev, { ...msg, timestamp: new Date().toISOString() }]);
            setInput("");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ display: "flex", height: "calc(100vh - 60px)", background: "#060d1f", color: "#e2f0ff", fontFamily: "'Inter', sans-serif" }}>
            <div style={{ width: "300px", borderRight: "1px solid rgba(255,255,255,0.05)", padding: "20px", display: "flex", flexDirection: "column" }}>
                <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", color: "#a855f7" }}>Your Patients</h2>
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {patients.map(p => (
                        <div key={p.id} onClick={() => setSelectedPatient(p)} style={{ padding: "15px", borderRadius: "12px", background: selectedPatient?.id === p.id ? "rgba(168,85,247,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${selectedPatient?.id === p.id ? "rgba(168,85,247,0.3)" : "rgba(255,255,255,0.05)"}`, cursor: "pointer", transition: "0.2s" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                                    {p.fullName?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", fontSize: "0.9rem" }}>{p.fullName}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>ID: PID-{p.id.toString().padStart(6, '0')}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {selectedPatient ? (
                    <>
                        <div style={{ padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: "15px", background: "rgba(0,0,0,0.2)" }}>
                            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "700" }}>
                                {selectedPatient.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{selectedPatient.fullName}</h3>
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: "center", color: "#64748b", margin: "auto" }}>Respond to {selectedPatient.fullName} to start the consultation.</div>
                            ) : messages.map((m, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: m.senderId === user.id ? "flex-end" : "flex-start" }}>
                                    <div style={{ maxWidth: "70%", padding: "12px 16px", borderRadius: "16px", borderBottomRightRadius: m.senderId === user.id ? "0" : "16px", borderBottomLeftRadius: m.senderId === user.id ? "16px" : "0", background: m.senderId === user.id ? "linear-gradient(135deg, #a855f7, #7c3aed)" : "rgba(255,255,255,0.05)", color: "white", fontSize: "0.95rem" }}>
                                        {m.message}
                                        <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", textAlign: "right", marginTop: "5px" }}>
                                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        <div style={{ padding: "20px", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                            <form onSubmit={sendMessage} style={{ display: "flex", gap: "10px" }}>
                                <input
                                    type="text" value={input} onChange={e => setInput(e.target.value)}
                                    placeholder="Type your medical advice..."
                                    style={{ flex: 1, padding: "15px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "white", fontSize: "1rem", outline: "none" }}
                                />
                                <button type="submit" style={{ padding: "0 25px", background: "#a855f7", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>Send</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexDirection: "column" }}>
                        <div style={{ fontSize: "4rem", marginBottom: "15px" }}>💬</div>
                        <h2 style={{ margin: 0, fontWeight: "500", color: "#cbd5e1" }}>Select a patient to view messages</h2>
                    </div>
                )}
            </div>
        </div>
    );
}
