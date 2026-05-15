import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import "./PatientLayout.css";

const navItems = [
    { to: "/patient", icon: "🏠", label: "My Dashboard", end: true },
    { to: "/patient/directory", icon: "👨‍⚕️", label: "Find a Doctor" },
    { to: "/patient/appointments", icon: "📅", label: "Appointments" },
    { to: "/patient/prescriptions", icon: "💊", label: "Prescriptions" },
    { to: "/patient/health", icon: "📊", label: "Health Monitor" },
    { to: "/patient/reports", icon: "📄", label: "Medical Reports" },
    { to: "/patient/health-card", icon: "🎫", label: "Health Card" },
    { to: "/patient/recommendations", icon: "🩺", label: "Doctor Match" },
    { to: "/patient/history", icon: "📜", label: "History Timeline" },
    { to: "/patient/recovery", icon: "🧗", label: "Recovery Roadmap" },
    { to: "/patient/billing", icon: "💳", label: "Billing & Invoices" },
    { to: "/patient/symptom-checker", icon: "🤖", label: "Symptom AI" },
];

export default function PatientLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [search, setSearch] = useState("");
    const filteredNav = navItems.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="patient-layout selection:bg-pink-500/30">
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
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 12px 8px 32px", fontSize: "0.75rem", color: "white", outline: "none" }}
                        />
                        <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", opacity: 0.5 }}>🔍</span>
                    </div>
                </div>
                <nav className="psidebar-nav custom-scrollbar overflow-x-hidden">
                    {filteredNav.map(({ to, icon, label, end, special }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `pnav-item group relative ${isActive ? "active text-pink-400" : "text-purple-300/70 hover:text-pink-300"} ${special ? "sos-emergency" : ""}`}
                            style={special ? {
                                background: "linear-gradient(135deg, #ef4444, #991b1b)",
                                color: "white",
                                fontWeight: "800",
                                boxShadow: "0 0 10px rgba(239, 68, 68, 0.3)",
                                border: "1px solid rgba(239, 68, 68, 0.5)"
                            } : {}}
                        >
                            <div className="flex items-center gap-3 px-4 py-3">
                                <span className="text-xl group-hover:scale-110 transition-transform">{icon}</span>
                                <span className="text-[11px] font-bold tracking-wide">{label}</span>
                            </div>
                        </NavLink>
                    ))}
                    {filteredNav.length === 0 && <div style={{ padding: "20px", color: "#f472b6", fontSize: "0.8rem", textAlign: "center" }}>No features found</div>}
                </nav>
                <div style={{ padding: "12px", borderTop: "1px solid rgba(236, 72, 153, 0.1)" }}>
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
                        <div className="puser-avatar shadow-lg shadow-pink-500/20">{user?.fullName?.[0]?.toUpperCase()}</div>
                        <div className="min-w-0">
                            <div className="puser-name truncate">{user?.fullName}</div>
                            <div className="puser-role">Patient</div>
                        </div>
                    </div>
                    <button className="plogout-btn" onClick={() => { logout(); navigate("/login"); }}>
                        🚪 Logout
                    </button>
                </div>
            </aside>
            <main className="patient-content">
                <div className="bio-organic-bg"></div>
                <div className="relative z-10 custom-scrollbar h-full overflow-x-hidden p-6">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
