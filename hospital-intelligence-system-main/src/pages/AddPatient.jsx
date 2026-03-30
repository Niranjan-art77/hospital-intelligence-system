import { useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";

export default function AddPatient() {
    const [form, setForm] = useState({ name: "", age: "", bloodGroup: "", chronicConditions: "" });
    const [vitals, setVitals] = useState({ bloodPressure: "", sugarLevel: "", weight: "", height: "" });
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Create Patient
            const patRes = await API.post("/patients", {
                name: form.name,
                age: parseInt(form.age),
                bloodGroup: form.bloodGroup,
                chronicConditions: form.chronicConditions
            });

            const newPatientId = patRes.data.id;

            // 2. Setup initial Vitals
            if (vitals.bloodPressure || vitals.sugarLevel || vitals.weight || vitals.height) {
                await API.post(`/patients/${newPatientId}/vitals`, {
                    bloodPressure: vitals.bloodPressure ? parseFloat(vitals.bloodPressure) : null,
                    sugarLevel: vitals.sugarLevel ? parseFloat(vitals.sugarLevel) : null,
                    weight: vitals.weight ? parseFloat(vitals.weight) : null,
                    height: vitals.height ? parseFloat(vitals.height) : null
                });
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setForm({ name: "", age: "", bloodGroup: "", chronicConditions: "" });
            setVitals({ bloodPressure: "", sugarLevel: "", weight: "", height: "" });

        } catch (err) {
            alert("Error adding patient. See console.");
            console.error(err);
        }
    };

    return (
        <motion.div className="flex flex-col gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div>
                <h1 className="text-3xl font-extrabold tracking-widest uppercase mb-1 flex items-center gap-2">
                    Patient <span className="text-gradient-cyan">Intake System</span>
                </h1>
                <p className="text-slate-500 font-medium">Register a new entity into the primary database.</p>
            </div>

            {success && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] font-bold flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    Record sequence fully verified and integrated.
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="card-nova p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Identity Parameters</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Full Name</label>
                            <input id="name" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" placeholder="e.g. John Doe" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Age</label>
                            <input id="age" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" type="number" placeholder="e.g. 35" required value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Blood Group</label>
                            <select id="bg" className="input-tech w-full appearance-none transition-all group-hover:border-[#0EA5E9]/50 cursor-pointer" required value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
                                <option value="" disabled className="bg-[#0B1120] text-slate-500">-- Select Blood Group --</option>
                                <option value="A+" className="bg-[#0B1120]">A+</option>
                                <option value="A-" className="bg-[#0B1120]">A-</option>
                                <option value="B+" className="bg-[#0B1120]">B+</option>
                                <option value="B-" className="bg-[#0B1120]">B-</option>
                                <option value="AB+" className="bg-[#0B1120]">AB+</option>
                                <option value="AB-" className="bg-[#0B1120]">AB-</option>
                                <option value="O+" className="bg-[#0B1120]">O+</option>
                                <option value="O-" className="bg-[#0B1120]">O-</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-4 text-[#0EA5E9]">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Chronic Conditions (Optional)</label>
                            <input id="cond" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" placeholder="e.g. Hypertension, Diabetes" value={form.chronicConditions} onChange={e => setForm({ ...form, chronicConditions: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="card-nova p-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#A855F7]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-10 h-10 rounded-xl bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-wide">Initial Vitals</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Blood Pressure (mmHg)</label>
                            <input id="bp" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" type="number" step="0.1" placeholder="e.g. 120" value={vitals.bloodPressure} onChange={e => setVitals({ ...vitals, bloodPressure: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Sugar Level (mg/dL)</label>
                            <input id="sugar" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" type="number" step="0.1" placeholder="e.g. 90" value={vitals.sugarLevel} onChange={e => setVitals({ ...vitals, sugarLevel: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Weight (kg)</label>
                            <input id="weight" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" type="number" step="0.1" placeholder="e.g. 70.5" value={vitals.weight} onChange={e => setVitals({ ...vitals, weight: e.target.value })} />
                        </div>
                        <div className="relative group">
                            <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1 block">Height (m)</label>
                            <input id="height" className="input-tech w-full transition-all group-hover:border-[#0EA5E9]/50" type="number" step="0.01" placeholder="e.g. 1.75" value={vitals.height} onChange={e => setVitals({ ...vitals, height: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button type="submit" className="btn-primary py-4 px-10 flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>
                        Initialize Patient Instance
                    </button>
                </div>
            </form>
        </motion.div>
    );
}
