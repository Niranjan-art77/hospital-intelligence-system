import { useState } from 'react';
import { motion } from 'framer-motion';

export default function FamilyProfiles() {
    const [family, setFamily] = useState([
        { id: 1, name: "John Doe", relation: "Father", age: 58, pic: "👨", access: "Full" },
        { id: 2, name: "Jane Doe", relation: "Mother", age: 55, pic: "👩", access: "Read-only" },
        { id: 3, name: "Jimmy Doe", relation: "Son", age: 8, pic: "👦", access: "Managed" },
    ]);

    const handleAdd = () => {
        const name = prompt("Enter family member name:");
        if (name) {
            setFamily([...family, { id: Date.now(), name, relation: "Relative", age: 30, pic: "👤", access: "Read-only" }]);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
                        Family Health Profiles
                    </h1>
                    <p className="text-slate-400 mt-2">Manage medical records for your entire family in one place.</p>
                </div>
                <button onClick={handleAdd} className="btn-primary from-teal-500 to-emerald-500 border border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.5)]">
                    + Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {family.map(member => (
                    <motion.div key={member.id} whileHover={{ y: -5 }} className="glass-panel p-6 border-t border-white/20 relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-4xl shadow-inner shadow-black/50">
                                {member.pic}
                            </div>
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-widest uppercase text-slate-300">
                                {member.access}
                            </span>
                        </div>
                        <h3 className="text-xl font-black text-white">{member.name}</h3>
                        <p className="text-slate-400 text-sm font-bold mb-6">{member.relation} • {member.age} yrs</p>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition">View Ledger</button>
                            <button className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/20 transition">Remove</button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
