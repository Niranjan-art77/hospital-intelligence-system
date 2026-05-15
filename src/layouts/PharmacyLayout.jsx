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
import "./PharmacyLayout.css";

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
        <div className="pharmacy-layout selection:bg-amber-500/30">
            <aside className={`pharmacy-sidebar transition-all duration-500 relative ${isCollapsed ? "w-20 min-w-[80px]" : "w-72 min-w-[288px]"}`}>
                <div className="psidebar-brand">
                    <div className="pbrand-icon">
                        <FlaskConical size={24} className="text-[#0f0a05]" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="pbrand-name tracking-tighter italic">NOVA <span className="text-amber-500">PHARMA</span></span>
                            <span className="pbrand-role">Biochemical Node</span>
                        </div>
                    )}
                </div>

                <nav className="psidebar-nav custom-scrollbar overflow-x-hidden">
                    {pharmacyNav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `pnav-item relative group ${isActive ? "active text-amber-400" : "text-amber-900/60 hover:text-amber-500"}`}
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
                    <div className={`bg-amber-950/40 border border-amber-500/20 rounded-2xl overflow-hidden transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-[#0f0a05] font-black shadow-lg shadow-amber-500/20 shrink-0">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-amber-50 truncate uppercase tracking-tight">{user?.fullName}</div>
                                    <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest">{user?.role}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => { logout(); navigate("/login"); }} 
                        className="w-full py-4 flex items-center justify-center gap-2 bg-red-500/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 hover:border-transparent hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    >
                        <LogOut size={12} /> {!isCollapsed && "Terminate Session"}
                    </button>
                </div>
            </aside>

            <main className="pharmacy-content relative">
                <div className="absolute inset-0 chemical-matrix pointer-events-none" />
                <div className="relative z-10 custom-scrollbar overflow-x-hidden h-full">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
