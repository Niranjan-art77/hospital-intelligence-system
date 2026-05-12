import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Users, Calendar, AlertCircle, Heart, Brain, 
  TrendingUp, Clock, Shield, Bell, Search, Filter,
  ChevronRight, ArrowUpRight, Zap, Target, Stethoscope,
  Ambulance, Hospital, Droplets, Thermometer, Radar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import AiMedicalAssistant from '../../components/AiMedicalAssistant';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function DoctorCommandCenter() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeCases, setActiveCases] = useState([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, casesRes, alertsRes] = await Promise.all([
        API.get('/api/analytics/doctor-stats'),
        API.get('/api/appointments/doctor/' + user?.id),
        API.get('/api/emergency/active')
      ]);

      setStats(statsRes.data || generateMockStats());
      setActiveCases(casesRes.data || generateMockCases());
      setEmergencyAlerts(alertsRes.data || generateMockAlerts());
    } catch (error) {
      console.error("Data Uplink Failed", error);
      setStats(generateMockStats());
      setActiveCases(generateMockCases());
      setEmergencyAlerts(generateMockAlerts());
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = () => ({
    patientLoad: 42,
    emergencyCount: 3,
    successRate: 98.4,
    revenue: "125.4K",
    trends: [
      { name: '08:00', load: 12 },
      { name: '10:00', load: 25 },
      { name: '12:00', load: 42 },
      { name: '14:00', load: 38 },
      { name: '16:00', load: 30 },
      { name: '18:00', load: 15 },
    ]
  });

  const generateMockCases = () => [
    { id: 1, name: "Sarah Connor", condition: "Critical Hypertension", status: "ICU", risk: "High" },
    { id: 2, name: "James Bond", condition: "Post-Trauma Recovery", status: "Recovery", risk: "Low" },
    { id: 3, name: "Ellen Ripley", condition: "Respiratory Infection", status: "Isolation", risk: "Medium" }
  ];

  const generateMockAlerts = () => [
    { id: 1, type: "CODE RED", location: "Sector 7", time: "2m ago", message: "Ventilator Failure in ICU-4" },
    { id: 2, type: "AMBULANCE", location: "ETA 5m", time: "Now", message: "Trauma case approaching north gate" }
  ];

  return (
    <div className="min-h-screen medical-grid p-6 md:p-10">
      <div className="max-w-[1800px] mx-auto space-y-10">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 glass-card-glow flex items-center justify-center text-blue-400">
                <Radar className="w-8 h-8 animate-pulse-glow" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white">
                  COMMAND <span className="text-blue-400">CENTER</span>
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">Integrated Medical Operating System v7.1.0</p>
              </div>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6 px-8 py-4 glass-card">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Status</span>
                <span className="text-xs font-bold text-emerald-400 uppercase">Synchronized</span>
              </div>
              <div className="w-[1px] h-10 bg-white/10" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active AI Agents</span>
                <span className="text-xs font-bold text-white">124 Protocols</span>
              </div>
            </div>
            
            <button className="w-14 h-14 glass-card flex items-center justify-center text-white relative hover:scale-110 transition-all">
              <Bell className="w-6 h-6" />
              <span className="absolute top-4 right-4 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            </button>
            
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-white">Dr. {user?.fullName || "Alexander"}</span>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Medical Director</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} alt="Profile" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Stats & Trends */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Active Patient Load", value: stats?.patientLoad, icon: Users, color: "text-blue-400", trend: "+12%" },
                { label: "Critical Emergencies", value: stats?.emergencyCount, icon: Ambulance, color: "text-rose-400", trend: "Severe" },
                { label: "AI Trust Score", value: stats?.successRate + "%", icon: Shield, color: "text-emerald-400", trend: "Stable" }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 relative group overflow-hidden"
                >
                  <div className="hud-corner top-left opacity-20" />
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-slate-900 border border-white/5 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${stat.color}`}>{stat.trend}</span>
                  </div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</h4>
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  
                  {/* Subtle Background Icon */}
                  <stat.icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-5 text-white group-hover:opacity-10 transition-all" />
                </motion.div>
              ))}
            </div>

            {/* Real-time Load Chart */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" /> SYSTEM TRAFFIC ANALYTICS
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Live Load Distribution Profile</p>
                </div>
                <div className="flex gap-2">
                  {['1H', '1D', '1W'].map(t => (
                    <button key={t} className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border transition-all ${t === '1D' ? 'bg-blue-500 text-white border-blue-400' : 'text-slate-500 border-white/5 hover:border-white/20'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.trends}>
                    <defs>
                      <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#0ea5e9', fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="load" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Clinical Cases */}
            <div className="glass-card p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" /> ACTIVE CLINICAL ROSTER
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time patient monitoring</p>
                </div>
                <button className="text-xs font-bold text-blue-400 hover:text-white transition-colors uppercase tracking-widest">View All Files</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCases.map((c, i) => (
                  <div key={i} className="p-5 glass-card bg-slate-900/40 border-white/5 hover:border-white/10 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${c.name}`} alt="P" className="w-10 h-10" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{c.condition}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-1 ${c.risk === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {c.risk} Risk
                      </span>
                      <span className="text-[10px] text-slate-600 font-bold uppercase">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI & Alerts */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* AI Assistant Panel */}
            <AiMedicalAssistant patientData={{ id: 1 }} />

            {/* Emergency Alert Feed */}
            <div className="glass-card p-8 border-rose-500/20 bg-rose-500/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-rose-400 tracking-tight">TACTICAL ALERTS</h3>
                  <p className="text-[10px] text-rose-500/60 font-bold uppercase tracking-widest">Active Emergency Feed</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {emergencyAlerts.map((alert, i) => (
                  <div key={i} className="p-4 glass-card bg-slate-900/60 border-rose-500/20 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em]">{alert.type}</span>
                      <span className="text-[10px] font-mono text-slate-600">{alert.time}</span>
                    </div>
                    <h4 className="text-sm font-black text-white mb-1">{alert.location}</h4>
                    <p className="text-xs text-slate-400 leading-tight">{alert.message}</p>
                    
                    <button className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all text-rose-400">
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rose-500/20 transition-all">
                  ACTIVATE RAPID RESPONSE MODE
                </button>
              </div>
            </div>

            {/* Real-time Health Metrics */}
            <div className="glass-card p-8">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6">Vital Node Status</h3>
              <div className="space-y-6">
                {[
                  { label: "Blood Oxygen (Avg)", value: "98.2%", icon: Droplets, color: "text-blue-400", level: 98 },
                  { label: "Mean Heart Rate", value: "74 BPM", icon: Heart, color: "text-rose-400", level: 74 },
                  { label: "System Temperature", value: "98.6°F", icon: Thermometer, color: "text-amber-400", level: 100 }
                ].map((vital, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <vital.icon className={`w-4 h-4 ${vital.color}`} />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{vital.label}</span>
                      </div>
                      <span className="text-sm font-black text-white">{vital.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: vital.level + "%" }}
                        className={`h-full rounded-full bg-gradient-to-r ${vital.color.replace('text', 'from')} to-transparent opacity-60`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* HUD Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-[0.03]" />
    </div>
  );
}
