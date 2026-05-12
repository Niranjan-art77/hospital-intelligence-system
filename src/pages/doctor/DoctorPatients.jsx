import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
    Users, Search, UserCheck, AlertCircle, 
    MoreHorizontal, Filter, ArrowUpRight, 
    Activity, Shield, Heart, Droplets
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export default function DoctorPatients() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/patients")
            .then(r => { setPatients(Array.isArray(r.data) ? r.data : []); setLoading(false); })
            .catch(() => { setPatients([]); setLoading(false); });
    }, []);

    const filtered = patients.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.chronicConditions?.toLowerCase().includes(search.toLowerCase())
    );

    const riskLevel = (p) => {
        if (p.riskLevel) return p.riskLevel;
        if (p.chronicConditions) return "MEDIUM";
        return "LOW";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950">
                <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Accessing Bio-Profiles...</span>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-10 selection:bg-cyan-500/30">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        Subject <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Bio-Profiles</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <Users size={12} className="text-cyan-500" /> {patients.length} Active Clinical Subjects Synchronized
                    </p>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={16} />
                        <input 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            placeholder="Neural Subject Search..."
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all font-bold placeholder:text-slate-700 uppercase"
                        />
                    </div>
                    <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Filter size={20} />
                    </button>
                </div>
            </div>

            {/* Patients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                    <motion.div 
                        key={p.id || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="glass-card p-6 border-white/5 group relative overflow-hidden"
                    >
                        <div className="hud-corner top-left opacity-20" />
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal size={18} className="text-slate-500 hover:text-white cursor-pointer" />
                        </div>

                        <div className="flex items-center gap-5 mb-6">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-lg shadow-cyan-500/10">
                                    <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-white font-black text-xl overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="P" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 shadow-lg ${
                                    riskLevel(p) === 'HIGH' ? 'bg-rose-500 animate-pulse' : riskLevel(p) === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-500'
                                }`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">{p.name}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID: {p.id?.slice(0,8) || "N/A"}</span>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">• AGE {p.age || "??"}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Blood Group</span>
                                <span className="text-xs font-black text-cyan-400 uppercase">{p.bloodGroup || "O+"}</span>
                            </div>
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Status</span>
                                <span className={`text-[9px] font-black uppercase ${
                                    riskLevel(p) === 'HIGH' ? 'text-rose-500' : riskLevel(p) === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-400'
                                }`}>{riskLevel(p)} RISK</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recovery Integrity</span>
                                <span className="text-[10px] font-black text-white uppercase">{p.recoveryProgress || 72}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.recoveryProgress || 72}%` }}
                                    className={`h-full ${
                                        riskLevel(p) === 'HIGH' ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                            <div className="flex gap-2">
                                <div className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"><Activity size={14} /></div>
                                <div className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"><Heart size={14} /></div>
                            </div>
                            <button className="flex items-center gap-2 text-[9px] font-black text-cyan-400 uppercase tracking-[0.2em] group/btn">
                                Open Clinical HUD <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center text-slate-700">
                        <Shield size={64} className="opacity-10 mb-6" />
                        <h3 className="text-xl font-black uppercase tracking-[0.3em] italic">No Neural Patterns Found</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest mt-2">Adjust search parameters or synchronize global database</p>
                    </div>
                )}
            </div>
        </div>
    );
}
