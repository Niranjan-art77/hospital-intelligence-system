import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { 
    LayoutDashboard, Users, UserPlus, AlertTriangle, 
    Stethoscope, Calendar, Pill, Bed, Search, 
    Activity, Shield, FileText, MessageSquare, 
    History, Map, CreditCard, LifeBuoy, LogOut,
    Sparkles, Zap, ChevronLeft, ChevronRight
} from "lucide-react";

const WaveformIcon = () => (
    <div className="relative flex items-center justify-center">
        <Activity className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"
        />
    </div>
);

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sosStatus, setSosStatus] = useState("idle");
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSOS = async () => {
        if (!window.confirm("Activate Emergency SOS Pattern? This will alert all available medical staff immediately.")) return;
        setSosStatus("sending");
        try {
            await API.post("/notifications", {
                message: `CRITICAL ALARM: Patient ${user?.fullName || "Unknown"} has activated the Emergency SOS Protocol. Immediate medical assistance required.`,
                type: "ALARM"
            });
            setSosStatus("sent");
            setTimeout(() => setSosStatus("idle"), 5000);
        } catch (error) {
            console.error(error);
            setSosStatus("idle");
            alert("Failed to send SOS. Please call emergency services directly.");
        }
    };

    const adminLinks = [
        { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
        { name: "Patients", path: "/patients", icon: <Users size={20} /> },
        { name: "Critical Watch", path: "/highrisk", icon: <AlertTriangle size={20} /> },
        { name: "Doctors", path: "/doctors", icon: <Stethoscope size={20} /> },
        { name: "Appointments", path: "/appointments", icon: <Calendar size={20} /> },
        { name: "Symptom Checker", path: "/symptom-checker", icon: <Search size={20} /> },
        { name: "Pharmacy", path: "/pharmacy", icon: <Pill size={20} /> },
        { name: "ICU Monitor", path: "/icu-monitor", icon: <Activity size={20} /> }
    ];

    const patientLinks = [
        { name: "Overview", path: "/patient/dashboard", icon: <LayoutDashboard size={20} /> },
        { name: "Consultation", path: "/patient/directory", icon: <Search size={20} /> },
        { name: "Schedule", path: "/patient/appointments", icon: <Calendar size={20} /> },
        { name: "Medications", path: "/patient/prescriptions", icon: <Pill size={20} /> },
        { name: "Vitals Hub", path: "/patient/monitor", icon: <Activity size={20} /> },
        { name: "Medical Vault", path: "/patient/reports", icon: <FileText size={20} /> },
        { name: "Health Identity", path: "/patient/health-card", icon: <Shield size={20} /> },
        { name: "Messages", path: "/patient/messages", icon: <MessageSquare size={20} /> },
        { name: "History Ledger", path: "/patient/history", icon: <History size={20} /> },
        { name: "Recovery Path", path: "/patient/roadmap", icon: <Map size={20} /> }
    ];

    const links = user?.role === "PATIENT" ? patientLinks : adminLinks;

    return (
        <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1, width: isCollapsed ? 88 : 280 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className="fixed left-6 top-6 bottom-6 z-50 glass-card-glowing flex flex-col p-4 overflow-hidden"
        >
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center border border-white/10 text-white z-50"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
            {/* Header */}
            <div className="mb-10 flex items-center gap-4 px-2">
                <WaveformIcon />
                <div>
                    <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-1">
                        NOVA<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">HEALTH</span>
                    </h1>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Protocol Active</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto custom-scroll pr-1">
                <ul className="space-y-2">
                    {links.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <li key={link.name}>
                                <Link to={link.path}>
                                    <motion.div
                                        whileHover={{ x: 5 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`px-4 py-3.5 rounded-2xl flex items-center gap-4 transition-all duration-300 relative group ${
                                            isActive 
                                            ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-white shadow-[0_10px_20px_rgba(59,130,246,0.1)]" 
                                            : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div 
                                                layoutId="active-pill"
                                                className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
                                            />
                                        )}
                                        <span className={`p-2 rounded-xl transition-all duration-300 ${
                                            isActive 
                                            ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                                            : "bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10"
                                        }`}>
                                            {link.icon}
                                        </span>
                                        {!isCollapsed && (
                                            <>
                                                <span className={`text-sm font-bold tracking-wide transition-all ${isActive ? "translate-x-1" : "group-hover:translate-x-1 whitespace-nowrap"}`}>
                                                    {link.name}
                                                </span>
                                                {isActive && <Zap className="w-3 h-3 ml-auto text-blue-400 animate-pulse" />}
                                            </>
                                        )}
                                    </motion.div>
                                </Link>
                            </li>
                        );
                    })}

                    {/* Emergency Action */}
                    <li>
                        <motion.button
                            onClick={handleSOS}
                            disabled={sosStatus !== "idle"}
                            whileHover={sosStatus === "idle" ? { scale: 1.02, x: 5 } : {}}
                            whileTap={sosStatus === "idle" ? { scale: 0.95 } : {}}
                            className={`w-full mt-4 px-4 py-4 rounded-2xl border flex items-center gap-4 transition-all group shadow-lg ${
                                sosStatus === "sending" ? "bg-red-500/50 text-white animate-pulse border-red-500" :
                                sosStatus === "sent" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                                "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-red-500/5"
                            }`}
                        >
                            <span className={`p-2 rounded-xl transition-colors ${sosStatus === 'sent' ? 'bg-emerald-500/20' : 'bg-red-500/20 group-hover:bg-white/20'}`}>
                                <LifeBuoy size={20} className={sosStatus === "idle" ? "animate-spin-slow" : ""} />
                            </span>
                            {!isCollapsed && (
                                <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap">
                                    {sosStatus === "sending" ? "Broadcasting..." : sosStatus === "sent" ? "SOS Sent" : "SOS Signal"}
                                </span>
                            )}
                        </motion.button>
                    </li>
                </ul>
            </div>

            {/* Profile Section */}
            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/10 transition-all">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] group-hover:rotate-6 transition-transform flex-shrink-0">
                        <div className="w-full h-full rounded-2xl bg-slate-900 overflow-hidden">
                            <img 
                                src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id || 'User'}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <h4 className="text-sm font-black text-white truncate leading-tight">{user?.fullName || "Agent Nova"}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{user?.role || "Protocol User"}</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <LogOut size={14} />
                    {!isCollapsed && <span>Terminate Session</span>}
                </button>
            </div>

            <style>{`
                .animate-spin-slow { animation: spin 8s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </motion.div>
    );
}