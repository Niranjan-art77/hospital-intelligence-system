import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon, glow }) {
  const isDanger = glow === "red";

  return (
    <motion.div
      className={`relative p-6 overflow-hidden rounded-[20px] transition-all duration-300 group cursor-pointer ${isDanger ? 'bg-[#EF4444]/5 border border-[#EF4444]/20 shadow-[0_4px_20px_rgba(239,68,68,0.1)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)] hover:border-[#EF4444]/40' : 'bg-[#0F172A]/80 border border-[#1E293B] shadow-lg hover:shadow-[0_8px_30px_rgba(14,165,233,0.15)] hover:border-[#0EA5E9]/30'}`}
      whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-150 ${isDanger ? 'bg-[#EF4444]' : 'bg-[#0EA5E9]'}`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-2 transition-colors ${isDanger ? 'text-[#EF4444]/70' : 'text-slate-500 group-hover:text-[#0EA5E9]/70'}`}>{title}</h3>
          <motion.p
            className={`text-4xl font-black tracking-tight ${isDanger ? 'text-[#EF4444] drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#0EA5E9] transition-all'}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          >
            {value}
          </motion.p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative ${isDanger ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.4)] group-hover:border-[#0EA5E9]/40 transition-all'}`}>
          <div className="absolute inset-0 rounded-xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}