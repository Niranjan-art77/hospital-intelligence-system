import { motion } from "framer-motion";

export default function PatientCard({ patient, onClick }) {
  const isHighRisk = patient.riskScore > 60;

  return (
    <motion.div
      onClick={onClick}
      className={`card-nova p-6 cursor-pointer group ${isHighRisk ? 'border-[#F43F5E]/30 shadow-[0_8px_30px_rgba(244,63,94,0.15)] bg-gradient-to-br from-[#F43F5E]/5 to-transparent' : 'border-white/10 hover:border-[#06B6D4]/30 bg-white/5'}`}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
    >
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            {isHighRisk && (
              <span className="absolute -inset-2 rounded-full bg-[#F43F5E] opacity-30 blur-xl animate-pulse"></span>
            )}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-white shadow-xl relative z-10 ${isHighRisk ? 'text-[#F43F5E] ring-4 ring-[#F43F5E]/20' : 'text-[#8B5CF6] ring-4 ring-[#8B5CF6]/20'}`}>
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${patient.name}&backgroundColor=transparent`} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            </div>
            {isHighRisk && (
              <motion.div
                className="absolute -bottom-2 -right-2 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-[#F43F5E] z-20 text-xs"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                ❤️
              </motion.div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[#06B6D4] transition-all tracking-wide">
              {patient.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/10 text-slate-300 text-xs px-2 py-0.5 rounded-md font-medium">{patient.age}y</span>
              <span className="bg-[#8B5CF6]/10 text-[#C4B5FD] border border-[#8B5CF6]/30 text-xs px-2 py-0.5 rounded-md font-bold">{patient.bloodGroup}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 bg-slate-900/40 rounded-2xl p-4 border border-white/5 shadow-inner relative z-10 group-hover:bg-slate-900/60 transition-colors">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]"></span>
          Medical Context
        </div>
        <div className="text-sm text-slate-200 line-clamp-2 leading-relaxed font-medium mb-3">
          {patient.chronicConditions ? patient.chronicConditions : 'Routine check-up. No chronic conditions reported in standard diagnostics.'}
        </div>
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">AI Predicted Complications</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#A855F7]"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </div>
          <div className={`text-xs font-medium ${isHighRisk ? 'text-[#FCA5A5]' : 'text-[#A855F7]'}`}>
            {patient.predictedComplications || 'None detected'}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center relative z-10 pt-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">AI Risk Assessment</span>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-lg w-max shadow-sm ${isHighRisk ? 'text-white bg-gradient-to-r from-[#F43F5E] to-[#EC4899]' : 'text-white bg-gradient-to-r from-[#10B981] to-[#059669]'}`}>
            {patient.riskLevel}
          </span>
        </div>

        <div className="relative w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
            <path
              className="text-white/5"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
            />
            <motion.path
              className={isHighRisk ? "text-[#F43F5E]" : "text-[#10B981]"}
              strokeDasharray={`${patient.riskScore}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${patient.riskScore}, 100` }}
              transition={{ duration: 2, type: "spring", bounce: 0.5 }}
            />
          </svg>
          <span className={`absolute text-sm font-black ${isHighRisk ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>{patient.riskScore}</span>
        </div>
      </div>
    </motion.div>
  );
}