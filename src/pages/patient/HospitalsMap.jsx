import { motion } from 'framer-motion';

export default function HospitalsMap() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                    Nearby Health Facilities
                </h1>
                <p className="text-slate-400 mt-2">Find partnered Nova Health clinics and emergency centers near your location.</p>
            </div>

            <div className="glass-panel flex-1 rounded-3xl overflow-hidden border border-white/10 relative p-2">
                {/* Embed a stylized Google Map matching dark theme for the demo */}
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c64a7c11%3A0x2f901a1c31215bb!2sMount%20Sinai%20West!5e0!3m2!1sen!2sus!4v1689000000000!5m2!1sen!2sus"
                    className="w-full h-full rounded-2xl opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700"
                    style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Hospitals Map"
                ></iframe>

                <div className="absolute top-6 left-6 right-6 flex gap-4 pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl pointer-events-auto flex-1 max-w-xs shadow-2xl">
                        <h3 className="text-white font-black mb-2 flex justify-between items-center">
                            Mount Sinai West <span className="text-green-400 text-xs px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">Open 24/7</span>
                        </h3>
                        <p className="text-slate-400 text-xs mb-3">1.2 miles away • Estimated Wait: 12 min</p>
                        <button className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg text-white font-bold text-xs shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                            Navigate ER
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
