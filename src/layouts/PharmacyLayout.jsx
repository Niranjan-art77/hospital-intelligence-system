import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Chatbot from "../components/Chatbot";
import { motion } from "framer-motion";
import { 
    Home, Pill, ClipboardList, 
    Calendar, Activity, Bell, 
    Search, LogOut, ChevronLeft, 
    ChevronRight, FlaskConical, Shield,
    Zap, Box, Database
} from "lucide-react";
import "./AdminLayout.css";

const pharmacyNav = [
    { to: "/pharmacy", icon: Home, label: "Core Console", end: true },
    { to: "/pharmacy/inventory", icon: Box, label: "Asset Matrix" },
    { to: "/pharmacy/prescriptions", icon: ClipboardList, label: "Protocol Flow" },
    { to: "/pharmacy/billing", icon: Database, label: "Fiscal Node" },
    { to: "/pharmacy/notifications", icon: Bell, label: "Alert Stream" },
];

export default function PharmacyLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="admin-layout selection:bg-emerald-500/30">
            <aside className={`admin-sidebar border-emerald-500/10 transition-all duration-500 relative ${isCollapsed ? "w-20 min-w-[80px]" : "w-72 min-w-[288px]"}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <FlaskConical size={24} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="brand-name tracking-tighter italic">NOVA <span className="text-emerald-400">PHARMA</span></span>
                            <span className="brand-role uppercase tracking-widest text-[8px] font-black opacity-50">Biochemical Node</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav custom-scrollbar overflow-x-hidden">
                    {pharmacyNav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `nav-item relative group ${isActive ? "active text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <div className={`flex items-center gap-4 w-full transition-all duration-300 ${isCollapsed ? "justify-center" : "px-4 py-3"}`}>
                                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                                {!isCollapsed && (
                                    <span className="text-[10px] font-black uppercase tracking-widest truncate">{label}</span>
                                )}
                            </div>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-4">
                    <div className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black shadow-lg shrink-0">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-white truncate uppercase tracking-tight">{user?.fullName}</div>
                                    <div className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">{user?.role}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => { logout(); navigate("/login"); }} 
                        className="w-full py-4 flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all"
                    >
                        <LogOut size={12} /> {!isCollapsed && "Terminate Session"}
                    </button>
                </div>
            </aside>

            <main className="admin-content relative bg-[#020617]">
                <div className="absolute inset-0 medical-grid opacity-[0.05] pointer-events-none" />
                <div className="relative z-10 custom-scrollbar overflow-x-hidden">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
