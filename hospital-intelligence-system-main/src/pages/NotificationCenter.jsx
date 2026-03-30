import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../services/api';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get('/notifications').then(res => {
            setNotifications(res.data);
            setLoading(false);
        }).catch(() => {
            // Simulated data if API fails
            setNotifications([
                { id: 1, type: 'CRITICAL', title: 'Life Support Alert', message: 'ICU Bed 04: Heart rate anomaly detected. Rapid response requested.', time: '2 mins ago', isRead: false },
                { id: 2, type: 'WARNING', title: 'Inventory Shortage', message: 'Amoxicillin stock dropped below 15%. Reorder initiated.', time: '15 mins ago', isRead: false },
                { id: 3, type: 'INFO', title: 'System Update', message: 'Nova AI Kernel upgraded to v4.2.0. Neural diagnostic speed +12%.', time: '1 hour ago', isRead: true },
                { id: 4, type: 'CRITICAL', title: 'Emergency Dispatch', message: 'Ambulance AMS-02 dispatched to Sector 7-G. Estimated arrival: 6 mins.', time: '3 hours ago', isRead: true },
            ]);
            setLoading(false);
        });
    }, []);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const filtered = filter === 'ALL' ? notifications : notifications.filter(n => n.type === filter);

    const typeColors = {
        CRITICAL: { bg: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', icon: '🚨' },
        WARNING: { bg: '#f59e0b', glow: 'rgba(245, 158, 11, 0.3)', icon: '⚠️' },
        INFO: { bg: '#3b82f6', glow: 'rgba(59, 130, 246, 0.3)', icon: 'ℹ️' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2"
        >
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#F43F5E] via-[#FB923C] to-[#EAB308] tracking-tight">
                        Notification Command
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        High-priority telemetry and system-wide clinical alerts.
                    </p>
                </div>
                <button
                    onClick={markAllRead}
                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors border-b border-dashed border-slate-700 pb-1"
                >
                    Clear All Frequency
                </button>
            </div>

            {/* Filter Hub */}
            <div className="flex gap-4 mb-8">
                {['ALL', 'CRITICAL', 'WARNING', 'INFO'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${filter === f ? 'bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/20'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Inbox List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <div className="py-20 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-slate-500 font-black uppercase tracking-widest">No active alerts on this frequency</p>
                        </div>
                    ) : (
                        filtered.map(n => (
                            <motion.div
                                key={n.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group relative p-6 rounded-3xl border transition-all ${n.isRead ? 'bg-white/20 border-white/5 opacity-60' : 'bg-white/5 border-white/10 hover:border-white/25'} overflow-hidden shadow-xl`}
                            >
                                {!n.isRead && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1.5"
                                        style={{ background: typeColors[n.type].bg, boxShadow: `0 0 15px ${typeColors[n.type].glow}` }}
                                    ></div>
                                )}

                                <div className="flex justify-between items-start gap-6 relative z-10">
                                    <div className="flex gap-5">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-inner"
                                            style={{ backgroundColor: `${typeColors[n.type].bg}15` }}
                                        >
                                            {typeColors[n.type].icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-black text-white">{n.title}</h3>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${n.isRead ? 'bg-white/5 text-slate-500' : 'text-white'}`} style={{ backgroundColor: n.isRead ? '' : typeColors[n.type].bg }}>
                                                    {n.type}
                                                </span>
                                            </div>
                                            <p className="text-slate-300 font-medium text-sm leading-relaxed max-w-2xl">
                                                {n.message}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-4">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{n.time}</div>
                                        <button
                                            onClick={() => deleteNotification(n.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Hover Shine */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
