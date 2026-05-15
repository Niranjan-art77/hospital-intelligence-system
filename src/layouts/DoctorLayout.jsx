import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import { 
    LayoutDashboard, Users, Calendar, Pill, 
    MessageSquare, TrendingUp, LogOut, Search,
    Shield, Activity, Bell, Settings, Command,
    Stethoscope, DollarSign
} from "lucide-react";
import "./DoctorLayout.css";

const navItems = [
    { to: "/doctor", icon: <LayoutDashboard size={18} />, label: "Command Center", end: true },
    { to: "/doctor/patients", icon: <Users size={18} />, label: "Patient Archives" },
    { to: "/doctor/appointments", icon: <Calendar size={18} />, label: "Clinical Queue" },
    { to: "/doctor/consultation", icon: <Stethoscope size={18} />, label: "Consultation HUD" },
    { to: "/doctor/prescriptions", icon: <Pill size={18} />, label: "Medical Protocols" },
    { to: "/doctor/billing", icon: <DollarSign size={18} />, label: "Financial Node" },
];

export default function DoctorLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    const [search, setSearch] = useState("");
    const filteredNav = navItems.filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    const handleSOS = () => {
        addToast({
            type: "error",
            title: "CRITICAL ALERT",
            message: "Emergency protocols activated. Command center notified.",
        });
    };

    return (
        <div className="doctor-layout selection:bg-emerald-500/30">
            {/* Immersive Sidebar */}
            <aside className="doctor-sidebar">
                <div className="dsidebar-brand">
                    <div className="dbrand-icon">
                        <Shield size={24} />
                    </div>
                    <div>
                        <h1 className="dbrand-name">Nova <span className="text-emerald-400">Health</span></h1>
                        <p className="dbrand-role">Clinical OS v4.2</p>
                    </div>
                </div>

                {/* Quick Search */}
                <div className="px-4 py-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600/50 group-focus-within:text-emerald-400 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Neural Query..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/20 border border-emerald-500/20 rounded-xl py-3 pl-10 pr-4 text-[11px] text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold placeholder:text-emerald-700/50 uppercase shadow-inner"
                        />
                    </div>
                </div>

                {/* Navigation Nodes */}
                <nav className="dsidebar-nav custom-scroll">
                    <p className="px-4 text-[9px] font-black text-emerald-700 uppercase tracking-[0.3em] mb-2">Neural Navigation</p>
                    {filteredNav.map(({ to, icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `dnav-item group ${isActive ? "active" : ""}`}
                        >
                            <span className="transition-transform group-hover:scale-110">{icon}</span>
                            <span className="font-black uppercase tracking-widest">{label}</span>
                            {/* Active indicator */}
                            <div className="ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                            </div>
                        </NavLink>
                    ))}
                    {filteredNav.length === 0 && (
                        <div className="p-8 text-center text-[10px] text-emerald-800 font-bold uppercase italic">No nodes matching query</div>
                    )}
                </nav>

                {/* Action Sector */}
                <div className="p-4 space-y-4">
                    <button
                        onClick={handleSOS}
                        className="w-full flex items-center justify-center gap-3 py-3 bg-red-600/10 border border-red-600/30 rounded-xl text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] group shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                    >
                        <Activity size={16} className="group-hover:animate-pulse" /> EMERGENCY SOS
                    </button>

                    <div className="dsidebar-user rounded-2xl border border-emerald-500/20">
                        <div className="duser-info">
                            <div className="duser-avatar">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="duser-name truncate w-24">{user?.fullName}</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
                                    <span className="text-[8px] font-black text-emerald-600 uppercase">Synchronized</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { logout(); navigate("/login"); }}
                                className="ml-auto p-2 text-emerald-700 hover:text-red-400 transition-colors"
                                title="Terminate Uplink"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Tactical Content Main */}
            <main className="doctor-content flex flex-col">
                <div className="absolute inset-0 clinical-hologram opacity-40 pointer-events-none" />
                
                {/* Content Header (Top HUD) */}
                <header className="h-16 border-b border-emerald-500/10 backdrop-blur-xl bg-black/20 px-8 flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Command size={14} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest">Active System Console</span>
                        </div>
                        <div className="w-px h-4 bg-emerald-500/20" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                            <span className="text-[10px] font-black text-emerald-600/80 uppercase tracking-widest">Neural Sync Optimized</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-emerald-600 hover:text-emerald-300 transition-colors"><Settings size={16} /></button>
                        <div className="w-px h-6 bg-emerald-500/20" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-tighter">Sector 7-G</p>
                                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest">Local Node</p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                                <Activity size={16} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <div className="flex-1 overflow-y-auto custom-scroll relative z-0 p-6">
                    <Outlet />
                </div>
                
                <Chatbot />
            </main>
        </div>
    );
}
