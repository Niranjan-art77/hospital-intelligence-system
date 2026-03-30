import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import "./AdminLayout.css";

const navItems = [
    { to: "/admin", icon: "🏠", label: "Dashboard", end: true },
    { to: "/admin/patients", icon: "👥", label: "Patients" },
    { to: "/admin/add-patient", icon: "➕", label: "Add Patient" },
    { to: "/admin/highrisk", icon: "⚠️", label: "High Risk" },
    { to: "/admin/doctors", icon: "🩺", label: "Doctors" },
    { to: "/admin/appointments", icon: "📅", label: "Appointments" },
    { to: "/admin/pharmacy", icon: "💊", label: "Pharmacy" },
    { to: "/admin/beds", icon: "🛏️", label: "Beds" },
    { to: "/admin/ambulance", icon: "🚑", label: "Ambulance" },
    { to: "/admin/symptom-checker", icon: "🤖", label: "Symptom AI" },
    { to: "/admin/command-center", icon: "🏛️", label: "Command Center" },
    { to: "/admin/icu-monitor", icon: "🏥", label: "ICU Monitor" },
    { to: "/admin/notifications", icon: "🔔", label: "Alert Center" },
    { to: "/admin/disease-stats", icon: "📉", label: "Disease AI" },
    { to: "/admin/pharmacy-verification", icon: "⚕️", label: "Pharmacy Verify" },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🛡️</div>
                    <div>
                        <div className="brand-name">Nova Health</div>
                        <div className="brand-role">Admin Panel</div>
                    </div>
                </div>
                <div style={{ padding: "0 15px 15px" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Global Search..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px 8px 32px", fontSize: "0.75rem", color: "white", outline: "none" }}
                        />
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", opacity: 0.5 }}>🔍</span>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(({ to, icon, label, end }) => (
                        <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
                            <span className="nav-icon">{icon}</span>
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <button
                        onClick={() =>
                            addToast({
                                type: "error",
                                title: "Command Center Alert",
                                message: "Emergency dispatch simulated from the admin panel. In production, this would notify ICU and ambulance services.",
                            })
                        }
                        style={{ width: "100%", padding: "10px", background: "linear-gradient(135deg, #ef4444, #991b1b)", border: "none", borderRadius: "10px", color: "white", fontWeight: 800, cursor: "pointer", fontSize: "0.75rem", boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)" }}
                    >
                        🆘 EMERGENCY SOS
                    </button>
                </div>
                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">{user?.fullName?.[0]?.toUpperCase()}</div>
                        <div>
                            <div className="user-name">{user?.fullName}</div>
                            <div className="user-role">{user?.role}</div>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="admin-content">
                <Outlet />
                <Chatbot />
            </main>
        </div>
    );
}
