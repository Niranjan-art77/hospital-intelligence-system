import { useEffect, useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

const PillIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></svg>
);

const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>;
const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>;

export default function Pharmacy() {
    const [medicines, setMedicines] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [newMedicine, setNewMedicine] = useState({ medicineName: '', stock: '', price: '', description: '', status: 'In Stock', lowStockThreshold: 100, expiryDate: '' });

    const fetchMedicines = () => {
        API.get("/pharmacy").then(res => setMedicines(res.data)).catch(console.error);
    }

    useEffect(() => {
        fetchMedicines();
    }, []);

    const handleAddMedicine = async (e) => {
        e.preventDefault();
        try {
            await API.post("/pharmacy", newMedicine);
            setIsAddModalOpen(false);
            setNewMedicine({ medicineName: '', stock: '', price: '', description: '', status: 'In Stock' });
            fetchMedicines();
        } catch (error) {
            console.error("Error adding medicine:", error);
        }
    };

    const totalUnits = medicines.reduce((acc, curr) => acc + curr.stock, 0);
    const totalValue = medicines.reduce((acc, curr) => acc + (curr.stock * curr.price), 0);
    const lowStockCount = medicines.filter(m => m.status === 'LOW STOCK' || m.status === 'Low Stock' || (m.stock < (m.lowStockThreshold || 100))).length;
    const outOfStockCount = medicines.filter(m => m.status === 'OUT OF STOCK' || m.status === 'Out of Stock' || m.stock === 0).length;

    const today = new Date();
    const expiringSoon = medicines.filter(m => {
        if (!m.expiryDate) return false;
        const exp = new Date(m.expiryDate);
        const diff = (exp - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
    });

    const criticalAlerts = [
        ...expiringSoon.map(m => ({ type: 'EXPIRY', msg: `${m.medicineName} expires in ${Math.ceil((new Date(m.expiryDate) - today) / (1000 * 60 * 60 * 24))} days!`, color: '#EC4899' })),
        ...medicines.filter(m => m.stock < (m.lowStockThreshold / 2) && m.stock > 0).map(m => ({ type: 'STOCK', msg: `Critical low stock: ${m.medicineName} (${m.stock} units)`, color: '#F59E0B' }))
    ];

    return (
        <motion.div className="flex flex-col gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }}>

            {/* Header Area */}
            <div className="flex items-start justify-between">
                <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#3B82F6] flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer">
                        <PillIcon />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3B82F6] tracking-tight flex items-center gap-2">
                            Dispensary
                        </h1>
                        <p className="text-slate-400 font-medium text-sm mt-1">
                            {medicines.length} medicines &nbsp;·&nbsp; {totalUnits.toLocaleString()} total units &nbsp;·&nbsp; <span className="text-[#EC4899] font-bold">{expiringSoon.length} expiring soon</span>
                        </p>
                    </div>
                </div>

                {/* AI Alerts Banner */}
                {criticalAlerts.length > 0 && (
                    <div className="flex-1 max-w-xl mx-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex items-center gap-4 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 blur-3xl opacity-10"></div>
                        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                            <AlertCircleIcon />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Critical System Alerts</p>
                            <div className="flex gap-4 animate-[scroll_20s_linear_infinite] whitespace-nowrap">
                                {criticalAlerts.map((alert, i) => (
                                    <span key={i} className="text-xs font-bold text-red-200 flex items-center gap-2">
                                        <span style={{ color: alert.color }}>●</span> {alert.msg}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="btn-primary px-6 py-3 rounded-2xl font-black text-sm tracking-widest uppercase shadow-[0_10px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_15px_30px_rgba(139,92,246,0.5)] flex items-center gap-2 transition-all transform hover:-translate-y-1 z-20"
                >
                    <span className="text-xl leading-none">+</span> ADD MEDICINE
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card-nova p-6 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0EA5E9]/20 to-[#8B5CF6]/20 text-[#0EA5E9] flex items-center justify-center border border-[#0EA5E9]/30 group-hover:scale-110 transition-transform shadow-inner">
                            <BoxIcon />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white group-hover:text-[#0EA5E9] transition-colors">{medicines.length}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total Medicines</div>
                        </div>
                    </div>
                </div>

                <div className="card-nova p-6 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EAB308]/20 to-[#F59E0B]/20 text-[#EAB308] flex items-center justify-center border border-[#EAB308]/30 group-hover:scale-110 transition-transform shadow-inner">
                            <AlertCircleIcon />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#EAB308] group-hover:text-yellow-300 transition-colors">{lowStockCount}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Low Stock</div>
                        </div>
                    </div>
                </div>

                <div className="card-nova p-6 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EF4444]/20 to-[#F43F5E]/20 text-[#EF4444] flex items-center justify-center border border-[#EF4444]/30 group-hover:scale-110 transition-transform shadow-inner animate-[pulse_3s_ease-in-out_infinite]">
                            <AlertTriangleIcon />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#EF4444] group-hover:text-red-400 transition-colors">{outOfStockCount}</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Out of Stock</div>
                        </div>
                    </div>
                </div>

                <div className="card-nova p-6 flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10B981]/20 to-[#059669]/20 text-[#10B981] flex items-center justify-center border border-[#10B981]/30 group-hover:scale-110 transition-transform shadow-inner">
                            <DollarIcon />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-[#10B981] group-hover:text-emerald-400 transition-colors">${(totalValue / 1000).toFixed(1)}k</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Inventory Value</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stock Distribution Bar */}
            <div className="mt-6 bg-white/5 p-6 rounded-3xl border border-white/10">
                <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]"></span> Stock Distribution
                </h3>
                <div className="h-6 w-full bg-[#0F172A] rounded-full overflow-hidden flex gap-1 border border-[#1E293B] shadow-inner p-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: '60%' }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 w-full animate-[scanline_2s_linear_infinite]"></div>
                    </motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: '10%' }} transition={{ duration: 1, delay: 0.4 }} className="h-full bg-gradient-to-r from-[#EAB308] to-[#F59E0B] rounded-full"></motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: '5%' }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-gradient-to-r from-[#EF4444] to-[#F43F5E] rounded-full"></motion.div>
                    <motion.div initial={{ width: 0 }} animate={{ width: '25%' }} transition={{ duration: 1, delay: 0.8 }} className="h-full bg-gradient-to-r from-slate-600 to-slate-700 rounded-full"></motion.div>
                </div>
                <div className="flex gap-8 mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest justify-center">
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#3B82F6] shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div> In Stock</div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#EAB308] to-[#F59E0B] shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div> Low Stock</div>
                    <div className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"><div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#EF4444] to-[#F43F5E] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div> Out of Stock</div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4">
                <div className="relative w-full md:w-80 group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#EC4899] z-10" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input type="text" placeholder="Search medicines..." className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#EC4899]/50 transition-all font-medium backdrop-blur-xl relative z-10 shadow-inner placeholder:text-slate-500" />
                </div>
                <div className="flex gap-3 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <button className="px-5 py-2 rounded-xl text-xs font-black tracking-widest uppercase bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-md">All</button>
                    <button className="px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all">In Stock</button>
                    <button className="px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all">Low Stock</button>
                    <button className="px-5 py-2 rounded-xl text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-white hover:bg-white/5 transition-all">Out of Stock</button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <AnimatePresence>
                    {medicines.map((m, i) => {
                        const isOutOfStock = m.status === 'OUT OF STOCK';
                        const isLowStock = m.status === 'LOW STOCK';
                        return (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                onClick={() => setSelectedMedicine(m)}
                                className={`relative p-6 rounded-3xl overflow-hidden transition-all duration-300 group cursor-pointer backdrop-blur-xl ${isOutOfStock ? 'bg-[#EF4444]/10 border border-[#EF4444]/40 shadow-[0_10px_30px_rgba(239,68,68,0.2)] hover:shadow-[0_15px_40px_rgba(239,68,68,0.3)]' : (isLowStock ? 'bg-[#EAB308]/10 border border-[#EAB308]/40 shadow-[0_10px_30px_rgba(234,179,8,0.15)] hover:shadow-[0_15px_40px_rgba(234,179,8,0.25)]' : 'bg-white/5 border border-white/10 hover:border-[#10B981]/50 shadow-lg hover:shadow-[0_15px_40px_rgba(16,185,129,0.2)]')}`}
                            >
                                {/* Background Subtle Glow on Hover */}
                                <div className={`absolute -inset-20 opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-3xl rounded-full bg-gradient-to-br ${isOutOfStock ? 'from-[#EF4444] to-transparent' : (isLowStock ? 'from-[#EAB308] to-transparent' : 'from-[#10B981] via-[#0EA5E9] to-transparent')}`}></div>

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${isOutOfStock ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40' : (m.medicineName.includes('Aspirin') || m.medicineName.includes('Metformin') ? 'bg-gradient-to-br from-[#0EA5E9]/20 to-[#3B82F6]/20 text-[#0EA5E9] border-[#0EA5E9]/40 shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 text-[#EC4899] border-[#EC4899]/40 shadow-[0_0_15px_rgba(236,72,153,0.2)]')}`}>
                                            <PillIcon />
                                        </div>
                                        <div>
                                            <h4 className="text-xl text-white font-black group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-300 transition-all tracking-wide mb-1 drop-shadow-sm">{m.medicineName}</h4>
                                            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold bg-black/20 px-2 py-0.5 rounded-md inline-block border border-white/5">{m.description || 'Analgesic · Tablet'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {expiringSoon.find(e => e.id === m.id) && (
                                            <div className="text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border bg-[#EC4899] text-white border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                                                Expiring
                                            </div>
                                        )}
                                        <div className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg border shadow-sm ${isOutOfStock ? 'text-white bg-[#EF4444] border-[#EF4444] animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : (isLowStock ? 'text-slate-900 bg-[#EAB308] border-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'text-[#10B981] bg-[#10B981]/20 border-[#10B981]/40')}`}>
                                            {isOutOfStock ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock')}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 relative z-10 bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-3 text-[11px] font-black tracking-widest uppercase">
                                        <span className={`text-slate-400 ${isLowStock || isOutOfStock ? 'text-white' : ''}`}>Available: <span className="text-lg text-white ml-1">{m.stock.toLocaleString()}</span></span>
                                        <span className="text-slate-500">Reorder At: {m.lowStockThreshold || 100}</span>
                                    </div>
                                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner border border-white/5 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(m.stock / ((m.lowStockThreshold || 100) * 3) * 100, 100)}%` }}
                                            transition={{ duration: 1.5, type: "spring", bounce: 0.5 }}
                                            className={`h-full rounded-full relative overflow-hidden ${isOutOfStock ? 'bg-gradient-to-r from-[#EF4444] to-[#F43F5E]' : (isLowStock ? 'bg-gradient-to-r from-[#EAB308] to-[#F59E0B]' : 'bg-gradient-to-r from-[#10B981] to-[#34D399]')}`}
                                        >
                                            <div className="absolute inset-0 bg-white/30 w-full animate-[scanline_1.5s_linear_infinite]"></div>
                                        </motion.div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-xs relative z-10">
                                    <div className="flex items-center gap-3 text-slate-300 font-medium bg-white/5 p-2 rounded-xl border border-white/5">
                                        <div className="text-[#10B981]"><DollarIcon /></div> <span className="text-lg font-black">${m.price?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 font-medium bg-white/5 p-2 rounded-xl border border-white/5">
                                        <div className="text-[#8B5CF6]"><BoxIcon /></div> PharmaCorp
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 font-medium bg-white/5 p-2 rounded-xl border border-white/5">
                                        <div className="text-[#0EA5E9]"><AlertCircleIcon /></div> #{m.id * 1234}-B
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-300 font-medium bg-white/5 p-2 rounded-xl border border-white/5">
                                        <div className="text-[#EC4899]"><AlertTriangleIcon /></div> Expires: {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        API.delete(`/pharmacy/${m.id}`).then(fetchMedicines).catch(console.error);
                                    }}
                                    className="absolute bottom-5 right-5 w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all z-20 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0"
                                >
                                    <TrashIcon />
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Add Medicine Modal */}
                {isAddModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
                        onClick={() => setIsAddModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 100, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_20px_60px_rgba(139,92,246,0.3)] glass-panel relative"
                        >
                            <div className="bg-gradient-to-r from-[#8B5CF6]/80 to-[#EC4899]/80 p-8 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3 relative z-10 tracking-wide drop-shadow-md">
                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm"><PillIcon /></div> Add Inventory
                                </h2>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-white/80 hover:text-white transition-colors text-3xl hover:rotate-90 hover:scale-110 relative z-10">✕</button>
                            </div>
                            <form onSubmit={handleAddMedicine} className="p-8 space-y-6">
                                <div className="group">
                                    <label className="text-[11px] text-[#EC4899] uppercase tracking-widest font-black mb-2 block pl-1">Medicine Name</label>
                                    <input type="text" required value={newMedicine.medicineName} onChange={e => setNewMedicine({ ...newMedicine, medicineName: e.target.value })} className="input-tech w-full text-base font-medium transition-colors group-hover:border-[#EC4899]/50 focus:border-[#EC4899]" placeholder="e.g. Amoxicillin" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="group">
                                        <label className="text-[11px] text-[#8B5CF6] uppercase tracking-widest font-black mb-2 block pl-1">Initial Stock</label>
                                        <input type="number" required value={newMedicine.stock} onChange={e => setNewMedicine({ ...newMedicine, stock: e.target.value })} className="input-tech w-full text-base font-medium transition-colors group-hover:border-[#8B5CF6]/50 focus:border-[#8B5CF6]" placeholder="e.g. 500" />
                                    </div>
                                    <div className="group">
                                        <label className="text-[11px] text-[#06B6D4] uppercase tracking-widest font-black mb-2 block pl-1">Unit Price ($)</label>
                                        <input type="number" step="0.01" required value={newMedicine.price} onChange={e => setNewMedicine({ ...newMedicine, price: e.target.value })} className="input-tech w-full text-base font-medium transition-colors group-hover:border-[#06B6D4]/50 focus:border-[#06B6D4]" placeholder="e.g. 12.50" />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="text-[11px] text-[#10B981] uppercase tracking-widest font-black mb-2 block pl-1">Description</label>
                                    <input type="text" value={newMedicine.description} onChange={e => setNewMedicine({ ...newMedicine, description: e.target.value })} className="input-tech w-full text-base font-medium transition-colors group-hover:border-[#10B981]/50 focus:border-[#10B981]" placeholder="e.g. Antibiotic" />
                                </div>
                                <div className="group">
                                    <label className="text-[11px] text-[#F59E0B] uppercase tracking-widest font-black mb-2 block pl-1">Initial Status</label>
                                    <select value={newMedicine.status} onChange={e => setNewMedicine({ ...newMedicine, status: e.target.value })} className="input-tech w-full text-base font-medium bg-[#0f172a] transition-colors group-hover:border-[#F59E0B]/50 focus:border-[#F59E0B] cursor-pointer">
                                        <option value="In Stock">In Stock</option>
                                        <option value="Low Stock">Low Stock</option>
                                        <option value="Out of Stock">Out of Stock</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn-primary w-full mt-8 py-4 rounded-2xl font-black tracking-widest uppercase text-base shadow-[0_10px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.5)] transition-all">
                                    Register Item
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Medicine Details Modal */}
                {selectedMedicine && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md"
                        onClick={() => setSelectedMedicine(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 100, rotateX: 20 }}
                            animate={{ scale: 1, y: 0, rotateX: 0 }}
                            exit={{ scale: 0.8, y: 100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_20px_60px_rgba(16,185,129,0.2)] glass-panel relative"
                        >
                            <div className="bg-gradient-to-r from-[#10B981]/80 to-[#0EA5E9]/80 p-10 flex justify-between items-start relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                                <div className="flex gap-8 items-center relative z-10">
                                    <div className="w-24 h-24 rounded-3xl bg-white p-1 shadow-2xl rotate-3">
                                        <div className="w-full h-full bg-slate-100 rounded-[20px] flex items-center justify-center text-5xl text-[#10B981]">
                                            <PillIcon />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-4xl font-black text-white mb-2 tracking-wide drop-shadow-md">{selectedMedicine.medicineName}</h2>
                                        <span className="bg-white/20 text-white font-bold px-4 py-1.5 rounded-xl uppercase tracking-widest text-sm backdrop-blur-sm border border-white/30">{selectedMedicine.description || 'Medical Item'}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedMedicine(null)} className="text-white/80 hover:text-white transition-colors text-3xl hover:rotate-90 hover:scale-110 relative z-10 p-2 border-2 border-transparent hover:border-white/20 rounded-xl">✕</button>
                            </div>

                            <div className="p-10 bg-slate-900/50">
                                <h4 className="text-xs text-slate-400 uppercase tracking-widest font-black mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> Inventory Data Matrix
                                </h4>
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center shadow-inner hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Current Stock</p>
                                        <p className="text-4xl font-black text-white">{selectedMedicine.stock}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center shadow-inner hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">Unit Price</p>
                                        <p className="text-4xl font-black text-[#10B981]">${selectedMedicine.price?.toFixed(2) || '0.00'}</p>
                                    </div>
                                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col items-center text-center shadow-inner hover:bg-white/10 transition-colors">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-3">System Status</p>
                                        <p className={`text-sm font-black mt-2 px-4 py-2 rounded-xl uppercase tracking-widest border border-current shadow-lg ${selectedMedicine.status.toUpperCase() === 'OUT OF STOCK' ? 'bg-[#EF4444] text-white animate-pulse' : (selectedMedicine.status.toUpperCase() === 'LOW STOCK' ? 'bg-[#EAB308] text-slate-900 animate-pulse' : 'bg-[#10B981]/20 text-[#10B981]')}`}>
                                            {selectedMedicine.status}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
