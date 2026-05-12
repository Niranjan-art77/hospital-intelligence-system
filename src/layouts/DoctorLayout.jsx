import { useState } from "react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Chatbot from "../components/Chatbot";
import { 
    LayoutDashboard, Users, Calendar, Pill, 
    MessageSquare, TrendingUp, LogOut, Search,
    Shield, Activity, Bell, Settings, Command
} from "lucide-react";
import "./DoctorLayout.css";

const navItems = [
    { to: "/doctor", icon: <LayoutDashboard size={18} />, label: "Command Center", end: true },
    { to: "/doctor/patients", icon: <Users size={18} />, label: "Bio-Profiles" },
    { to: "/doctor/appointments", icon: <Calendar size={18} />, label: "Clinical Queue" },
    { to: "/doctor/prescriptions", icon: <Pill size={18} />, label: "Protocols" },
    { to: "/doctor/messages", icon: <MessageSquare size={18} />, label: "Neural Link" },
    { to: "/doctor/performance", icon: <TrendingUp size={18} />, label: "Metrics" },
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
        <div className="flex h-screen bg-slate-950 overflow-hidden selection:bg-cyan-500/30">
            {/* Immersive Sidebar */}
            <aside className="w-80 glass-card rounded-none border-r border-white/5 flex flex-col z-20 relative overflow-hidden">
                <div className="absolute inset-0 scanline opacity-[0.02] pointer-events-none" />
                
                {/* Brand Header */}
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">Nova <span className="text-cyan-400">Health</span></h1>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Clinical OS v4.2</p>
                        </div>
                    </div>

                    {/* Quick Search */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Neural Query..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-[11px] text-white focus:outline-none focus:border-cyan-500/30 transition-all font-bold placeholder:text-slate-700 uppercase"
                        />
                    </div>
                </div>

                {/* Navigation Nodes */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scroll">
                    <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">Neural Navigation</p>
                    {filteredNav.map(({ to, icon, label, end }) => (
                        <NavLink 
                            key={to} 
                            to={to} 
                            end={end} 
                            className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${
                                isActive 
                                ? "bg-cyan-500/10 border border-cyan-500/20 text-white shadow-lg shadow-cyan-500/5" 
                                : "text-slate-500 hover:text-cyan-400 hover:bg-white/5"
                            }`}
                        >
                            <span className="transition-transform group-hover:scale-110">{icon}</span>
                            <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                            {/* Active indicator */}
                            <div className="ml-auto opacity-0 group-[.active]:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                            </div>
                        </NavLink>
                    ))}
                    {filteredNav.length === 0 && (
                        <div className="p-8 text-center text-[10px] text-slate-600 font-bold uppercase italic">No nodes matching query</div>
                    )}
                </nav>

                {/* Action Sector */}
                <div className="p-6 space-y-4 border-t border-white/5">
                    <button
                        onClick={handleSOS}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] group"
                    >
                        <Activity size={16} className="group-hover:animate-pulse" /> EMERGENCY SOS
                    </button>

                    <div className="flex items-center justify-between p-4 bg-slate-900/40 rounded-3xl border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black border border-white/10">
                                {user?.fullName?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white uppercase tracking-tighter truncate w-24">{user?.fullName}</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase">Synchronized</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => { logout(); navigate("/login"); }}
                            className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                            title="Terminate Uplink"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Tactical Content Main */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute inset-0 medical-grid opacity-30 pointer-events-none" />
                
                {/* Content Header (Top HUD) */}
                <header className="h-20 border-b border-white/5 backdrop-blur-xl bg-slate-950/40 px-10 flex items-center justify-between z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Command size={14} className="text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System Console</span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Neural Sync Optimized</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-500 hover:text-white transition-colors"><Settings size={18} /></button>
                        <div className="w-px h-6 bg-white/10" />
                        <div className="flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Sector 7-G</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Local Node</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-cyan-400">
                                <Activity size={20} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Viewport */}
                <div className="flex-1 overflow-y-auto custom-scroll relative z-0">
                    <Outlet />
                </div>
                
                <Chatbot />
            </main>
        </div>
    );
}
