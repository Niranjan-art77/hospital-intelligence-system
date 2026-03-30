import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RecoveryTracker() {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Morning Medication (Cardio-Block)', completed: true },
        { id: 2, text: '15-min Respiratory exercise', completed: true },
        { id: 3, text: 'Vitals sync with Nova AI', completed: false },
        { id: 4, text: 'Evening Physiotherapy session', completed: false },
    ]);

    const toggleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const progress = Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 flex flex-col gap-8"
        >
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] to-[#3B82F6] tracking-tight">
                        Recovery Roadmap
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Track your clinical milestones and daily wellness tasks.
                    </p>
                </div>
                <div className="bg-[#10B981]/10 border border-[#10B981]/20 px-6 py-3 rounded-2xl">
                    <div className="text-[10px] font-black text-[#10B981] uppercase tracking-[0.2em] mb-1">Status</div>
                    <div className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                        Discharge Ready: 85%
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Progress Orbit */}
                <div className="card-nova p-10 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#10B981]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="relative w-56 h-56 mb-8">
                        {/* Static Background Circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="112" cy="112" r="100" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                            <motion.circle
                                cx="112" cy="112" r="100"
                                stroke="#10B981"
                                strokeWidth="12"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ strokeDasharray: "0 628" }}
                                animate={{ strokeDasharray: `${(progress / 100) * 628} 628` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.4))' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-black text-white">{progress}%</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Goal</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-xl font-black text-white mb-2">Almost there, Niranjan!</h3>
                        <p className="text-slate-400 text-sm font-medium">Complete 2 more tasks to hit your weekly recovery target.</p>
                    </div>
                </div>

                {/* Center: Daily Checklist */}
                <div className="card-nova p-8 lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-white flex items-center gap-3">
                            <span className="bg-[#10B981] p-1.5 rounded-lg text-lg">📝</span>
                            Daily Protocol
                        </h3>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{tasks.filter(t => t.completed).length}/{tasks.length} Completed</span>
                    </div>

                    <div className="space-y-4">
                        {tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => toggleTask(task.id)}
                                className={`group p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${task.completed ? 'bg-[#10B981]/10 border-[#10B981]/30 opacity-70' : 'bg-white/5 border-white/10 hover:border-white/25'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-[#10B981] border-[#10B981]' : 'border-slate-700'}`}>
                                        {task.completed && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className={`font-bold transition-all ${task.completed ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'}`}>{task.text}</span>
                                </div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#10B981] transition-colors">
                                    {task.completed ? 'Verified' : 'Pending'}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-5 bg-gradient-to-r from-[#10B981]/10 to-[#3B82F6]/10 border border-[#10B981]/20 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-2xl">✨</div>
                            <div>
                                <div className="text-xs font-black text-white">AI Health Tip</div>
                                <div className="text-[11px] text-slate-400 font-medium">Your oxygen stability is improving. Increase exercise duration by 5 mins tomorrow.</div>
                            </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#10B981] hover:underline">Full Analysis</button>
                    </div>
                </div>
            </div>

            {/* Bottom: Milestone Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Phase 1: Post-Op', status: 'Completed', color: '#10B981', date: 'Feb 15' },
                    { label: 'Phase 2: Mobility', status: 'In Progress', color: '#3B82F6', date: 'Mar 01' },
                    { label: 'Phase 3: Med Taper', status: 'Locked', color: '#64748b', date: 'Mar 15' },
                    { label: 'Phase 4: Discharge', status: 'Locked', color: '#64748b', date: 'Mar 25' },
                ].map((m, i) => (
                    <div key={m.label} className="relative pt-6">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className={`h-full ${i === 0 ? 'w-full' : i === 1 ? 'w-1/2' : 'w-0'}`} style={{ backgroundColor: m.color }}></div>
                        </div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: m.color }}>{m.status}</span>
                            <span className="text-[10px] font-black text-slate-600 tracking-widest">{m.date}</span>
                        </div>
                        <h4 className="text-white font-black">{m.label}</h4>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
