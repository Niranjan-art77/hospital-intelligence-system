import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import { motion } from "framer-motion";
import { 
    Home, Users, Bed, ClipboardList, 
    Calendar, Pill, Ambulance, Activity,
    Bell, BarChart3, Search, LogOut, 
    ChevronLeft, ChevronRight, Briefcase, Shield
} from "lucide-react";
import "./AdminLayout.css"; // Reuse the base styles

const staffNav = [
    { to: "/staff", icon: Home, label: "Ops Center", end: true },
    { to: "/staff/beds", icon: Bed, label: "Bed Matrix" },
    { to: "/staff/patients", icon: Users, label: "Patient Flow" },
    { to: "/staff/pharmacy", icon: Pill, label: "Logistics" },
    { to: "/staff/appointments", icon: Calendar, label: "Schedule" },
    { to: "/staff/icu-monitor", icon: Activity, label: "Critical Care" },
    { to: "/staff/ambulance", icon: Ambulance, label: "Dispatch" },
    { to: "/staff/notifications", icon: Bell, label: "Alert Node" },
];

export default function StaffLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="admin-layout selection:bg-emerald-500/30">
            <aside className={`admin-sidebar border-emerald-500/10 transition-all duration-500 relative ${isCollapsed ? "w-20 min-w-[80px]" : "w-72 min-w-[288px]"}`}>
                <div className="sidebar-brand">
                    <div className="brand-icon bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Briefcase size={24} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="brand-name tracking-tighter">NOVA <span className="text-emerald-400">STAFF</span></span>
                            <span className="brand-role">Ops Node</span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav custom-scrollbar">
                    {staffNav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `nav-item relative group ${isActive ? "active text-emerald-400" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <div className={`flex items-center gap-4 w-full ${isCollapsed ? "justify-center" : "px-4 py-3"}`}>
                                <Icon size={20} className="shrink-0" />
                                {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>}
                            </div>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-4">
                    <div className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden ${isCollapsed ? "p-2" : "p-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black shadow-lg shrink-0">
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
                    <button onClick={() => { logout(); navigate("/login"); }} className="w-full py-2 text-rose-500/50 hover:text-rose-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="admin-content relative bg-[#060b17]">
                <div className="absolute inset-0 medical-grid opacity-10 pointer-events-none" />
                <div className="relative z-10 custom-scrollbar">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
