import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import { generatePrescriptionPDF } from "../../utils/pdfGenerator";

export default function PatientPrescriptions() {
    const { user } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.id) fetchPrescriptions();
    }, [user]);

    const fetchPrescriptions = async () => {
        try {
            const res = await API.get(`/prescriptions/patient/${user.id}`);
            setPrescriptions(res.data);
        } catch (error) {
            console.error("Failed to fetch", error);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = (p) => {
        generatePrescriptionPDF(p, user);
    };

    return (
        <div className="p-8 min-h-screen relative z-10 w-full max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tight mb-2 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    My <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#0EA5E9] filter drop-shadow-[0_0_20px_rgba(236,72,153,0.4)]">Prescriptions</span>
                </h1>
                <p className="text-slate-300 font-medium text-sm">{prescriptions.length} official prescription(s) from your doctor</p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="w-8 h-8 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin shadow-[0_0_15px_rgba(139,92,246,0.6)]"></div>
                </div>
            ) : prescriptions.length === 0 ? (
                <div className="glass-panel p-16 text-center border-dashed border-2 border-white/20">
                    <div className="text-5xl mb-4 animate-bounce">💊</div>
                    <div className="text-xl font-bold text-white mb-2">No prescriptions found</div>
                    <div className="text-slate-400">Your doctor will add prescriptions after your appointment.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prescriptions.map(p => (
                        <div key={p.id} className="card-nova p-6 shadow-lg group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#EC4899]/20 flex items-center justify-center text-2xl border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        💊
                                    </div>
                                    <div>
                                        <div className="font-black text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#8B5CF6] group-hover:to-[#EC4899] transition-all">Rx #{p.id} - Dr. {p.doctor?.name || "Unknown"}</div>
                                        <div className="text-xs text-slate-400 font-medium">{new Date(p.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button onClick={() => downloadPDF(p)} className="bg-white/5 border border-white/10 hover:bg-gradient-to-r hover:from-[#8B5CF6] hover:to-[#EC4899] hover:border-transparent text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] active:scale-95">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                </button>
                            </div>
                            <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
                                <div className="flex justify-between items-center mb-2">
                                    <span className={`font-black tracking-wide text-[10px] uppercase px-3 py-1 rounded-lg ${p.status === 'APPROVED' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`}>{p.status}</span>
                                    <span className="text-white font-bold text-xs">{p.items?.length || 0} Medications</span>
                                </div>
                                <div className="space-y-3">
                                    {p.items?.map((item, idx) => (
                                        <div key={idx} className="bg-slate-800/50 rounded-xl p-3 border border-white/5 flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-white">{item.medicineName}</span>
                                                <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">{item.duration}</span>
                                            </div>
                                            <span className="text-xs text-slate-400">{item.dosage}</span>
                                            {item.instructions && <span className="text-[10px] text-slate-500 italic mt-1">{item.instructions}</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
