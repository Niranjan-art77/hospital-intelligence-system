import { useEffect, useState } from "react";
import API from "../services/api";
import PatientCard from "../components/PatientCard";
import { motion } from "framer-motion";

export default function HighRisk() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    API.get("/patients/high-risk")
      .then(res => setPatients(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] flex items-center gap-4">
          <span className="animate-pulse">🚨</span> CRITICAL PATIENT ALERT <span className="animate-pulse">🚨</span>
        </h1>
      </div>

      <div className="glass-panel border-red-500/50 bg-[rgba(50,0,0,0.2)] p-6 mb-8 shadow-[0_0_30px_rgba(255,0,0,0.15)] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-400 mb-1">Immediate Attention Required</h2>
          <p className="text-red-200/70">These patients have a risk score exceeding 60 based on their latest vital signs.</p>
        </div>
        <div className="text-5xl font-black text-red-500 animate-pulse bg-[rgba(255,0,0,0.1)] px-6 py-4 rounded-xl border border-red-500/30">
          {patients.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {patients.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <PatientCard patient={p} />
          </motion.div>
        ))}

        {patients.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-green-500 glass-panel border-green-500/30">
            <span className="text-6xl mb-4">💚</span>
            <span className="text-xl font-bold">No High Risk Patients at this time.</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}