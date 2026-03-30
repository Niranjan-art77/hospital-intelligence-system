import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import "./DoctorLayout.css";

const navItems = [
    { to: "/doctor", icon: "🏠", label: "Dashboard", end: true },
    { to: "/doctor/patients", icon: "👥", label: "My Patients" },
    { to: "/doctor/appointments", icon: "📅", label: "Appointments" },
    { to: "/doctor/prescriptions", icon: "📋", label: "Prescriptions" },
    { to: "/doctor/messages", icon: "💬", label: "Messaging" },
    { to: "/doctor/performance", icon: "🏆", label: "Performance" },
];

export default function DoctorLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    return (
        <div className="doctor-layout">
            <aside className="doctor-sidebar">
                <div className="dsidebar-brand">
                    <div className="dbrand-icon">🩺</div>
                    <div>
                        <div className="dbrand-name">Nova Health</div>
                        <div className="dbrand-role">Doctor Panel</div>
                    </div>
                </div>
                <div style={{ padding: "0 15px 15px" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search Records..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px 8px 32px", fontSize: "0.75rem", color: "white", outline: "none" }}
                        />
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", opacity: 0.5 }}>🔍</span>
                    </div>
                </div>
                <nav className="dsidebar-nav">
                    {navItems.map(({ to, icon, label, end }) => (
                        <NavLink key={to} to={to} end={end} className={({ isActive }) => `dnav-item ${isActive ? "active" : ""}`}>
                            <span>{icon}</span><span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={() =>
                            addToast({
                                type: "error",
                                title: "Clinical SOS",
                                message: "Clinical emergency simulated. In a live deployment this would page ER and command center teams.",
                            })
                        }
                        style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #ef4444, #991b1b)", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)" }}
                    >
                        🆘 EMERGENCY SOS
                    </button>
                </div>
                <div className="dsidebar-user">
                    <div className="duser-info">
                        <div className="duser-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
                        <div>
                            <div className="duser-name">{user?.fullName}</div>
                            <div className="duser-role">Physician</div>
                        </div>
                    </div>
                    <button className="dlogout-btn" onClick={() => { logout(); navigate("/login"); }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="doctor-content">
                <Outlet />
                <Chatbot />
            </main>
        </div>
    );
}
