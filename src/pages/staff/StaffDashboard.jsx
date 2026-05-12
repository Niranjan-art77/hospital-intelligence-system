import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Bed, ClipboardList, Clock, 
  CheckCircle, AlertTriangle, TrendingUp,
  Plus, Calendar, Box, Briefcase, Play, 
  ArrowRight, Filter, ChevronRight
} from 'lucide-react';
import API from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function StaffDashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Sterilize ICU Room 4', priority: 'HIGH', status: 'TODO', assignee: 'Nurse Joy' },
    { id: 2, title: 'Morning Med Rounds - Sector B', priority: 'MEDIUM', status: 'IN_PROGRESS', assignee: 'Staff_A' },
    { id: 3, title: 'Discharge Patient #882', priority: 'HIGH', status: 'TODO', assignee: 'Admin_Staff' }
  ]);

  // Feature 7: Predictive Bed Occupancy
  const bedPredictionData = [
    { name: 'Mon', occupied: 80, predicted: 85 },
    { name: 'Tue', occupied: 75, predicted: 82 },
    { name: 'Wed', occupied: 90, predicted: 88 },
    { name: 'Thu', occupied: 85, predicted: 92 },
    { name: 'Fri', occupied: 95, predicted: 98 },
    { name: 'Sat', occupied: 70, predicted: 75 },
    { name: 'Sun', occupied: 65, predicted: 70 }
  ];

  return (
    <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em]">Hospital Operations & Logistics</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2 uppercase">
            Staff <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Operations</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time Task & Bed Logistics Management</p>
        </motion.div>

        <div className="flex gap-4">
            <button className="px-6 py-4 glass-card bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all">
                New Shift Handover
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Feature 5: Staff Task Board */}
        <div className="xl:col-span-8 space-y-8">
            <div className="glass-card p-8 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                        <ClipboardList className="w-5 h-5 text-emerald-400" /> Operational Task Board
                    </h3>
                    <div className="flex gap-2">
                        <button className="p-2 glass-card hover:bg-white/5 transition-all text-slate-400"><Filter size={16} /></button>
                        <button className="p-2 glass-card hover:bg-white/5 transition-all text-emerald-400"><Plus size={16} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                        <div key={status} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{status.replace('_', ' ')}</span>
                                <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-full">{tasks.filter(t => t.status === status).length}</span>
                            </div>
                            {tasks.filter(t => t.status === status).map(task => (
                                <motion.div 
                                    key={task.id}
                                    whileHover={{ y: -3 }}
                                    className="p-5 glass-card bg-slate-900/60 border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded ${task.priority === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                            {task.priority}
                                        </span>
                                        <Clock size={12} className="text-slate-600" />
                                    </div>
                                    <h4 className="text-sm font-black text-white mb-4 leading-tight group-hover:text-emerald-400 transition-colors">{task.title}</h4>
                                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-white border border-white/10">
                                                {task.assignee[0]}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{task.assignee}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                            {tasks.filter(t => t.status === status).length === 0 && (
                                <div className="h-24 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Queue Empty</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature 7: Predictive Bed Occupancy */}
            <div className="glass-card p-8 border-teal-500/20">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                            <TrendingUp className="w-5 h-5 text-teal-400" /> Bed Occupancy Forecast
                        </h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Neural Prediction for capacity management</p>
                    </div>
                </div>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={bedPredictionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Bar dataKey="occupied" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="predicted" fill="#10b981" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Feature 9: Automated Discharge Tracker */}
        <div className="xl:col-span-4 space-y-8">
            <div className="glass-card p-8 border-teal-500/20 bg-teal-500/5 relative overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-400" /> Active Discharge Protocol
                </h3>
                <div className="space-y-6">
                    {[
                        { step: 'Financial Clearance', status: 'DONE', patient: 'Subject #882' },
                        { step: 'Medical Final Sign-off', status: 'PENDING', patient: 'Subject #882' },
                        { step: 'Pharmacy Handover', status: 'TODO', patient: 'Subject #882' },
                        { step: 'Post-Care Briefing', status: 'TODO', patient: 'Subject #882' }
                    ].map((step, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${step.status === 'DONE' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 text-slate-700'}`}>
                                    {step.status === 'DONE' ? <CheckCircle size={12} /> : <span className="text-[8px] font-black">{i+1}</span>}
                                </div>
                                {i < 3 && <div className="w-0.5 flex-1 bg-white/5 my-1" />}
                            </div>
                            <div className="flex-1 pb-4">
                                <p className={`text-xs font-black uppercase tracking-widest ${step.status === 'PENDING' ? 'text-white animate-pulse' : 'text-slate-400'}`}>
                                    {step.step}
                                </p>
                                <p className="text-[10px] text-slate-600 font-bold mt-1">{step.patient}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-4 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-teal-500/30 transition-all">
                    Initialize New Discharge
                </button>
            </div>

            <div className="glass-card p-8 border-blue-500/20">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Critical Bed Matrix</h3>
                <div className="space-y-4">
                    {[
                        { wing: 'Wing A (ICU)', total: 20, occupied: 18, risk: 'Critical' },
                        { wing: 'Wing B (Emergency)', total: 15, occupied: 12, risk: 'High' },
                        { wing: 'Wing C (General)', total: 50, occupied: 25, risk: 'Low' }
                    ].map((wing, i) => (
                        <div key={i} className="p-4 glass-card bg-white/5 border-white/5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-white uppercase">{wing.wing}</span>
                                <span className={`text-[8px] font-black uppercase ${wing.risk === 'Critical' ? 'text-rose-500' : 'text-emerald-500'}`}>{wing.risk}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                <div className={`h-full bg-teal-500`} style={{ width: `${(wing.occupied/wing.total)*100}%` }} />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-[9px] font-bold text-slate-500">{wing.occupied} / {wing.total} Beds</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
