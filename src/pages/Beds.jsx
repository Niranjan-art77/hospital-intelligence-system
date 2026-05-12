import { useState, useEffect } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Hospital, Activity, AlertCircle, LayoutGrid, 
    CheckCircle2, AlertTriangle, Hammer, Filter,
    Users, Plus, Search, ChevronRight, Zap,
    Shield, ArrowRight, Bed as BedIcon
} from "lucide-react";

// Initial fallback data
const DEFAULT_BEDS = [
    { id: 1, bedNumber: "ICU-01", type: "ICU", status: "OCCUPIED", wardName: "ICU Ward" },
    { id: 2, bedNumber: "ICU-02", type: "ICU", status: "AVAILABLE", wardName: "ICU Ward" },
    { id: 3, bedNumber: "ICU-03", type: "ICU", status: "AVAILABLE", wardName: "ICU Ward" },
    { id: 4, bedNumber: "ICU-04", type: "ICU", status: "OCCUPIED", wardName: "ICU Ward" },
    { id: 5, bedNumber: "EMG-01", type: "EMERGENCY", status: "AVAILABLE", wardName: "Emergency Ward" },
    { id: 6, bedNumber: "EMG-02", type: "EMERGENCY", status: "OCCUPIED", wardName: "Emergency Ward" },
    { id: 7, bedNumber: "EMG-03", type: "EMERGENCY", status: "AVAILABLE", wardName: "Emergency Ward" },
    { id: 8, bedNumber: "A-01", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 9, bedNumber: "A-02", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 10, bedNumber: "A-03", type: "GENERAL", status: "OCCUPIED", wardName: "Ward A" },
    { id: 11, bedNumber: "A-04", type: "GENERAL", status: "AVAILABLE", wardName: "Ward A" },
    { id: 12, bedNumber: "A-05", type: "GENERAL", status: "MAINTENANCE", wardName: "Ward A" },
];

const SAMPLE_PATIENTS = [
    { id: "p1", name: "Ravi Kumar", chronicConditions: "Severe Chest Pain" },
    { id: "p2", name: "Priya Sharma", chronicConditions: "Cardiac Arrest" },
    { id: "p3", name: "Suresh Rao", chronicConditions: "Stroke" },
];

const STATUS_CONFIG = {
    AVAILABLE: { color: "emerald", icon: CheckCircle2, text: "Ready" },
    OCCUPIED: { color: "rose", icon: Activity, text: "Occupied" },
    MAINTENANCE: { color: "amber", icon: Hammer, text: "Repair" },
};

const TYPE_CONFIG = { 
    ICU: { icon: Hospital, label: "ICU" }, 
    EMERGENCY: { icon: AlertCircle, label: "Emergency" }, 
    GENERAL: { icon: BedIcon, label: "General" } 
};

export default function Beds() {
    const [beds, setBeds] = useState(DEFAULT_BEDS);
    const [patients, setPatients] = useState(SAMPLE_PATIENTS);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [allocResult, setAllocResult] = useState(null);
    const [allocating, setAllocating] = useState(false);
    const [filterType, setFilterType] = useState("ALL");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        API.get("/beds")
            .then(r => { if (Array.isArray(r.data)) setBeds(r.data); })
            .catch(() => {});

        API.get("/patients")
            .then(r => { if (Array.isArray(r.data)) setPatients(r.data); })
            .catch(() => {});
    }, []);

    const allocateBed = () => {
        if (!selectedPatient || allocating) return;
        setAllocating(true);

        const patient = patients.find(p => String(p.id) === String(selectedPatient));
        const priority = ["ICU", "EMERGENCY", "GENERAL"];
        let assigned = null;
        
        for (const type of priority) {
            assigned = beds.find(b => b.status === "AVAILABLE" && b.type === type);
            if (assigned) break;
        }
        
        if (!assigned) assigned = beds.find(b => b.status === "AVAILABLE");

        if (!assigned) {
            setAllocResult({ success: false, msg: "NO CRITICAL SLOTS AVAILABLE" });
            setAllocating(false);
            return;
        }

        setBeds(prev => prev.map(b => b.id === assigned.id ? { ...b, status: "OCCUPIED" } : b));
        setAllocResult({
            success: true,
            bedNumber: assigned.bedNumber,
            type: assigned.type,
            ward: assigned.wardName,
            patientName: patient?.name || "Patient",
        });
        setSelectedPatient("");
        setAllocating(false);

        API.put(`/beds/${assigned.id}/status?status=OCCUPIED`).catch(() => {});
        setTimeout(() => setAllocResult(null), 7000);
    };

    const stats = {
        total: beds.length,
        available: beds.filter(b => b.status === "AVAILABLE").length,
        occupied: beds.filter(b => b.status === "OCCUPIED").length,
        icu: beds.filter(b => b.type === "ICU").length,
        emergency: beds.filter(b => b.type === "EMERGENCY").length,
    };

    const filteredBeds = beds.filter(b => {
        const matchesFilter = filterType === "ALL" || b.status === filterType || b.type === filterType;
        const matchesSearch = b.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             b.wardName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="p-8 min-h-screen relative z-10 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-3 flex items-center gap-4">
                        FACILITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 drop-shadow-sm">ROSTER</span>
                        <LayoutGrid className="text-emerald-500" size={32} />
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
                        Autonomous Bed Matrix & Clinical Deployment Node
                    </p>
                </motion.div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Find Bed/Ward..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-white/5 pl-12 pr-6 py-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all w-[300px]"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                {[
                    { label: "Total Matrix", val: stats.total, color: "text-blue-400", icon: LayoutGrid },
                    { label: "Uplink Active", val: stats.available, color: "text-emerald-400", icon: CheckCircle2 },
                    { label: "In Use", val: stats.occupied, color: "text-rose-400", icon: Activity },
                    { label: "Critical ICU", val: stats.icu, color: "text-purple-400", icon: Hospital },
                    { label: "Emergency", val: stats.emergency, color: "text-amber-400", icon: AlertTriangle },
                ].map((s, i) => (
                    <motion.div 
                        key={s.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card-glowing p-6 group hover:border-white/20 transition-all"
                    >
                        <s.icon className={`${s.color} mb-4 opacity-50 group-hover:opacity-100 transition-opacity`} size={20} />
                        <div className="text-3xl font-black text-white mb-1 tracking-tighter">{s.val}</div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Deployment Area */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Emergency Protocol */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-glowing border-rose-500/20 p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                        
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                                <Zap size={24} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">RAPID DEPLOYMENT PROTOCOL</h3>
                                <p className="text-[10px] text-rose-500/60 font-black uppercase tracking-widest">Emergency Tactical Allocation</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative group">
                                <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400 transition-colors" size={20} />
                                <select 
                                    value={selectedPatient}
                                    onChange={e => setSelectedPatient(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 p-5 pl-14 rounded-3xl text-white font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all cursor-pointer shadow-inner"
                                >
                                    <option value="" className="bg-slate-900">Select Patient Target...</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id} className="bg-slate-900">{p.name} — {p.chronicConditions}</option>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={allocateBed}
                                disabled={!selectedPatient || allocating}
                                className="px-10 py-5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black rounded-3xl shadow-glow-rose transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                                {allocating ? "Syncing..." : "Execute Allocation"}
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {allocResult && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`mt-6 p-6 rounded-2xl border backdrop-blur-3xl ${allocResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {allocResult.success ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                            <div>
                                                <div className="font-black uppercase tracking-widest text-xs">{allocResult.success ? "Success" : "Failure"}</div>
                                                <div className="text-sm font-bold text-slate-100 mt-1">
                                                    {allocResult.success ? (
                                                        <>Patient <span className="text-emerald-400">{allocResult.patientName}</span> assigned to <span className="text-emerald-400">{allocResult.bedNumber}</span> ({allocResult.type})</>
                                                    ) : allocResult.msg}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-black opacity-40">TIMESTAMP: {new Date().toLocaleTimeString()}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Ward Layout */}
                    <div className="glass-card-glowing p-8">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-2xl font-black text-white tracking-tight">LAYOUT MATRIX</h3>
                            <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-2xl border border-white/5">
                                {["ALL", "AVAILABLE", "ICU", "EMERGENCY"].map(f => (
                                    <button 
                                        key={f} 
                                        onClick={() => setFilterType(f)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterType === f ? 'bg-emerald-500 text-white shadow-glow-emerald' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xxl:grid-cols-5 gap-6">
                            {filteredBeds.map((bed, i) => {
                                const config = STATUS_CONFIG[bed.status] || STATUS_CONFIG.AVAILABLE;
                                const TypeIcon = TYPE_CONFIG[bed.type]?.icon || BedIcon;
                                return (
                                    <motion.div 
                                        key={bed.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        className={`p-6 rounded-[2rem] border transition-all relative overflow-hidden group ${
                                            bed.status === 'AVAILABLE' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/50' :
                                            bed.status === 'OCCUPIED' ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/50' :
                                            'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/50'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <div className={`p-4 rounded-2xl mb-4 ${
                                                bed.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                bed.status === 'OCCUPIED' ? 'bg-rose-500/10 text-rose-400' :
                                                'bg-amber-500/10 text-amber-400'
                                            } group-hover:scale-110 transition-transform`}>
                                                <TypeIcon size={24} />
                                            </div>
                                            <h4 className="text-lg font-black text-white mb-1 tracking-tighter">{bed.bedNumber}</h4>
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-3">{bed.type} NODE</div>
                                            
                                            <div className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                bed.status === 'AVAILABLE' ? 'bg-emerald-500 text-white border-emerald-400 shadow-glow-sm' :
                                                bed.status === 'OCCUPIED' ? 'bg-rose-500 text-white border-rose-400' :
                                                'bg-amber-500 text-slate-900 border-amber-400'
                                            }`}>
                                                {config.text}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all" />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card-glowing p-8"
                    >
                        <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-8 flex items-center gap-3">
                            <Shield className="text-emerald-500" size={16} />
                            Sector Integrity
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                <Zap className="text-emerald-500 mb-4 animate-pulse" size={48} />
                                <p className="text-sm font-black uppercase tracking-widest text-emerald-500">All Systems Nominal</p>
                                <p className="text-[10px] font-bold text-slate-500 mt-2">Matrix Synchronization Complete</p>
                            </div>

                            <div className="pt-6 border-t border-white/5">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Legend</div>
                                <div className="space-y-4">
                                    {[
                                        { label: "Available Sector", color: "bg-emerald-500" },
                                        { label: "Engaged Sector", color: "bg-rose-500" },
                                        { label: "Offline Maintenance", color: "bg-amber-500" },
                                    ].map(l => (
                                        <div key={l.label} className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${l.color} shadow-glow-sm`} />
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <div className="glass-card-glowing p-8 border-emerald-500/10">
                        <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-6">Medical Support Matrix</h3>
                        <div className="space-y-3">
                            {[
                                { icon: Hospital, label: "ICU Protocols", color: "text-purple-400" },
                                { icon: AlertCircle, label: "Emergency Response", color: "text-amber-400" },
                                { icon: BedIcon, label: "General Care", color: "text-blue-400" },
                            ].map(item => (
                                <div key={item.label} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`${item.color} opacity-50 group-hover:opacity-100`} size={18} />
                                        <span className="text-xs font-bold text-slate-300">{item.label}</span>
                                    </div>
                                    <ChevronRight className="text-slate-600 group-hover:text-white transition-all" size={14} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .shadow-glow-rose {
                    box-shadow: 0 0 20px rgba(225, 29, 72, 0.4), 0 0 40px rgba(225, 29, 72, 0.2);
                }
                .shadow-glow-emerald {
                    box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
                }
                .shadow-glow-sm {
                    box-shadow: 0 0 10px currentColor;
                }
                .xxl\\:grid-cols-5 {
                    grid-template-columns: repeat(5, minmax(0, 1fr));
                }
            `}</style>
        </div>
    );
}
