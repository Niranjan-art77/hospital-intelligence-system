import { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [patients, setPatients] = useState([]);
    const [form, setForm] = useState({ patientId: "", doctorId: "", appointmentTime: "", symptoms: "" });
    const [recommendation, setRecommendation] = useState(null);
    const [isRecommending, setIsRecommending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const appts = await API.get("/appointments");
            setAppointments(appts.data);
            const docs = await API.get("/doctors");
            setDoctors(docs.data);
            const pats = await API.get("/patients");
            setPatients(pats.data);
        } catch (e) {
            console.error(e);
        }
    };

    const bookAppointment = async (e) => {
        e.preventDefault();
        try {
            await API.post("/appointments", form);
            alert("Appointment booked!");
            fetchData();
            setRecommendation(null);
        } catch (e) {
            alert("Error booking appointment. Time conflict or API error.");
        }
    };

    const getRecommendation = async () => {
        if (!form.symptoms) return alert("Please enter symptoms first.");
        setIsRecommending(true);
        try {
            const res = await API.get(`/appointments/recommendations?symptoms=${encodeURIComponent(form.symptoms)}`);
            setRecommendation(res.data);
            if (res.data.id) {
                setForm({ ...form, doctorId: res.data.id });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsRecommending(false);
        }
    };

    return (
        <motion.div
            className="page"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#EC4899] text-white shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center justify-center transform rotate-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                </div>
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] tracking-tight mb-1">Schedule Manager</h1>
                    <p className="text-sm text-slate-400 font-medium">Coordinate patient and medical personnel timelines</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 relative">
                    <div className="absolute top-0 -left-10 w-64 h-64 bg-[#EC4899]/10 rounded-full blur-3xl pointer-events-none"></div>
                    <form onSubmit={bookAppointment} className="card-nova p-8 flex flex-col gap-6 relative z-10 w-full">
                        <h2 className="text-2xl font-black mb-4 text-white tracking-wide border-b border-white/10 pb-4">New Appointment</h2>

                        <div className="space-y-6">
                            <div className="relative group">
                                <label className="text-[11px] text-[#EC4899] uppercase tracking-widest font-black mb-2 block pl-1">Target Patient</label>
                                <select
                                    className="input-tech text-slate-200 cursor-pointer text-base font-medium"
                                    value={form.patientId}
                                    onChange={e => setForm({ ...form, patientId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled className="text-slate-500 bg-[#0f172a]">-- Select Patient --</option>
                                    {patients.map(p => <option key={p.id} value={p.id} className="bg-[#0f172a] text-white">{p.name}</option>)}
                                </select>
                            </div>

                            <div className="relative group">
                                <label className="text-[11px] text-[#A855F7] uppercase tracking-widest font-black mb-2 block pl-1">Symptoms (For AI Routing)</label>
                                <div className="flex gap-2">
                                    <textarea
                                        className="input-tech text-slate-200 text-sm font-medium w-full h-12 py-3 px-4"
                                        placeholder="e.g. Severe headache and blurred vision..."
                                        value={form.symptoms}
                                        onChange={e => setForm({ ...form, symptoms: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={getRecommendation}
                                        disabled={isRecommending}
                                        className="btn-primary w-24 rounded-2xl flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-[#A855F7] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A855F7]"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={isRecommending ? "animate-spin" : ""}><path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                        <span className="text-[9px] uppercase font-black tracking-widest">Ask AI</span>
                                    </button>
                                </div>
                            </div>

                            {recommendation && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-[#10B981]/10 border border-[#10B981]/30 p-4 rounded-2xl flex items-start gap-3">
                                    <div className="text-[#10B981] mt-0.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg></div>
                                    <div>
                                        <div className="text-xs text-[#10B981] font-black uppercase tracking-widest mb-1">AI Recommendation</div>
                                        <div className="text-sm font-medium text-slate-200">System recommends <span className="text-white font-bold">Dr. {recommendation.name}</span> ({recommendation.specialization}) as the best match for these symptoms.</div>
                                    </div>
                                </motion.div>
                            )}

                            <div className="relative group">
                                <label className="text-[11px] text-[#8B5CF6] uppercase tracking-widest font-black mb-2 block pl-1">Medical Personnel</label>
                                <select
                                    className="input-tech text-slate-200 cursor-pointer text-base font-medium"
                                    value={form.doctorId}
                                    onChange={e => setForm({ ...form, doctorId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled className="bg-[#0f172a] text-slate-500">-- Select Doctor --</option>
                                    {doctors.map(d => <option key={d.id} value={d.id} className="bg-[#0f172a] text-white">Dr. {d.name} ({d.specialization})</option>)}
                                </select>
                            </div>

                            <div className="relative group">
                                <label className="text-[11px] text-[#06B6D4] uppercase tracking-widest font-black mb-2 block pl-1">Timeslot</label>
                                <input
                                    type="datetime-local"
                                    className="input-tech text-slate-200 cursor-pointer text-base font-medium select-none"
                                    value={form.appointmentTime}
                                    onChange={e => setForm({ ...form, appointmentTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary mt-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-black tracking-widest shadow-[0_10px_20px_rgba(236,72,153,0.3)] hover:shadow-[0_15px_30px_rgba(236,72,153,0.5)] transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                            Confirm Booking
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-7 relative">
                    <div className="absolute top-1/2 right-10 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>

                    <div className="card-nova p-8 overflow-hidden relative z-10 w-full min-h-[600px]">
                        <h2 className="text-2xl font-black mb-10 text-white tracking-wide border-b border-white/10 pb-4 flex items-center gap-3">
                            <span className="w-3 h-3 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                            Active Timeline
                        </h2>

                        <div className="flex flex-col relative z-20 pl-6 border-l-4 border-white/5 ml-2">
                            {appointments.map((a, i) => (
                                <motion.div
                                    key={a.id}
                                    initial={{ opacity: 0, x: -30, rotateX: -20 }}
                                    animate={{ opacity: 1, x: 0, rotateX: 0 }}
                                    transition={{ delay: i * 0.15, type: "spring", bounce: 0.4 }}
                                    className="relative pb-10 pl-8 group"
                                >
                                    {/* Timeline Node */}
                                    <span className="absolute top-4 -left-[31px] w-6 h-6 rounded-full bg-slate-900 border-[4px] border-[#8B5CF6] group-hover:border-[#EC4899] group-hover:scale-125 transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.5)] z-10"></span>

                                    <div className="glass-panel p-6 border border-white/10 group-hover:border-[#EC4899]/50 transition-colors shadow-lg group-hover:shadow-[0_15px_30px_rgba(236,72,153,0.15)] relative overflow-hidden backdrop-blur-2xl bg-white/5 cursor-pointer transform group-hover:-translate-y-1">
                                        <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#8B5CF6] to-[#EC4899] opacity-80"></div>

                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-full bg-white p-1 shadow-md shrink-0">
                                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${a.patient?.name}&backgroundColor=transparent`} alt="Patient" className="w-full h-full rounded-full bg-slate-100 object-cover" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-xl text-white group-hover:text-[#EC4899] transition-colors mb-1">{a.patient?.name || 'Unknown Patient'}</div>
                                                    <div className="text-xs text-slate-300 font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full inline-flex border border-white/10">
                                                        🩺 Assigned: Dr. {a.doctor?.name || 'Unassigned'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end shrink-0 w-full sm:w-auto">
                                                <div className="font-bold text-lg text-white font-mono bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5 border-b-white/10 shadow-inner group-hover:text-[#06B6D4] transition-colors">
                                                    {new Date(a.appointmentTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[11px] uppercase font-black tracking-widest mt-3 flex items-center gap-2 text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-lg border border-[#10B981]/20">
                                                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span> {a.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {appointments.length === 0 && (
                                <div className="text-slate-400 font-bold bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center justify-center -ml-6 mt-4 opacity-50">
                                    No active sequences in the timeline.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
