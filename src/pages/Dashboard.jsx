import { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend as ChartLegend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { 
  Activity, Sparkles, TrendingUp, Droplets, Heart, 
  Zap, Thermometer, Users, AlertTriangle, Calendar, 
  Clock, Bed, Pill, BarChart2, Shield, Globe, 
  Cpu, Radar, Crosshair, ChevronRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, ChartLegend, Filler
);

export default function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ 
    totalPatients: 0, 
    highRiskCount: 0, 
    averageBmi: 0, 
    averageSugar: 0, 
    totalBeds: 120, 
    availableBeds: 45, 
    diseaseDistribution: [], 
    doctorPerformance: [], 
    monthlyTrends: [] 
  });
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pRes, sRes, dRes, aRes, phRes, iRes] = await Promise.all([
        API.get("/patients"),
        API.get("/analytics/dashboard"),
        API.get("/doctors"),
        API.get("/appointments"),
        API.get("/pharmacy"),
        API.get("/insights")
      ]);
      setPatients(pRes.data);
      setStats(sRes.data);
      setDoctors(dRes.data);
      setAppointments(aRes.data);
      setPharmacy(phRes.data);
      setInsights(iRes.data);
    } catch (e) {
      console.error("Link Failure", e);
    }
  };

  return (
    <div className="min-h-screen medical-grid p-6 md:p-10 space-y-10 selection:bg-blue-500/30 selection:text-white">
      {/* Cinematic Header */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.5em]">Global Hospital Operations</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
            NOVA <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">COMMAND</span> CENTER
          </h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Real-time Telemetry Active</span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">12 Active Nodes</span>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="px-8 py-4 glass-card bg-blue-500/5 border-blue-500/20 flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Optimization</span>
            <span className="text-sm font-black text-white uppercase tracking-tighter">Peak Performance</span>
          </div>
          <div className="w-14 h-14 glass-card flex items-center justify-center text-blue-400 group cursor-pointer hover:bg-blue-500/10 transition-all">
            <Cpu className="w-6 h-6 group-hover:rotate-180 transition-all duration-700" />
          </div>
        </div>
      </header>

      {/* High-Level Tactical Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Subjects", val: patients.length, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Critical Alerts", val: stats.highRiskCount, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10", pulse: true },
          { label: "Operational Beds", val: `${stats.totalBeds - stats.availableBeds}/${stats.totalBeds}`, icon: Bed, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Stock Integrity", val: "94%", icon: Pill, color: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((m, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass-card p-8 border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${m.bg} blur-3xl opacity-20 -mr-16 -mt-16 group-hover:opacity-40 transition-all`} />
            <m.icon className={`w-10 h-10 ${m.color} mb-6 ${m.pulse ? 'animate-pulse' : ''}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
            <div className="text-3xl font-black text-white tracking-tighter">{m.val}</div>
            <div className="mt-4 flex items-center gap-2 opacity-30">
              <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full ${m.bg} w-2/3`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Real-time Visualization */}
        <div className="xl:col-span-8 space-y-8">
          <div className="glass-card p-10 border-blue-500/20 relative overflow-hidden h-[500px] flex flex-col">
            <div className="hud-corner top-left" />
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                  <Radar className="w-5 h-5 text-blue-400 animate-spin-slow" /> Population Throughput Index
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Dynamic Hospital Flow & Resource Usage</p>
              </div>
              <div className="flex gap-2">
                {['24H', '7D', '30D'].map(t => (
                  <button key={t} className="px-4 py-2 text-[10px] font-black text-slate-500 border border-white/5 rounded-lg hover:border-blue-500/50 hover:text-white transition-all uppercase tracking-widest">{t}</button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full relative">
              <Line 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } } }
                  },
                  elements: { line: { tension: 0.4, borderWidth: 4, borderColor: '#3b82f6' }, point: { radius: 0, hoverRadius: 6 } }
                }}
                data={{
                  labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                  datasets: [{
                    data: [65, 59, 80, 81, 56, 55],
                    fill: true,
                    backgroundColor: (context) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                      gradient.addColorStop(0, 'rgba(59,130,246,0.3)');
                      gradient.addColorStop(1, 'rgba(59,130,246,0)');
                      return gradient;
                    },
                  }]
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 border-purple-500/20">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <BarChart2 className="w-4 h-4 text-purple-400" /> Disease Spectrum
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Pie 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' }, usePointStyle: true } } }
                  }}
                  data={{
                    labels: ['Cardio', 'Neuro', 'Resp', 'Trauma'],
                    datasets: [{
                      data: [30, 20, 25, 25],
                      backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e'],
                      borderWidth: 0
                    }]
                  }}
                />
              </div>
            </div>

            <div className="glass-card p-8 border-emerald-500/20">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
                <Crosshair className="w-4 h-4 text-emerald-400" /> Specialist Load
              </h3>
              <div className="h-64">
                <Bar 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { display: false } },
                      y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10, weight: 'bold' } } }
                    }
                  }}
                  data={{
                    labels: ['Dr. Sarah', 'Dr. Chen', 'Dr. Smith'],
                    datasets: [{
                      data: [85, 72, 91],
                      backgroundColor: '#10b981',
                      borderRadius: 10,
                      barThickness: 20
                    }]
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Intelligence Feed */}
        <div className="xl:col-span-4 space-y-8">
          {/* System Integrity Widget */}
          <div className="glass-card p-8 bg-blue-600/10 border-blue-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 scanline opacity-10" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-widest">Neural AI Status</h4>
                <p className="text-[10px] text-blue-400/60 font-bold uppercase tracking-widest">Version 4.2.1-Stable</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Diagnostic Engine', status: 'Optimal' },
                { label: 'Triage Prediction', status: 'Calibrating' },
                { label: 'Inventory Logic', status: 'Online' }
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{s.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* High Priority Alerts */}
          <div className="glass-card p-8 border-rose-500/20 relative">
            <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Triage Priority 1
            </h3>
            <div className="space-y-4">
              {patients.filter(p => p.riskLevel === 'HIGH').slice(0, 3).map((p, i) => (
                <div key={i} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group hover:bg-rose-500/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="P" className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10" />
                    <div>
                      <p className="text-xs font-black text-white uppercase">{p.name}</p>
                      <p className="text-[9px] font-bold text-rose-400/60 uppercase tracking-widest">Vitals Unstable</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-500 opacity-30 group-hover:opacity-100 transition-all" />
                </div>
              ))}
              {patients.filter(p => p.riskLevel === 'HIGH').length === 0 && (
                <div className="text-center py-8 opacity-20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Zero Critical Vectors</span>
                </div>
              )}
            </div>
            <button className="w-full mt-6 py-3 border border-dashed border-white/10 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
              View Detailed Analytics
            </button>
          </div>

          {/* AI Predictive Insights */}
          <div className="glass-card p-8 border-indigo-500/20 bg-indigo-500/5">
            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Predictive Analysis
            </h3>
            <div className="space-y-4">
              {insights.slice(0, 2).map((ins, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-indigo-500/20">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  <p className="text-[10px] font-bold text-slate-300 leading-relaxed mb-2">
                    {ins.message}
                  </p>
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Source: {ins.source || 'Neural Core'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02] z-[100]" />
    </div>
  );
}
