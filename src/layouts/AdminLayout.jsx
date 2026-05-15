import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Home, Users, UserPlus, AlertTriangle, Stethoscope, 
    Calendar, Pill, Bed, Ambulance, Brain, 
    LayoutGrid, Activity, Bell, BarChart3, ShieldCheck,
    Search, LogOut, ChevronLeft, ChevronRight, Zap,
    Menu, X, Shield, Settings
} from "lucide-react";
import "./AdminLayout.css";

const navItems = [
    { to: "/admin", icon: Home, label: "Terminal", end: true },
    { to: "/admin/patients", icon: Users, label: "Clinical Nodes" },
    { to: "/admin/add-patient", icon: UserPlus, label: "Register Unit" },
    { to: "/admin/highrisk", icon: AlertTriangle, label: "Priority Triage" },
    { to: "/admin/doctors", icon: Stethoscope, label: "Medical Staff" },
    { to: "/admin/appointments", icon: Calendar, label: "Sync Schedule" },
    { to: "/admin/pharmacy", icon: Pill, label: "Dispensary" },
    { to: "/admin/beds", icon: Bed, label: "Beds Matrix" },
    { to: "/admin/ambulance", icon: Ambulance, label: "Mobile Units" },
    { to: "/admin/symptom-checker", icon: Brain, label: "Neural AI" },
    { to: "/admin/command-center", icon: LayoutGrid, label: "Operations" },
    { to: "/admin/icu-monitor", icon: Activity, label: "Biometric Lab" },
    { to: "/admin/notifications", icon: Bell, label: "Alert Node" },
    { to: "/admin/disease-stats", icon: BarChart3, label: "Epidemic Data" },
    { to: "/admin/pharmacy-verification", icon: ShieldCheck, label: "Protocol Verify" },
];

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [search, setSearch] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const filteredNav = navItems.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-layout selection:bg-cyan-500/30">
            <aside className={`admin-sidebar transition-all duration-500 relative ${isCollapsed ? "w-20 min-w-[80px]" : "w-72 min-w-[288px]"}`}>
                {/* Branding */}
                <div className="sidebar-brand relative overflow-hidden group">
                    <div className="brand-icon shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        <Shield size={24} className="text-white group-hover:rotate-12 transition-transform" />
                    </div>
                    {!isCollapsed && (
                        <motion.div 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="brand-name tracking-tighter italic">NOVA <span className="text-cyan-400">HEALTH</span></span>
                            <span className="brand-role">Command Center</span>
                        </motion.div>
                    )}
                    <button 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                </div>

                {/* Global Search */}
                <div className="px-4 py-6">
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-cyan-400 ${isCollapsed ? "left-1/2 -translate-x-1/2" : ""}`} size={16} />
                        {!isCollapsed && (
                            <input
                                type="text"
                                placeholder="Neural Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-[11px] font-bold text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
                            />
                        )}
                        {isCollapsed && <div className="h-9 w-9 bg-slate-900/50 border border-white/5 rounded-xl mx-auto" />}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav custom-scrollbar overflow-x-hidden">
                    {filteredNav.map(({ to, icon: Icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `nav-item relative group ${isActive ? "active text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                        >
                            <div className={`flex items-center gap-4 w-full transition-all duration-300 ${isCollapsed ? "justify-center" : "px-4 py-3"}`}>
                                <Icon size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                                {!isCollapsed && (
                                    <span className="text-[11px] font-black uppercase tracking-widest truncate">{label}</span>
                                )}
                            </div>
                            {isCollapsed && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-2 group-hover:translate-x-0 transition-all z-50">
                                    {label}
                                </div>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-white/5 space-y-4">
                    <button
                        onClick={() =>
                            addToast({
                                type: "error",
                                title: "Command Center Alert",
                                message: "Emergency dispatch protocols initialized. All neural nodes notified.",
                            })
                        }
                        className={`w-full flex items-center justify-center gap-3 bg-gradient-to-r from-rose-600 to-red-700 text-white rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden relative ${isCollapsed ? "h-12" : "py-3.5"}`}
                    >
                        <Zap size={18} className={isCollapsed ? "" : "animate-pulse"} />
                        {!isCollapsed && <span className="text-[10px] font-black uppercase tracking-[0.2em]">EMERGENCY SOS</span>}
                    </button>

                    <div className={`bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-black shadow-lg shrink-0">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            {!isCollapsed && (
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-white truncate uppercase tracking-tight">{user?.fullName}</div>
                                    <div className="text-[9px] font-black text-cyan-500/60 uppercase tracking-widest">{user?.role}</div>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <button 
                                onClick={handleLogout}
                                className="w-full mt-4 flex items-center gap-2 py-2 text-[9px] font-black text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors"
                            >
                                <LogOut size={12} /> Sign Out Terminal
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Visual Flair */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-20" />
            </aside>

            <main className="admin-content relative">
                <div className="absolute inset-0 medical-grid opacity-20 pointer-events-none" />
                <div className="relative z-10 custom-scrollbar overflow-x-hidden h-full">
                    <Outlet />
                </div>
                <Chatbot />
            </main>
        </div>
    );
}
