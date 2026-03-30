import { motion } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const diseaseData = [
    { month: 'Jan', influenza: 450, malaria: 320, covid: 120 },
    { month: 'Feb', influenza: 520, malaria: 300, covid: 210 },
    { month: 'Mar', influenza: 480, malaria: 450, covid: 450 },
    { month: 'Apr', influenza: 400, malaria: 600, covid: 380 },
    { month: 'May', influenza: 350, malaria: 820, covid: 290 },
    { month: 'Jun', influenza: 310, malaria: 950, covid: 150 },
];

export default function DiseaseStats() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 flex flex-col gap-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-[#E879F9] tracking-tight">
                        Disease Intelligence
                    </h1>
                    <p className="text-slate-400 font-medium mt-1">
                        Global epidemiological trends and predictive pandemic monitoring.
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-[#FACC15]">
                        Live Feed: Active
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Chart 1: Area Trends */}
                <div className="card-nova p-8 bg-black/40 border-white/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-4xl">📈</div>
                    <h3 className="text-lg font-black text-white mb-8 border-b border-white/5 pb-4">Prevalence Velocity (6M)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={diseaseData}>
                                <defs>
                                    <linearGradient id="colorFlu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#475569" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="malaria" stroke="#FACC15" fillOpacity={1} fill="url(#colorFlu)" strokeWidth={3} />
                                <Area type="monotone" dataKey="influenza" stroke="#E879F9" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Direct Comparison */}
                <div className="card-nova p-8 bg-black/40 border-white/10">
                    <h3 className="text-lg font-black text-white mb-8 border-b border-white/5 pb-4">Emerging Viral Gaps</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={diseaseData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" stroke="#475569" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ background: '#0a1628', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Line type="stepAfter" dataKey="covid" stroke="#3B82F6" strokeWidth={4} dot={{ r: 6, fill: '#3B82F6', strokeWidth: 0 }} />
                                <Line type="monotone" dataKey="influenza" stroke="#6366f1" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stat Cards Row */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Highest Risk', val: 'Tropical Malaria', change: '+12%', color: '#FACC15' },
                        { label: 'Seasonal Alert', val: 'Influenza B', change: '-4%', color: '#E879F9' },
                        { label: 'Pandemic Index', val: '0.14 Stable', change: '0.0', color: '#3B82F6' },
                        { label: 'Vaccination Coverage', val: '88.4%', change: '+2.1%', color: '#10B981' },
                    ].map(stat => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -5 }}
                            className="bg-white/5 border border-white/10 p-6 rounded-3xl"
                        >
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                            <div className="text-xl font-black text-white mb-1">{stat.val}</div>
                            <div className="text-[11px] font-bold" style={{ color: stat.color }}>{stat.change} vs Last Month</div>
                        </motion.div>
                    ))}
                </div>

                {/* Map Simulation / Regional Health */}
                <div className="lg:col-span-2 card-nova p-8 flex items-center justify-between gap-10">
                    <div className="flex-1">
                        <h3 className="text-2xl font-black text-white mb-4">Regional Outbreak Heatmap</h3>
                        <p className="text-slate-400 font-medium mb-6">Nova AI is monitoring real-time admission clusters in surrounding sectors. Current density remains within clinical safety margins.</p>
                        <div className="space-y-4">
                            {['Sector A (North)', 'Sector B (Central)', 'Sector C (South)'].map((s, i) => (
                                <div key={s} className="flex items-center gap-4">
                                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-transparent to-[#FACC15]" style={{ width: `${80 - i * 20}%` }}></div>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-500 whitespace-nowrap w-32">{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:flex w-64 h-64 bg-[#FACC15]/5 rounded-full border border-[#FACC15]/20 items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(250,204,21,0.1),transparent)] animate-pulse"></div>
                        <span className="text-5xl">🌍</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
