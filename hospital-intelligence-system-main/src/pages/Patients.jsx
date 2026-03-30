import { useEffect, useState } from "react";
import API from "../services/api";
import PatientCard from "../components/PatientCard";
import { motion, AnimatePresence } from "framer-motion";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsHistory, setVitalsHistory] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);

  useEffect(() => {
    API.get("/patients").then(res => setPatients(res.data)).catch(console.error);
  }, []);

  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    try {
      const [vitalsRes, timelineRes] = await Promise.all([
        API.get(`/patients/${patient.id}/vitals`),
        API.get(`/patients/${patient.id}/timeline`)
      ]);
      setVitalsHistory(vitalsRes.data);
      setTimelineEvents(timelineRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div className="page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Patient Directory</h1>
          <p className="text-slate-400">Total active records monitored: <span className="text-indigo-400 font-bold">{patients.length}</span></p>
        </div>

        <div className="glass-panel px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
            <span className="text-sm font-medium text-slate-300">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></span>
            <span className="text-sm font-medium text-slate-300">Critical</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {patients.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <PatientCard patient={p} onClick={() => handlePatientClick(p)} />
            </motion.div>
          ))}
        </AnimatePresence>

        {patients.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center glass-panel border-dashed border-white/10">
            <div className="text-6xl mb-4 opacity-50">📂</div>
            <h3 className="text-xl font-bold text-slate-300">No Patient Records found</h3>
            <p className="text-slate-500 mt-2">Initialize the system by adding a new patient from the navigation.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0B1120] border border-[#1E293B] rounded-[24px] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header Profile Section */}
              <div className="p-8 pb-6 border-b border-[#1E293B] relative shrink-0">
                <button onClick={() => setSelectedPatient(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
                <div className="flex gap-6 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{selectedPatient.name}</h2>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2">
                      {selectedPatient.age}y &nbsp;·&nbsp; Male &nbsp;·&nbsp; {selectedPatient.bloodGroup}
                    </div>
                    <div className="flex items-center gap-3">
                      {selectedPatient.riskScore > 60 && (
                        <div className="border border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                          Critical
                        </div>
                      )}
                      <div className="text-slate-500 text-sm">Ward: ICU-3</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-8 overflow-y-auto custom-scroll flex-1">

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-center gap-4">
                    <div className="text-[#0EA5E9]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg></div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Phone</div>
                      <div className="text-sm text-slate-200">+1-555-0101</div>
                    </div>
                  </div>
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-center gap-4">
                    <div className="text-[#A855F7]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg></div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Email</div>
                      <div className="text-sm text-slate-200">{selectedPatient.name.split(' ')[0].toLowerCase()}@email.com</div>
                    </div>
                  </div>
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 flex items-center gap-4">
                    <div className="text-[#10B981]"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg></div>
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Insurance</div>
                      <div className="text-sm text-slate-200">BlueCross Premium</div>
                    </div>
                  </div>
                </div>

                {/* Allergies & AI Complications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-[#1A1016] border border-[#4C1D2A] rounded-xl p-5">
                    <h3 className="text-[#EF4444] text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" /></svg>
                      Allergies
                    </h3>
                    <div className="flex gap-3">
                      <span className="border border-[#7F1D1D] bg-[#450A0A]/50 text-[#FCA5A5] px-4 py-1.5 rounded-full text-xs font-medium">Penicillin</span>
                      <span className="border border-[#7F1D1D] bg-[#450A0A]/50 text-[#FCA5A5] px-4 py-1.5 rounded-full text-xs font-medium">Sulfa drugs</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-[#8B5CF6]/30 rounded-xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                    <h3 className="text-[#A855F7] text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                      AI Predicted Complications
                    </h3>
                    <div className="flex flex-wrap gap-2 relative z-10">
                      {selectedPatient.predictedComplications && selectedPatient.predictedComplications !== "None"
                        ? selectedPatient.predictedComplications.split('. ').filter(c => c).map((comp, idx) => (
                          <span key={idx} className="border border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#C4B5FD] px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">{comp.trim()}</span>
                        ))
                        : <span className="text-slate-400 text-sm italic">No significant complications predicted.</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Vitals Trend Section */}
                <div className="mb-8">
                  <h3 className="text-[#0EA5E9] text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                    Vitals Trend
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-[#1C1319] border border-[#3A1821] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                      <div className="text-[#EF4444] mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg></div>
                      <div className="text-[#EF4444] text-3xl font-black mb-1">80 BPM</div>
                      <div className="text-slate-500 text-xs">Heart Rate</div>
                    </div>
                    <div className="bg-[#0B1A24] border border-[#0D3850] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                      <div className="text-[#0EA5E9] mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" /></svg></div>
                      <div className="text-[#0EA5E9] text-3xl font-black mb-1">135/85</div>
                      <div className="text-slate-500 text-xs">Blood Pressure</div>
                    </div>
                    <div className="bg-[#10221C] border border-[#114030] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                      <div className="text-[#10B981] mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19V9a5.5 5.5 0 0 0-11 0v10" /><path d="M14 13h3a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3" /><path d="M10 13H7a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3" /></svg></div>
                      <div className="text-[#10B981] text-3xl font-black mb-1">97%</div>
                      <div className="text-slate-500 text-xs">SpO2</div>
                    </div>
                    <div className="bg-[#241F16] border border-[#4D401F] rounded-xl p-5 flex flex-col items-center justify-center text-center">
                      <div className="text-[#EAB308] mb-2"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" /></svg></div>
                      <div className="text-[#EAB308] text-3xl font-black mb-1">37.1°C</div>
                      <div className="text-slate-500 text-xs">Temperature</div>
                    </div>
                  </div>

                  {/* Heart Rate Timeline Mini Chart (CSS only for effect) */}
                  <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-5">
                    <div className="text-xs text-slate-500 uppercase tracking-widest mb-4">Heart Rate Timeline</div>
                    <div className="flex gap-2 h-20 items-end">
                      <div className="w-1/4 h-[60%] bg-gradient-to-t from-[#0EA5E9] to-transparent rounded-t-lg opacity-80 border-t border-[#0EA5E9]"></div>
                      <div className="w-1/4 h-[75%] bg-gradient-to-t from-[#0EA5E9] to-transparent rounded-t-lg opacity-80 border-t border-[#0EA5E9]"></div>
                      <div className="w-1/4 h-[50%] bg-gradient-to-t from-[#0EA5E9] to-transparent rounded-t-lg opacity-80 border-t border-[#0EA5E9]"></div>
                      <div className="w-1/4 h-[85%] bg-gradient-to-t from-[#0EA5E9] to-transparent rounded-t-lg opacity-80 border-t border-[#0EA5E9]"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-2 px-4">
                      <span>06:00</span>
                      <span>08:30</span>
                      <span>10:00</span>
                      <span>12:00</span>
                    </div>
                  </div>
                </div>

                {/* Medical History Timeline */}
                <div>
                  <h3 className="text-[#A855F7] text-xs font-bold tracking-widest uppercase flex items-center gap-2 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" /></svg>
                    Medical History
                  </h3>

                  <div className="relative border-l border-[#1E293B] ml-2 pl-6 space-y-6">

                    {timelineEvents.map((event, idx) => (
                      <div className="relative" key={idx}>
                        <div className={`absolute -left-[30px] top-1 w-[11px] h-[11px] rounded-full bg-[#0B1120] border-2 ${event.eventType === 'VITALS' ? 'border-[#10B981]' : event.eventType === 'APPOINTMENT' ? 'border-[#0EA5E9]' : 'border-[#F43F5E]'} shadow-[0_0_8px_rgba(14,165,233,0.3)]`}></div>
                        <div className="card-nova p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${event.eventType === 'VITALS' ? 'text-[#10B981]' : event.eventType === 'APPOINTMENT' ? 'text-[#0EA5E9]' : 'text-white'}`}>{event.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono bg-slate-800/50 px-2 py-0.5 rounded-md">{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-slate-300 text-sm mb-3 font-medium bg-black/20 p-2 rounded border border-white/5">{event.description}</p>
                          {event.doctorName && (
                            <div className="flex items-center gap-1.5 text-xs text-[#06B6D4] font-bold">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 2v2" /><path d="M5 2v2" /><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1" /><path d="M8 15a6 6 0 0 0 12 0v-3" /><circle cx="20" cy="10" r="2" /></svg>
                              Dr. {event.doctorName}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {timelineEvents.length === 0 && (
                      <div className="text-center py-8 text-sm text-slate-500 italic">No medical history events recorded yet.</div>
                    )}

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