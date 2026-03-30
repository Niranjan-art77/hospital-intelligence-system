import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import MedicalChatbot from "../components/MedicalChatbot";
import "./PatientLayout.css";

const navItems = [
    { to: "/patient", icon: "🏠", label: "My Dashboard", end: true },
    { to: "/patient/directory", icon: "👨‍⚕️", label: "Find a Doctor" },
    { to: "/patient/appointments", icon: "📅", label: "Appointments" },
    { to: "/patient/prescriptions", icon: "💊", label: "Prescriptions" },
    { to: "/patient/health", icon: "📊", label: "Health Monitor" },
    { to: "/patient/reports", icon: "📄", label: "Medical Reports" },
    { to: "/patient/health-card", icon: "🎫", label: "Health Card" },
    { to: "/patient/messages", icon: "💬", label: "Messaging" },
    { to: "/patient/recommendations", icon: "🩺", label: "Doctor Match" },
    { to: "/patient/history", icon: "📜", label: "History Timeline" },
    { to: "/patient/recovery", icon: "🧗", label: "Recovery Roadmap" },
    { to: "/patient/billing", icon: "💳", label: "Billing & Invoices" },
    { to: "/patient/symptom-checker", icon: "🤖", label: "Symptom AI" },
    { to: "/patient/emergency", icon: "🚨", label: "SOS Emergency", special: true },
];

export default function PatientLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    return (
        <div className="patient-layout">
            <aside className="patient-sidebar">
                <div className="psidebar-brand">
                    <div className="pbrand-icon">❤️</div>
                    <div>
                        <div className="pbrand-name">Nova Health</div>
                        <div className="pbrand-role">Patient Portal</div>
                    </div>
                </div>
                <div style={{ padding: "0 15px 15px" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search Nova AI..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px 8px 32px", fontSize: "0.75rem", color: "white", outline: "none" }}
                        />
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", opacity: 0.5 }}>🔍</span>
                    </div>
                </div>
                <nav className="psidebar-nav">
                    {navItems.map(({ to, icon, label, end, special }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `pnav-item ${isActive ? "active" : ""} ${special ? "sos-emergency" : ""}`}
                            style={special ? {
                                background: "linear-gradient(135deg, #ef4444, #991b1b)",
                                color: "white",
                                fontWeight: "800",
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
                                border: "1px solid rgba(239, 68, 68, 0.5)"
                            } : {}}
                        >
                            <span>{icon}</span><span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={() =>
                            addToast({
                                type: "error",
                                title: "SOS Panic Triggered",
                                message: "Emergency SOS simulated. In production, this would dispatch an ambulance with your latest vitals and GPS.",
                            })
                        }
                        style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #ef4444, #991b1b)", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)" }}
                    >
                        🆘 SOS PANIC
                    </button>
                </div>
                <div className="psidebar-user">
                    <div className="puser-info">
                        <div className="puser-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
                        <div>
                            <div className="puser-name">{user?.fullName}</div>
                            <div className="puser-role">Patient</div>
                        </div>
                    </div>
                    <button className="plogout-btn" onClick={() => { logout(); navigate("/login"); }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="patient-content">
                <Outlet />
                <MedicalChatbot />
            </main>
        </div>
    );
}
