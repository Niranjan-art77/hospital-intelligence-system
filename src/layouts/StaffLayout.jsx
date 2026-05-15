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
import "./StaffLayout.css";

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
        <div className="staff-layout selection:bg-sky-500/30">
            <aside className={`staff-sidebar transition-all duration-500 relative ${isCollapsed ? "w-20 min-w-[80px]" : "w-72 min-w-[288px]"}`}>
                <div className="ssidebar-brand">
                    <div className="sbrand-icon">
                        <Briefcase size={24} className="text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col">
                            <span className="sbrand-name">NOVA <span className="text-sky-400">STAFF</span></span>
                            <span className="sbrand-role">Ops Node</span>
                        </div>
                    )}
                </div>

                <nav className="ssidebar-nav custom-scrollbar">
                    {staffNav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `snav-item relative group ${isActive ? "active text-sky-400" : "text-slate-400 hover:text-sky-300"}`}
                        >
                            <div className={`flex items-center gap-4 w-full ${isCollapsed ? "justify-center" : "px-4 py-3"}`}>
                                <Icon size={20} className="shrink-0" />
                                {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>}
                            </div>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto space-y-4">
                    <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden ${isCollapsed ? "p-2" : "p-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shrink-0">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-white truncate uppercase tracking-tight">{user?.fullName}</div>
                                    <div className="text-[9px] font-black text-sky-400/80 uppercase tracking-widest">{user?.role}</div>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={() => { logout(); navigate("/login"); }} className="w-full py-3 flex justify-center gap-2 items-center bg-rose-500/5 text-rose-400 border border-rose-500/10 rounded-lg hover:bg-rose-500/10 text-[9px] font-black uppercase tracking-widest transition-all">
                        <LogOut size={12}/> {!isCollapsed && "Sign Out"}
                    </button>
                </div>
            </aside>

            <main className="staff-content relative">
                <div className="absolute inset-0 ops-grid opacity-30 pointer-events-none" />
                <div className="relative z-10 custom-scrollbar h-full staff-animate-in">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
