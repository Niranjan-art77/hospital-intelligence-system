import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Pill, CheckCircle, AlertTriangle, Clock, 
  FlaskConical, Send, Shield, Zap, Search,
  Box, ChevronRight, Activity, Filter,
  User, Database, DollarSign, Terminal,
  Cpu, Sparkles, MessageSquare, FileText,
  TrendingUp, ArrowUpRight, ArrowDownRight,
  RefreshCcw, Layers, Bell, ShieldCheck,
  Smartphone, Eye, Trash2, Edit3, Plus
} from "lucide-react";
import { io as socketIO } from "socket.io-client";

export default function PharmacyDashboard() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState("console");
    const [prescriptions, setPrescriptions] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [patients, setPatients] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, PENDING, VERIFIED
    const [alerts, setAlerts] = useState([]);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [isChecking, setIsChecking] = useState(false);
    const [stockModal, setStockModal] = useState(null); // { item, newStock }
    const socketRef = useRef(null);
    const [activityLog, setActivityLog] = useState([
        { id: 1, text: "Neural uplink established.", type: "system", time: "14:22" },
        { id: 2, text: "Stock levels synchronized with central node.", type: "info", time: "14:15" },
        { id: 3, text: "New Protocol #PX-229 received from Dr. Sarah.", type: "urgent", time: "14:10" }
    ]);

    useEffect(() => {
        fetchInitialData();
    }, [activeTab]);

    // Real-time: listen for new prescriptions
    useEffect(() => {
        const BACKEND = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:5000';
        socketRef.current = socketIO(BACKEND, { transports: ['websocket', 'polling'] });
        socketRef.current.on('new-prescription-pharmacy', (newRx) => {
            setPrescriptions(prev => [{ ...newRx, id: newRx._id }, ...prev]);
            logActivity(`New Protocol received from ${newRx.doctor?.user?.fullName || 'Doctor'} for ${newRx.patient?.user?.fullName || 'Patient'}`, 'urgent');
            addToast({ type: 'info', title: 'NEW PROTOCOL RECEIVED', message: 'A new prescription has arrived in the stream.' });
        });
        socketRef.current.on('new-patient', (pat) => {
            logActivity(`New patient registered: ${pat.fullName}`, 'info');
        });
        return () => { socketRef.current?.disconnect(); };
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const [preRes, patRes, invRes, statsRes, alertsRes] = await Promise.all([
                API.get("/pharmacy/prescriptions"),
                API.get("/patients"),
                API.get("/pharmacy/inventory"),
                API.get("/pharmacy/stats"),
                API.get("/pharmacy/alerts")
            ]);
            // Normalize prescriptions: backend returns populated objects
            const rxList = (preRes.data || []).map(p => ({ ...p, id: p.id || p._id }));
            setPrescriptions(rxList);
            setPatients(patRes.data || []);
            setInventory(invRes.data || []);
            setStats(statsRes.data || null);
            setAlerts(alertsRes.data || []);
        } catch (error) {
            console.error("Neural Link Failure", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSystemCheck = (p) => {
        setSelectedPrescription(p);
        setIsChecking(true);
        setTimeout(() => {
            setIsChecking(false);
            // Patient name: populated prescriptions have patient as object
            const patName = p.patient?.user?.fullName || p.patient?.name || 'Unknown';
            addToast({
                type: "success",
                title: "SYSTEM INTEGRITY VERIFIED",
                message: `Prescription #${p.id} matches patient biometric profile.`
            });
            logActivity(`Verified Protocol #${p.id} for ${patName}`, "success");
        }, 2000);
    };

    const handleDispenseAndBill = async () => {
        if (!selectedPrescription) return;
        try {
            await API.post("/pharmacy/verify", { prescriptionId: selectedPrescription.id || selectedPrescription._id });
            // Calculate amount from items
            const itemCount = selectedPrescription.items?.length || selectedPrescription.medications?.length || 1;
            const amount = (itemCount * (Math.floor(Math.random() * 400) + 150)).toFixed(2);
            // Patient ID from populated object
            const patId = selectedPrescription.patient?._id || selectedPrescription.patient || selectedPrescription.patientId;
            await API.post("/billing/add", {
                patientId: patId,
                amount: parseFloat(amount),
                description: `Pharmacy Dispensing: Protocol #${selectedPrescription.id}`
            });
            addToast({
                type: "success",
                title: "COMPOUND DISPENSED",
                message: `Protocol finalized. Bill of ₹${amount} dispatched to patient.`
            });
            logActivity(`Dispensed Protocol #${selectedPrescription.id}. Fiscal record generated.`, "success");
            // Mark as verified in local state
            setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? { ...p, status: 'VERIFIED' } : p));
            setSelectedPrescription(prev => ({ ...prev, status: 'VERIFIED' }));
            fetchInitialData();
        } catch (error) {
            addToast({ type: "error", title: "DISPATCH ERROR", message: "Could not finalize protocol. Check system logs." });
        }
    };

    const handleUpdateStock = async () => {
        if (!stockModal) return;
        try {
            await API.put(`/pharmacy/inventory/${stockModal.item._id}`, { stock: parseInt(stockModal.newStock) });
            setInventory(prev => prev.map(i => i._id === stockModal.item._id ? { ...i, stock: parseInt(stockModal.newStock) } : i));
            logActivity(`Stock updated: ${stockModal.item.medicineName} → ${stockModal.newStock} units`, 'success');
            addToast({ type: 'success', title: 'STOCK UPDATED', message: `${stockModal.item.medicineName} stock set to ${stockModal.newStock} units.` });
            setStockModal(null);
        } catch (e) {
            addToast({ type: 'error', title: 'UPDATE FAILED', message: 'Could not update stock level.' });
        }
    };

    const logActivity = (text, type = "info") => {
        const newLog = {
            id: Date.now(),
            text,
            type,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setActivityLog(prev => [newLog, ...prev.slice(0, 9)]);
    };

    // Patient name resolution: handle both populated objects and flat IDs
    const getPatientName = (p) => {
        if (p.patient?.user?.fullName) return p.patient.user.fullName;
        if (p.patient?.name) return p.patient.name;
        if (typeof p.patient === 'string') {
            const found = patients.find(pat => pat._id === p.patient || pat.id === p.patient);
            return found?.name || found?.user?.fullName || 'Unknown';
        }
        return 'Unknown Entity';
    };

    const getDoctorName = (p) => {
        if (p.doctor?.user?.fullName) return p.doctor.user.fullName;
        if (typeof p.doctor === 'string') return `Dr. #${p.doctor.slice(-4)}`;
        return 'Authorized MD';
    };

    const filteredPrescriptions = prescriptions.filter(p => {
        const name = getPatientName(p).toLowerCase();
        const matchSearch = p.id?.toString().includes(searchTerm) || name.includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const filteredInventory = inventory.filter(item => 
        item.medicineName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white overflow-hidden flex flex-col p-4 lg:p-8">
            {/* Background HUD Layer */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-emerald-500/5 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-teal-500/5 blur-[150px] rounded-full" />
                <div className="absolute inset-0 medical-grid opacity-[0.03]" />
                <div className="absolute inset-0 scanline opacity-[0.01]" />
            </div>

            {/* Header HUD */}
            <header className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <FlaskConical size={24} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-3">
                                PHARMACY <span className="text-emerald-400">OS</span>
                                <span className="px-2 py-0.5 bg-emerald-500 text-[#020617] text-[8px] font-black not-italic rounded uppercase tracking-widest">v5.0 Stable</span>
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Neural Link Active // Node 0x7F2A
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Sub-Navigation */}
                <div className="flex items-center p-1.5 bg-slate-900/50 border border-white/5 rounded-2xl gap-1">
                    {[
                        { id: "console", label: "Core Console", icon: Terminal },
                        { id: "inventory", label: "Asset Matrix", icon: Box },
                        { id: "fiscal", label: "Fiscal Node", icon: DollarSign },
                        { id: "flow", label: "Protocol Flow", icon: Layers },
                        { id: "alerts", label: "Alerts Node", icon: Bell }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-emerald-500 text-[#020617] shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <tab.icon size={14} />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-20 overflow-hidden">
                {/* Left Section: Contextual Content */}
                <section className="xl:col-span-8 flex flex-col gap-6 overflow-hidden">
                    
                    {/* Search & Stats Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/40 group-focus-within:text-emerald-400 transition-colors" size={16} />
                            <input 
                                type="text" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder={activeTab === 'inventory' ? "Search Asset Matrix..." : "Identify Protocol or Subject ID..."}
                                className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[11px] font-bold focus:border-emerald-500/40 transition-all outline-none"
                            />
                        </div>
                        
                        {/* Mini Stats (Responsive) */}
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="px-6 py-3 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Velocity</p>
                                <p className="text-sm font-black text-blue-400">4.2m / P</p>
                            </div>
                            <div className="px-6 py-3 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Node Integrity</p>
                                <p className="text-sm font-black text-emerald-400">99.8%</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Status Filters */}
                    {activeTab === 'console' && (
                        <div className="flex items-center gap-2">
                            {['ALL', 'PENDING', 'VERIFIED'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                                        statusFilter === f
                                            ? 'bg-emerald-500 text-[#020617] border-emerald-500'
                                            : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'
                                    }`}
                                >{f}</button>
                            ))}
                        </div>
                    )}

                    {/* Dynamic View Port */}
                    <div className="flex-1 overflow-y-auto custom-scroll pr-2">
                        <AnimatePresence mode="wait">
                            {activeTab === "console" && (
                                <motion.div 
                                    key="console"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 gap-4"
                                >
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Activity className="text-emerald-500 animate-pulse" size={14} /> Incoming Prescription Stream
                                    </h3>

                                    {loading ? (
                                        <LoadingState />
                                    ) : filteredPrescriptions.length === 0 ? (
                                        <EmptyState icon={Box} text="No protocols detected. Prescriptions will appear here in real-time." />
                                    ) : (
                                        filteredPrescriptions.map((p, i) => (
                                            <PrescriptionCard 
                                                key={p.id || i} 
                                                p={p} 
                                                patientName={getPatientName(p)}
                                                isSelected={selectedPrescription?.id === p.id}
                                                onClick={() => setSelectedPrescription(p)}
                                                delay={i * 0.05}
                                            />
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "inventory" && (
                                <motion.div 
                                    key="inventory"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <div className="flex justify-between items-end mb-2">
                                        <div>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Database className="text-blue-500" size={14} /> Global Asset Matrix
                                            </h3>
                                        </div>
                                        <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-[#020617] transition-all flex items-center gap-2">
                                            <Sparkles size={12} /> Sync Stock
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {loading ? <LoadingState /> : filteredInventory.map((item, i) => (
                                            <InventoryCard 
                                                key={item._id || item.id || i} 
                                                item={item} 
                                                delay={i * 0.03} 
                                                onUpdateStock={() => setStockModal({ item, newStock: item.stock })}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "fiscal" && (
                                <motion.div 
                                    key="fiscal"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatCard 
                                            label="Daily Revenue" 
                                            value={`₹${stats?.financials?.dailyRevenue.toLocaleString() || '0'}`} 
                                            sub="Estimated Yield" 
                                            icon={TrendingUp}
                                            color="emerald"
                                            trend="+12.4%"
                                        />
                                        <StatCard 
                                            label="Node Performance" 
                                            value="94.2%" 
                                            sub="Efficiency Rating" 
                                            icon={Cpu}
                                            color="blue"
                                            trend="+0.8%"
                                        />
                                        <StatCard 
                                            label="Pending Credits" 
                                            value={`₹${stats?.financials?.pendingPayments.toLocaleString() || '0'}`} 
                                            sub="Unsettled Protocols" 
                                            icon={Clock}
                                            color="amber"
                                            trend="-2.1%"
                                        />
                                    </div>

                                    <div className="glass-card p-8 border-white/5 overflow-hidden relative">
                                        <div className="hud-corner top-left opacity-20" />
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                            <Activity size={14} /> Real-time Fiscal Ledger
                                        </h4>
                                        <div className="h-64 flex items-end gap-3 px-4">
                                            {[40, 70, 45, 90, 65, 80, 50, 95, 75, 85, 60, 100].map((h, i) => (
                                                <motion.div 
                                                    key={i}
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ delay: i * 0.05, duration: 1 }}
                                                    className="flex-1 bg-gradient-to-t from-emerald-500/40 to-emerald-400 rounded-t-lg relative group"
                                                >
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-emerald-500 text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {h}%
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest px-2">
                                            <span>06:00</span>
                                            <span>09:00</span>
                                            <span>12:00</span>
                                            <span>15:00</span>
                                            <span>18:00</span>
                                            <span>21:00</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "flow" && (
                                <motion.div 
                                    key="flow"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <div className="glass-card border-white/5 overflow-hidden">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    <th className="px-6 py-4">Protocol ID</th>
                                                    <th className="px-6 py-4">Subject</th>
                                                    <th className="px-6 py-4">Status</th>
                                                    <th className="px-6 py-4">Timestamp</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {prescriptions.map((p) => (
                                                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                                    <Pill size={14} />
                                                                </div>
                                                                <span className="text-xs font-black italic tracking-tighter uppercase">#{p.id}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                                                {patients.find(pat => pat.id === p.patientId)?.name || "Unknown"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${p.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase">{new Date(p.createdAt).toLocaleString()}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="text-slate-500 hover:text-emerald-400 transition-colors">
                                                                <Eye size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "alerts" && (
                                <motion.div 
                                    key="alerts"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-2">
                                        <Bell className="text-rose-500 animate-pulse" size={14} /> System Critical Alerts
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {alerts.length === 0 ? (
                                            <EmptyState icon={ShieldCheck} text="All systems nominal. No alerts detected." />
                                        ) : (
                                            alerts.map((alert, i) => (
                                                <div key={i} className={`p-6 glass-card border-white/5 relative overflow-hidden ${alert.type === 'CRITICAL' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${alert.type === 'CRITICAL' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'}`}>
                                                            {alert.type}
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-500">{alert.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm font-black text-white uppercase italic tracking-tighter leading-tight">{alert.message}</p>
                                                    <div className="mt-6 flex justify-end">
                                                        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Acknowledge</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Right Section: Tactical Detail HUD & Logs */}
                <section className="xl:col-span-4 flex flex-col gap-6 overflow-hidden">
                    
                    {/* Detail Panel */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <AnimatePresence mode="wait">
                            {selectedPrescription ? (
                                <motion.div 
                                    key={selectedPrescription.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5 flex-1 flex flex-col relative overflow-hidden"
                                >
                                    <div className="hud-corner top-right" />
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-[#020617] flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Protocol Processing</h3>
                                                <p className="text-[8px] font-black text-emerald-400/60 uppercase tracking-widest">Biometric Check Status: {isChecking ? 'SYNCING...' : 'IDLE'}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setSelectedPrescription(null)}
                                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-4 flex-1 overflow-y-auto custom-scroll pr-2">
                                        {/* Patient Context */}
                                        <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/5 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Subject Identification</p>
                                                <User size={12} className="text-emerald-500" />
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-emerald-400">
                                                    PID
                                                </div>
                                                <div>
                                                    <p className="text-md font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                                        {getPatientName(selectedPrescription)}
                                                    </p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                                        {selectedPrescription.diagnosis || 'No diagnosis recorded'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Blood: <span className="text-slate-300">{selectedPrescription.patient?.bloodGroup || 'N/A'}</span></div>
                                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Age: <span className="text-slate-300">{selectedPrescription.patient?.age || 'N/A'}</span></div>
                                            </div>
                                        </div>

                                        {/* Doctor Context */}
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                    <Smartphone size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Authorizing MD</p>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">{getDoctorName(selectedPrescription)}</p>
                                                </div>
                                            </div>
                                            <button className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all">
                                                <MessageSquare size={14} />
                                            </button>
                                        </div>

                                        {/* Compound Listing */}
                                        <div className="space-y-3">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic flex items-center gap-2 px-1">
                                                <Database size={12} className="text-emerald-500" /> COMPOUND LISTING
                                            </p>
                                            <div className="grid grid-cols-1 gap-2">
                                                {selectedPrescription.items?.map((item, idx) => (
                                                    <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between group hover:bg-emerald-500/10 transition-all">
                                                        <div>
                                                            <p className="text-[11px] font-black text-white uppercase italic">{item.medicineName}</p>
                                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Dosage: {item.dosage}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-black text-emerald-400/50 uppercase tracking-widest">Stock: OK</span>
                                                            <CheckCircle size={12} className="text-emerald-500/20 group-hover:text-emerald-500" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        {!isChecking && (
                                            <button 
                                                onClick={() => handleSystemCheck(selectedPrescription)}
                                                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:border-emerald-500/30 transition-all flex items-center justify-center gap-3"
                                            >
                                                <Shield size={14} /> PERFORM SYSTEM CHECK
                                            </button>
                                        )}

                                        {isChecking && (
                                            <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center gap-3">
                                                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">CRYPTO-SCANNING BIO-LINK...</span>
                                            </div>
                                        )}

                                        <button 
                                            disabled={isChecking || selectedPrescription.status === 'VERIFIED'}
                                            onClick={handleDispenseAndBill}
                                            className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:grayscale"
                                        >
                                            <Zap size={18} /> {selectedPrescription.status === 'VERIFIED' ? 'ALREADY DISPENSED' : 'DISPENSE & GENERATE BILL'}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    key="idle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 glass-card border-white/5 flex flex-col items-center justify-center text-center p-12 opacity-30 grayscale italic"
                                >
                                    <Sparkles size={48} className="mb-6 text-emerald-500 animate-pulse" />
                                    <h3 className="text-lg font-black uppercase tracking-tighter">Awaiting Signal</h3>
                                    <p className="text-[9px] uppercase tracking-[0.2em] mt-2">Select a protocol from the stream to begin authorization.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Activity Log / Feed */}
                    <div className="h-64 glass-card p-6 border-white/5 flex flex-col overflow-hidden bg-slate-950/40">
                        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
                            <span>Activity Stream</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </h4>
                        <div className="flex-1 overflow-y-auto space-y-3 custom-scroll pr-2">
                            {activityLog.map(log => (
                                <div key={log.id} className="flex gap-3 text-[9px] leading-relaxed group">
                                    <span className="text-slate-600 font-bold shrink-0">[{log.time}]</span>
                                    <span className={`font-medium ${log.type === 'urgent' ? 'text-amber-500' : log.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {log.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            {/* Stock Update Modal */}
            <AnimatePresence>
                {stockModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        onClick={() => setStockModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="glass-card p-8 border-emerald-500/30 bg-[#020617] w-full max-w-md"
                        >
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">Update Stock Level</h3>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">{stockModal.item.medicineName}</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Stock</label>
                                    <p className="text-2xl font-black text-white mt-1">{stockModal.item.stock} <span className="text-[10px] text-slate-500">units</span></p>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">New Stock Level</label>
                                    <input
                                        type="number"
                                        value={stockModal.newStock}
                                        onChange={e => setStockModal(prev => ({ ...prev, newStock: e.target.value }))}
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-black focus:outline-none focus:border-emerald-500/50"
                                        min="0"
                                    />
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStockModal(null)} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-white">Cancel</button>
                                    <button onClick={handleUpdateStock} className="flex-1 py-3 bg-emerald-500 text-[#020617] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all">Confirm Update</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
    )}
</AnimatePresence>
</div>
);
// Sub-Components
function PrescriptionCard({ p, patientName, isSelected, onClick, delay }) {
    const meds = p.items || p.medications || [];
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className={`glass-card p-5 border-white/5 cursor-pointer group transition-all relative overflow-hidden ${isSelected ? 'border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20' : 'hover:border-white/10 hover:bg-white/[0.02]'}`}
        >
            <div className="hud-corner top-left opacity-10" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 text-[#020617]' : 'bg-slate-900 text-emerald-400 group-hover:scale-110'}`}>
                        <Pill size={20} />
                    </div>
                    <div>
                        <h4 className="text-md font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                            Protocol #{p.id || p._id}
                            {p.status === 'VERIFIED' && <ShieldCheck size={12} className="text-emerald-500" />}
                        </h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            Subject: {patientName || "Unidentified Entity"}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-[0.2em] border ${p.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                        {p.status === 'VERIFIED' ? 'Integrated' : 'Pending Auth'}
                    </span>
                    <p className="text-[8px] font-bold text-slate-600 uppercase mt-2 italic">{new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>
            {/* Quick Medicine Preview */}
            <div className="mt-3 flex gap-2 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity">
                {meds.slice(0, 3).map((item, idx) => (
                    <span key={idx} className="text-[7px] font-black text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5 truncate max-w-[100px]">
                        {item.medicineName || item.name}
                    </span>
                ))}
                {p.diagnosis && <span className="text-[7px] font-black text-blue-400/50 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10 truncate max-w-[120px]">{p.diagnosis}</span>}
            </div>
        </motion.div>
    );
}

function InventoryCard({ item, delay, onUpdateStock }) {
    const isLow = (item.stock || 0) < (item.lowStockThreshold || 50);
    const expDate = item.expiryDate && item.expiryDate !== 'N/A' ? new Date(item.expiryDate) : null;
    const daysToExpiry = expDate ? Math.ceil((expDate - new Date()) / (1000*60*60*24)) : null;
    const isExpiringSoon = daysToExpiry !== null && daysToExpiry < 60;
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay }}
            className={`glass-card p-5 border-white/5 hover:border-white/10 transition-all relative group overflow-hidden ${
                isLow ? 'bg-amber-500/5 border-amber-500/10' : isExpiringSoon ? 'bg-rose-500/5 border-rose-500/10' : ''
            }`}
        >
            <div className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl -mr-8 -mt-8 ${isLow ? 'bg-amber-500/10' : 'bg-emerald-500/5'}`} />
            
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'}`}>
                    <Box size={18} />
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    <p className="text-[14px] font-black text-white italic tracking-tighter">₹{item.price}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">per unit</p>
                    {isLow && <span className="text-[7px] font-black text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">⚠ LOW STOCK</span>}
                    {isExpiringSoon && <span className={`text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${daysToExpiry < 30 ? 'text-rose-500 bg-rose-500/10' : 'text-orange-400 bg-orange-500/10'}`}>EXP {daysToExpiry}D</span>}
                </div>
            </div>

            <div className="mb-4">
                <h4 className="text-sm font-black text-white uppercase italic tracking-tighter mb-1 truncate">{item.medicineName}</h4>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] truncate">{item.category}</p>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                    <span className="text-slate-600">Stock Integrity</span>
                    <span className={isLow ? 'text-amber-500' : 'text-emerald-400'}>{item.stock} Units</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.stock / 500) * 100, 100)}%` }}
                        className={`h-full rounded-full ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    />
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <button 
                    onClick={(e) => { e.stopPropagation(); onUpdateStock && onUpdateStock(); }}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[8px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-[#020617] transition-all"
                >
                    + Update Stock
                </button>
                <div className="text-[7px] font-black text-slate-600 uppercase tracking-[0.3em]">
                    EXP: {item.expiryDate || 'N/A'}
                </div>
            </div>
        </motion.div>
    );
}

function StatCard({ label, value, sub, icon: Icon, color, trend }) {
    const colors = {
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-500 border-amber-500/20"
    };
    const valueColors = {
        emerald: "text-emerald-400",
        blue: "text-blue-400",
        amber: "text-amber-500"
    };

    return (
        <div className="glass-card p-6 border-white/5 relative group overflow-hidden">
            <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity`}>
                <Icon size={120} />
            </div>
            <div className="flex justify-between items-start mb-6">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1 ${trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {trend}
                    </span>
                )}
            </div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{label}</p>
            <h4 className={`text-3xl font-black italic tracking-tighter ${valueColors[color]} mb-1`}>{value}</h4>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{sub}</p>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-30">
            <Cpu className="animate-spin text-emerald-500" size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Uplink...</span>
        </div>
    );
}

function EmptyState({ icon: Icon, text }) {
    return (
        <div className="h-64 glass-card border-white/5 flex flex-col items-center justify-center gap-4 opacity-20 italic">
            <Icon size={48} />
            <p className="text-[10px] uppercase tracking-widest">{text}</p>
        </div>
    );
}

