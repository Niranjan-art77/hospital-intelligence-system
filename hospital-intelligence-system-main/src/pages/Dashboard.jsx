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

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Title, Tooltip, ChartLegend, Filler
);
import { Activity, Sparkles, TrendingUp, Droplets, Heart, Zap, Thermometer, Users, AlertTriangle, Calendar, Clock, Bed, Pill, BarChart2 } from 'lucide-react';

const mockVitalData = [
  { time: '08:00', heartRate: 72, oxygen: 98 },
  { time: '10:00', heartRate: 75, oxygen: 98 },
  { time: '12:00', heartRate: 85, oxygen: 97 },
  { time: '14:00', heartRate: 80, oxygen: 98 },
  { time: '16:00', heartRate: 78, oxygen: 99 },
  { time: '18:00', heartRate: 76, oxygen: 98 },
  { time: '20:00', heartRate: 73, oxygen: 99 },
];

const mockAdmissionData = [
  { day: 'Mon', admissions: 12, discharges: 8 },
  { day: 'Tue', admissions: 19, discharges: 15 },
  { day: 'Wed', admissions: 15, discharges: 12 },
  { day: 'Thu', admissions: 22, discharges: 18 },
  { day: 'Fri', admissions: 25, discharges: 20 },
  { day: 'Sat', admissions: 18, discharges: 15 },
  { day: 'Sun', admissions: 14, discharges: 10 },
];

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
  const [healthScore, setHealthScore] = useState(84);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pharmacy, setPharmacy] = useState([]);
  const [insights, setInsights] = useState([]);

  // Dynamic vitals for the dashboard telemtry simulation
  const [vitalData, setVitalData] = useState(() => {
    const init = [];
    const now = new Date();
    for (let i = 20; i >= 0; i--) {
      init.push({
        time: new Date(now.getTime() - i * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        heartRate: 70 + Math.floor(Math.random() * 15),
        oxygen: 96 + Math.floor(Math.random() * 4),
        sugar: 100 + Math.floor(Math.random() * 10 - 5)
      });
    }
    return init;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setVitalData(prev => {
        const newData = [...prev.slice(1)];
        const last = prev[prev.length - 1];
        newData.push({
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          heartRate: last.heartRate + Math.floor(Math.random() * 7 - 3),
          oxygen: Math.min(100, Math.max(90, last.oxygen + Math.floor(Math.random() * 3 - 1))),
          sugar: last.sugar + Math.floor(Math.random() * 5 - 2.5)
        });
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    API.get("/patients").then(res => setPatients(res.data)).catch(console.error);
    API.get("/analytics/dashboard").then(res => setStats(res.data)).catch(console.error);
    API.get("/doctors").then(res => setDoctors(res.data)).catch(console.error);
    API.get("/appointments").then(res => setAppointments(res.data)).catch(console.error);
    API.get("/pharmacy").then(res => setPharmacy(res.data)).catch(console.error);
    API.get("/insights").then(res => setInsights(res.data)).catch(console.error);
  }, []);

  return (
    <motion.div className="flex flex-col gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}>
      {/* Premium Header */}
      <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 transform -rotate-6 hover:rotate-0 transition-all duration-500 cursor-pointer">
            <Sparkles size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter mb-1 flex items-center gap-3">
              Health <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Command Center</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} className="text-indigo-400" />
              Live Population Intelligence â€¢ 12 Active Nodes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {doctors.slice(0, 3).map((d, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden shadow-lg">
                <img src={d.profileImage} alt={d.name} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="h-10 w-[1px] bg-white/10 mx-2"></div>
          <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl backdrop-blur-xl shadow-lg group cursor-pointer hover:bg-indigo-500/20 transition-all">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400">System Optimized</span>
          </div>
        </div>
      </div>

      <h2 className="text-[#EC4899] text-xs font-black tracking-widest uppercase flex items-center gap-2 mb-2 ml-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
        Hospital Intelligence Overview
      </h2>

      {/* Command Center Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Patients", val: stats.totalPatients || patients.length, color: "from-blue-500 to-indigo-600", icon: <Users size={24} />, shadow: "shadow-blue-500/20" },
          { title: "Critical Alerts", val: stats.highRiskCount, color: "from-rose-500 to-pink-600", icon: <AlertTriangle size={24} />, shadow: "shadow-rose-500/20", pulse: true },
          { title: "Specialists", val: doctors.length, color: "from-purple-500 to-fuchsia-600", icon: <Activity size={24} />, shadow: "shadow-purple-500/20" },
          { title: "Pending Appts", val: appointments.length, color: "from-emerald-500 to-teal-600", icon: <Calendar size={24} />, shadow: "shadow-emerald-500/20" },
          { title: "Avg Wait Time", val: "12m", color: "from-amber-400 to-orange-500", icon: <Clock size={24} />, shadow: "shadow-amber-500/20" },
          { title: "Bed Occupancy", val: `${stats.totalBeds - stats.availableBeds}/${stats.totalBeds}`, color: "from-indigo-500 to-blue-600", icon: <Bed size={24} />, shadow: "shadow-indigo-500/20" },
          { title: "Critical Stock", val: pharmacy.filter(m => m.stock < 20).length, color: "from-rose-500 to-red-600", icon: <Pill size={24} />, shadow: "shadow-rose-500/20", pulse: true },
          { title: "Avg Health Score", val: healthScore, color: "from-cyan-400 to-blue-500", icon: <TrendingUp size={24} />, shadow: "shadow-cyan-500/20" }
        ].map((m, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`group relative p-6 bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden transition-all duration-300 hover:border-white/20 ${m.shadow}`}
          >
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${m.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-lg ${m.pulse ? 'animate-pulse' : ''}`}>
                {m.icon}
              </div>
            </div>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">{m.title}</p>
            <h4 className="text-3xl font-black text-white mt-1">{m.val}</h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (Main Analytics) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Health Index & Live Telemetry Horizontal Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Health Score Meter */}
            <div className="group p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden flex flex-col items-center justify-center text-center transition-all duration-500 hover:border-indigo-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 self-start flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                Population Health Index
              </h3>
              
              <div className="relative w-52 h-52 mb-6 group-hover:scale-105 transition-transform duration-500">
                <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(79,70,229,0.1)]">
                  <circle cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="14" fill="transparent" className="text-slate-800/50" />
                  <motion.circle
                    cx="104" cy="104" r="92" stroke="currentColor" strokeWidth="14" fill="transparent"
                    strokeDasharray={578.05}
                    initial={{ strokeDashoffset: 578.05 }}
                    animate={{ strokeDashoffset: 578.05 - (578.05 * healthScore) / 100 }}
                    transition={{ duration: 2.5, ease: "circOut" }}
                    className="text-indigo-500"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.6))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white tracking-tighter">{healthScore}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Excellent</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 w-full mt-4">
                {[
                  { label: 'Risk Scale', val: 'Minimal', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                  { label: 'Stability', val: 'High', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                  { label: 'Weekly Delta', val: '+5.2%', color: 'text-blue-400', bg: 'bg-blue-400/10' }
                ].map(item => (
                  <div key={item.label} className={`${item.bg} p-3 rounded-2xl border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-all`}>
                    <p className="text-[8px] font-black uppercase text-slate-500 tracking-tighter mb-1">{item.label}</p>
                    <p className={`text-[11px] font-black ${item.color}`}>{item.val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Triage Telemetry */}
            <div className="p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:border-emerald-500/30">
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 blur-[60px] rounded-full"></div>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
                  <Activity size={12} className="text-emerald-500" />
                  Real-time Vital Streams
                </h3>
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Live Sensor Feed</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Cardiac Rate', val: vitalData[vitalData.length-1]?.heartRate || 72, unit: 'BPM', icon: <Heart className="text-pink-500" size={18} />, status: 'Optimal', trend: 'up' },
                  { label: 'Oxygen Saturation', val: vitalData[vitalData.length-1]?.oxygen || 98, unit: '%', icon: <Droplets className="text-blue-500" size={18} />, status: 'Optimal', trend: 'stable' },
                  { label: 'Blood Glucose', val: stats.averageSugar || 105, unit: 'mg/dL', icon: <Zap className="text-amber-500" size={18} />, status: 'Normal', trend: 'down' },
                  { label: 'Core Temp', val: '36.8', unit: 'Â°C', icon: <Thermometer className="text-fuchsia-500" size={18} />, status: 'Stable', trend: 'stable' }
                ].map((sensor, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[0.85rem] bg-slate-800/50 flex items-center justify-center text-white shadow-inner group-hover/item:scale-110 transition-transform">
                        {sensor.icon}
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">{sensor.label}</p>
                        <h5 className="text-xl font-black text-white flex items-baseline gap-1.5">
                          {sensor.val} <span className="text-[10px] text-slate-500 font-black">{sensor.unit}</span>
                        </h5>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="text-[8px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">{sensor.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operational Area Graph */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden transition-all duration-500 hover:border-indigo-500/20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-3">
                  <BarChart2 className="text-indigo-400" size={20} /> Total Operational Throughput
                </h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1.5">Population Flow & Admission Telemetry</p>
              </div>
            </div>

            <div className="h-80 w-full relative">
                <Line 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#64748B',
                        bodyColor: '#fff',
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                          label: function(context) {
                            return `${context.parsed.y} Flow Index`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: { display: false },
                      y: { display: false, min: 50, max: 100 }
                    },
                    interaction: { mode: 'index', intersect: false },
                    elements: { line: { tension: 0.4 } }
                  }}
                  data={{
                    labels: vitalData.map(d => d.time),
                    datasets: [
                      {
                        fill: true,
                        label: 'Throughput',
                        data: vitalData.map(d => d.heartRate),
                        borderColor: '#6366f1',
                        backgroundColor: (context) => {
                          const ctx = context.chart.ctx;
                          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                          gradient.addColorStop(0, 'rgba(99,102,241,0.5)');
                          gradient.addColorStop(1, 'rgba(99,102,241,0)');
                          return gradient;
                        },
                        borderWidth: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: '#6366f1',
                        pointBorderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 6
                      }
                    ]
                  }}
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Disease Distribution Pie Chart */}
            <div className="glass-panel p-8 overflow-hidden relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem]">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                <BarChart2 size={16} className="text-indigo-400" />
                Population Disease Spectrum
              </h3>
              <div className="h-72 w-full drop-shadow-2xl relative flex items-center justify-center">
                  <Pie
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: { color: '#94a3b8', font: { size: 10, weight: 'bold' }, usePointStyle: true, padding: 20 }
                        },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 10, displayColors: false }
                      },
                      cutout: '70%',
                      borderWidth: 0
                    }}
                    data={{
                      labels: (stats.diseaseDistribution?.length > 0 ? stats.diseaseDistribution : [{ label: 'Normal', value: 100 }]).map(d => d.label),
                      datasets: [{
                        data: (stats.diseaseDistribution?.length > 0 ? stats.diseaseDistribution : [{ label: 'Normal', value: 100 }]).map(d => d.value),
                        backgroundColor: ['#6366f1', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'],
                        hoverOffset: 4,
                        borderWidth: 0
                      }]
                    }}
                  />
              </div>
            </div>

            {/* Doctor Performance Bar Chart */}
            <div className="glass-panel p-8 overflow-hidden relative bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem]">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-8">
                <Users size={16} className="text-purple-400" />
                Specialist Efficiency Metrics
              </h3>
              <div className="h-72 w-full drop-shadow-2xl relative">
                  <Bar
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      indexAxis: 'y',
                      plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#fff', bodyColor: '#fff', padding: 12, cornerRadius: 10 }
                      },
                      scales: {
                        x: { display: false },
                        y: { 
                          grid: { display: false, drawBorder: false }, 
                          ticks: { color: '#64748B', font: { size: 10, weight: 'bold' } } 
                        }
                      },
                      elements: { bar: { borderRadius: 8 } }
                    }}
                    data={{
                      labels: (stats.doctorPerformance || []).map(d => d.doctorName),
                      datasets: [{
                        label: 'Load Index',
                        data: (stats.doctorPerformance || []).map(d => d.patientsTreated),
                        backgroundColor: (context) => context.dataIndex === 0 ? '#6366f1' : '#a855f7',
                        barThickness: 16
                      }]
                    }}
                  />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Area (Col 4) */}
        <div className="lg:col-span-4 space-y-8">

          {/* Emergency Alert Widget */}
          <div className="relative group p-8 bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl transition-all duration-500 hover:border-rose-500/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] rounded-full animate-pulse"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 shadow-2xl border border-rose-500/50 group-hover:scale-110 transition-transform duration-500">
                <div className="w-14 h-14 rounded-full bg-rose-500 flex items-center justify-center text-white animate-pulse">
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter mb-2">SYSTEM CRITICAL</h3>
              <p className="text-xs font-bold text-rose-200/60 uppercase tracking-widest bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20 mb-8">ER WARD 3 â€¢ ASSISTANCE REQUIRED</p>
              <button className="w-full py-4 bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl shadow-rose-500/30 hover:bg-rose-600 hover:-translate-y-1 transition-all duration-300 border border-rose-400/30">
                DISPATCH MEDICAL SQUAD
              </button>
            </div>
          </div>

          {/* Attention Priority Panel */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              Priority Triage List
            </h3>
            <div className="space-y-4">
              {patients.filter(p => p.riskCategory === 'HIGH' || p.riskLevel === 'HIGH' || p.age > 70).slice(0, 3).map((p, i) => (
                <div key={p.id} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 flex items-center gap-4 group hover:bg-white/[0.06] transition-all cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-rose-500/30 p-0.5 group-hover:scale-110 transition-transform">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="p" className="w-full h-full rounded-2xl bg-slate-950 object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white truncate">{p.name}</p>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter truncate">{p.disease || 'Vitals Compromised'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black bg-rose-500/10 text-rose-500 px-2 py-1 rounded-lg border border-rose-500/20">HIGH RISK</span>
                  </div>
                </div>
              ))}
              {patients.length === 0 && <p className="text-[10px] font-black text-slate-500 text-center py-4 bg-white/5 rounded-2xl">Stable Population</p>}
            </div>
          </div>

          {/* AI Behavioral Insights */}
          <div className="p-8 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-400" />
              AI Predictive Insights
            </h3>
            <div className="space-y-4">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 group hover:bg-indigo-500/10 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">{new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-md ${insight.type === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{insight.type}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 leading-relaxed mb-2">{insight.message}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest select-none">â€” {insight.patient?.name}</p>
                </div>
              ))}
               {insights.length === 0 && <p className="text-[10px] font-black text-slate-500 text-center py-4 bg-white/5 rounded-2xl">Awaiting Prediction Stream</p>}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
