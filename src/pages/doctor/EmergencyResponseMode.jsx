import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Ambulance, MapPin, Activity, 
  Droplets, Heart, Wind, Zap, Navigation,
  Shield, Phone, ChevronRight, Eye, Radar,
  Thermometer, AlertCircle, Crosshair
} from 'lucide-react';
import API from '../../services/api';

export default function EmergencyResponseMode() {
  const [emergencies, setEmergencies] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [systemAlert, setSystemAlert] = useState(true);

  useEffect(() => {
    // Mock data for emergency mode
    setEmergencies([
      {
        id: 'EM-942',
        type: 'Trauma Alpha',
        location: 'Zone 4 - Highway 101',
        eta: '4m 12s',
        status: 'EN_ROUTE',
        severity: 'CRITICAL',
        vitals: { hr: 142, bp: '180/110', ox: 88, temp: 96.4 },
        details: 'Multi-vehicle collision. Severe thoracic trauma. Suspected internal hemorrhage.'
      },
      {
        id: 'EM-831',
        type: 'Cardiac Arrest',
        location: 'Sector 2 - Central Plaza',
        eta: 'Now Arriving',
        status: 'ON_SITE',
        severity: 'SEVERE',
        vitals: { hr: 0, bp: '0/0', ox: 40, temp: 98.2 },
        details: 'Patient collapsed 6 minutes ago. Bystander CPR initiated. Defibrillation administered x2.'
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden relative selection:bg-rose-500/30 selection:text-white">
      {/* Background Animated Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent" />
      </div>

      {/* Global Alert Header */}
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="h-2 bg-rose-600 w-full relative z-50 shadow-[0_0_20px_#e11d48]"
      />

      <div className="p-6 md:p-10 h-screen flex flex-col relative z-10">
        
        {/* Header */}
        <header className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.4)] relative">
              <AlertTriangle className="w-10 h-10 animate-pulse" />
              <div className="absolute -inset-2 border border-rose-500/20 rounded-[20px] animate-ping" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                RAPID <span className="text-rose-500">RESPONSE</span> MODE
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse">Emergency Uplink Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sector Lockdown Level 2</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="glass-card px-8 py-4 border-rose-500/20 flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available ICU Beds</p>
                <p className="text-xl font-black text-white">04</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Blood Supply</p>
                <p className="text-xl font-black text-rose-400">O- CRITICAL</p>
              </div>
            </div>
            <button className="w-16 h-16 glass-card border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
              <Phone className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Interface */}
        <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
          
          {/* Active Incidents List */}
          <div className="col-span-12 lg:col-span-4 space-y-6 overflow-y-auto pr-4 custom-scroll">
            <h2 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em] flex items-center gap-2">
              <Radar className="w-4 h-4" /> ACTIVE TRAUMA VECTOR
            </h2>
            
            <AnimatePresence>
              {emergencies.map((em, i) => (
                <motion.div
                  key={em.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedEmergency(em)}
                  className={`p-6 glass-card border-l-4 cursor-pointer relative overflow-hidden transition-all ${
                    selectedEmergency?.id === em.id 
                    ? 'border-rose-500 bg-rose-500/10 shadow-[0_0_30px_rgba(225,29,72,0.1)]' 
                    : 'border-rose-500/30 hover:border-rose-500/60 bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-mono text-rose-500/80">{em.id}</span>
                    <span className="px-2 py-1 bg-rose-500 text-white text-[9px] font-black rounded uppercase tracking-widest animate-pulse">
                      {em.severity}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-1 uppercase italic tracking-tighter">{em.type}</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-4 font-bold">
                    <MapPin className="w-3 h-3 text-rose-500" /> {em.location}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ETA</span>
                        <span className="text-sm font-black text-white">{em.eta}</span>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                        <span className="text-sm font-black text-rose-400">{em.status}</span>
                      </div>
                    </div>
                    <ChevronRight className={`w-6 h-6 ${selectedEmergency?.id === em.id ? 'text-rose-500' : 'text-slate-600'}`} />
                  </div>

                  {/* Scanline overlay for selected */}
                  {selectedEmergency?.id === em.id && <div className="absolute inset-0 scanline opacity-20" />}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Tactical Display */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-8 overflow-hidden">
            {selectedEmergency ? (
              <div className="flex-1 flex flex-col gap-8">
                {/* Live Telemetry Card */}
                <div className="glass-card p-10 border-rose-500/30 relative flex-1 flex flex-col">
                  <div className="hud-corner top-left" />
                  <div className="hud-corner top-right" />
                  
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <Ambulance className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-1">
                          LIVE TELEMETRY: <span className="text-rose-500">{selectedEmergency.id}</span>
                        </h2>
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.2em]">Origin: Field Medic Stream 104-B</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Full Biometrics
                      </button>
                      <button className="px-6 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:scale-105 transition-all">
                        DEPLOY TEAM
                      </button>
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                    {[
                      { label: 'Heart Rate', value: selectedEmergency.vitals.hr, unit: 'BPM', icon: Heart, color: 'text-rose-500', trend: 'STABLE' },
                      { label: 'Blood Pressure', value: selectedEmergency.vitals.bp, unit: 'mmHg', icon: Droplets, color: 'text-blue-500', trend: 'CRITICAL' },
                      { label: 'Oxygen Saturation', value: selectedEmergency.vitals.ox + '%', unit: 'SpO2', icon: Wind, color: 'text-emerald-500', trend: 'LOW' },
                      { label: 'Core Temp', value: selectedEmergency.vitals.temp + '°', unit: 'F', icon: Thermometer, color: 'text-amber-500', trend: 'STABLE' }
                    ].map((v, i) => (
                      <div key={i} className="p-6 glass-card bg-black/40 border-white/5 flex flex-col items-center text-center group">
                        <v.icon className={`w-8 h-8 ${v.color} mb-4 group-hover:scale-110 transition-all`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{v.label}</span>
                        <div className="text-2xl font-black text-white">{v.value}</div>
                        <span className="text-[8px] font-mono text-slate-600 mt-2">{v.unit} // {v.trend}</span>
                      </div>
                    ))}
                  </div>

                  {/* Live Narrative Feed */}
                  <div className="flex-1 glass-card bg-black/60 p-8 border-rose-500/10 font-mono">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em]">Tactical Feed Log</h4>
                      <span className="text-[10px] text-slate-600 uppercase">Secure Link 256-AES</span>
                    </div>
                    <div className="space-y-4 text-xs text-slate-400">
                      <div className="flex gap-4">
                        <span className="text-rose-500/60 shrink-0">[14:24:12]</span>
                        <p>Subject extraction complete. Transporting to Sector 4 Command.</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-rose-500/60 shrink-0">[14:25:45]</span>
                        <p>Vitals fluctuation detected. Administering 2mg Epinephrine.</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-rose-500/60 shrink-0">[14:28:10]</span>
                        <p>Oxygen levels stabilized at 88%. ETA adjusted to 4 minutes.</p>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1, repeatType: 'reverse' }}
                        className="flex gap-4 text-rose-400 font-bold"
                      >
                        <span className="shrink-0">[LIVE]</span>
                        <p>Approaching hospital perimeter. Clear Landing Pad 2.</p>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="h-32 grid grid-cols-3 gap-6">
                  <div className="glass-card bg-rose-500/5 border-rose-500/20 p-6 flex flex-col justify-center">
                    <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Trauma Severity</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(v => (
                        <div key={v} className={`h-2 flex-1 rounded-full ${v <= 4 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-white mt-2 uppercase">Level 4 Severity</span>
                  </div>
                  <div className="glass-card bg-white/5 border-white/10 p-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Crosshair className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Destination</p>
                      <p className="text-sm font-black text-white uppercase tracking-tighter">Trauma Bay 01</p>
                    </div>
                  </div>
                  <button className="bg-rose-600 hover:bg-rose-500 text-white rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-[0_0_30px_rgba(225,29,72,0.3)] group">
                    <Zap className="w-6 h-6 group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Prep Surgery</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 glass-card border-dashed border-white/10 flex flex-col items-center justify-center p-20 text-center">
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-rose-500/20 flex items-center justify-center mb-10 animate-spin-slow">
                  <Radar className="w-16 h-16 text-rose-500 opacity-20" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 italic">NO VECTOR SELECTED</h3>
                <p className="max-w-xs text-slate-500 text-sm font-medium leading-relaxed">
                  Select an active trauma incident from the roster to initialize real-time clinical monitoring.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Hud Overlays */}
      <div className="fixed inset-0 pointer-events-none border-[20px] border-rose-500/5 z-0" />
      <div className="fixed top-0 left-0 w-64 h-64 bg-rose-500/10 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-rose-500/5 blur-[150px] rounded-full translate-x-1/4 translate-y-1/4" />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-[0.03] z-[100]" />
    </div>
  );
}
