import { useEffect, useState } from "react";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    API.get("/doctors").then(res => setDoctors(res.data)).catch(console.error);
  }, []);

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#8B5CF6] via-[#EC4899] to-[#F43F5E] mb-10 drop-shadow-sm">Doctors Directory</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {doctors.map((d, i) => (
          <motion.div
            key={d.id}
            onClick={() => setSelectedDoctor(d)}
            className="card-nova p-8 group relative overflow-hidden transition-all duration-300 cursor-pointer text-center flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
          >
            {/* Background Glow */}
            <div className="absolute -inset-24 bg-gradient-to-br from-[#8B5CF6]/20 via-[#EC4899]/10 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"></div>

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Glowing Avatar Frame */}
              <div className="relative mb-6">
                <div className="absolute inset-[-6px] rounded-full bg-gradient-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] opacity-0 group-hover:opacity-100 blur-[8px] transition-all duration-500 animate-spin-slow"></div>
                <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#EC4899] p-1 shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10">
                  <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${d.name}&backgroundColor=transparent`} alt="Doctor Avatar" className="w-full h-full bg-white rounded-full object-cover" />
                </div>
              </div>

              <h3 className="text-2xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#EC4899] transition-all tracking-wide">{d.name}</h3>

              {/* Modern Badge */}
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest mb-6 shadow-md shadow-[#EC4899]/30 group-hover:shadow-lg group-hover:shadow-[#EC4899]/50 transition-all">
                {d.specialization}
              </span>

              <div className="w-full bg-white/5 rounded-2xl p-4 flex justify-between items-center border border-white/10 group-hover:bg-white/10 transition-colors">
                <div className="flex flex-col items-center flex-1 px-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Experience</span>
                  <span className="text-lg font-black text-white">{d.experience} <span className="text-[10px] font-bold text-slate-300">YRS</span></span>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="flex flex-col items-center flex-1 px-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Status</span>
                  <span className="text-xs font-black text-[#10B981] flex items-center justify-center gap-2 mt-1 bg-[#10B981]/10 px-3 py-1 rounded-lg border border-[#10B981]/30">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span> ONLINE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedDoctor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"
            onClick={() => setSelectedDoctor(null)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 100, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900/90 border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_20px_60px_rgba(236,72,153,0.3)] glass-panel relative"
            >
              <div className="bg-gradient-to-r from-[#8B5CF6]/80 to-[#EC4899]/80 p-8 flex justify-between items-start relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>

                <div className="flex gap-6 items-center relative z-10">
                  <div className="w-24 h-24 rounded-full bg-white p-1 shadow-2xl">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedDoctor.name}&backgroundColor=transparent`} alt="Doctor Avatar" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2 tracking-wide drop-shadow-md">{selectedDoctor.name}</h2>
                    <span className="bg-white/20 text-white font-bold px-3 py-1 rounded-lg uppercase tracking-widest text-sm backdrop-blur-sm border border-white/30">{selectedDoctor.specialization}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedDoctor(null)} className="text-white/80 hover:text-white transition-colors text-3xl hover:rotate-90 hover:scale-110 relative z-10 p-2">✕</button>
              </div>

              <div className="p-8">
                <div className="mb-8">
                  <h4 className="text-xs text-slate-400 uppercase tracking-widest font-black mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#EC4899]"></span>
                    Biography & Experience
                  </h4>
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-slate-200 leading-relaxed font-medium shadow-inner">
                    {selectedDoctor.bio || "No detailed biography available for this doctor. Providing standard hospital care."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent p-5 rounded-2xl border border-[#8B5CF6]/20 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
                    <span className="text-[10px] text-[#A855F7] uppercase tracking-widest font-black mb-2">Tenure</span>
                    <span className="text-3xl font-black text-white">{selectedDoctor.experience} <span className="text-sm font-bold text-slate-400">Years</span></span>
                  </div>
                  <div className="bg-gradient-to-br from-[#10B981]/10 to-transparent p-5 rounded-2xl border border-[#10B981]/20 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
                    <span className="text-[10px] text-[#10B981] uppercase tracking-widest font-black mb-2">Current Status</span>
                    <span className="text-2xl font-black text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse"></span>
                      Available
                    </span>
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