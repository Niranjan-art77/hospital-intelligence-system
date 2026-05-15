import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Globe, Cpu, Lock, 
  Terminal, Server, Database, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [systemHealth, setSystemHealth] = useState(98.4);
  const [activeNodes, setActiveNodes] = useState(12);

  useEffect(() => {
    // Mocking real-time logs for Feature 10 (Security Access Logs)
    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        event: ['AUTH_SUCCESS', 'DATA_ACCESS', 'CONFIG_CHANGE', 'NODE_SYNC'][Math.floor(Math.random() * 4)],
        user: ['Admin_Root', 'Dr_Smith', 'Nurse_Joy', 'Pharmacy_Core'][Math.floor(Math.random() * 4)],
        status: 'SECURE'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">System Governance & Infrastructure</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Control</span> Panel
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Master Surveillance & Security Node v9.2.0</p>
        </motion.div>

        <div className="flex items-center gap-6 px-8 py-4 glass-card bg-cyan-500/5 border-cyan-500/20">
            <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Encryption</span>
                <span className="text-sm font-black text-cyan-400">AES-256 ACTIVE</span>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Feature 6: Facility Energy Monitor */}
        <div className="xl:col-span-8 space-y-8">
            <div className="glass-card p-8 border-cyan-500/20">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                            <Zap className="w-5 h-5 text-amber-400" /> INFRASTRUCTURE ENERGY LOAD
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hospital-wide power distribution per sector</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-white">42.8 <span className="text-xs text-slate-500">MWh</span></span>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Efficiency: 94%</div>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                            { time: '00:00', load: 30 }, { time: '04:00', load: 25 }, { time: '08:00', load: 45 },
                            { time: '12:00', load: 60 }, { time: '16:00', load: 55 }, { time: '20:00', load: 40 }
                        ]}>
                            <defs>
                                <linearGradient id="energyG" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="load" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#energyG)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'CPU Cluster', val: '24%', icon: Cpu, color: 'text-blue-400' },
                    { label: 'Database I/O', val: '1.2ms', icon: Database, color: 'text-purple-400' },
                    { label: 'Net Throughput', val: '8.4 Gbps', icon: Globe, color: 'text-cyan-400' }
                ].map((stat, i) => (
                    <div key={i} className="glass-card p-6 border-white/5">
                        <stat.icon className={`w-8 h-8 ${stat.color} mb-4`} />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                        <div className="text-2xl font-black text-white">{stat.val}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Feature 10: Security Access Logs */}
        <div className="xl:col-span-4 space-y-8">
            <div className="glass-card p-8 border-rose-500/20 bg-rose-500/5 relative overflow-hidden">
                <div className="hud-corner top-right opacity-20" />
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-rose-500" /> TACTICAL SECURITY LOGS
                </h3>
                <div className="space-y-4">
                    {logs.map(log => (
                        <div key={log.id} className="font-mono text-[10px] flex items-start gap-3 p-3 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-slate-600">[{log.timestamp}]</span>
                            <span className="text-cyan-400 font-bold">{log.event}</span>
                            <span className="text-slate-400">BY</span>
                            <span className="text-white">{log.user}</span>
                            <span className="ml-auto text-emerald-500">●</span>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-center py-10 text-slate-600 uppercase text-[10px] font-bold animate-pulse">Scanning Neural Network...</div>}
                </div>
            </div>

            <div className="glass-card p-8 border-emerald-500/20">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Server Node Status</h3>
                <div className="space-y-4">
                    {['Main_Datacenter', 'Backup_Node_Alpha', 'Biometric_Core', 'API_Gateway'].map((node, i) => (
                        <div key={i} className="flex items-center justify-between p-4 glass-card bg-white/5 border-white/5">
                            <div className="flex items-center gap-3">
                                <Server className="w-4 h-4 text-slate-500" />
                                <span className="text-xs font-black text-white uppercase tracking-tighter">{node}</span>
                            </div>
                            <span className="text-[9px] font-black text-emerald-400 uppercase px-2 py-1 bg-emerald-400/10 rounded">Online</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
