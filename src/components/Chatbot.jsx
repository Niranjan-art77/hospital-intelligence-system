import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "nova_chatbot_messages";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch {
            // ignore
        }
        return [
            {
                text: "Hello! I am your AI Health Assistant. How can I help you regarding records, symptoms, or medical insights today?",
                sender: "bot",
            },
        ];
    });
    const [input, setInput] = useState("");

    useEffect(() => {
        try {
            const trimmed = messages.slice(-40);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch {
            // ignore
        }
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        // Mock bot response
        setTimeout(() => {
            const lower = input.toLowerCase();
            let botResponse = "I am processing your query. For deeper context, open the relevant dashboard tile or patient record.";

            if (lower.includes("risk")) {
                botResponse = "The AI risk score is calculated from age, BMI, vitals and chronic conditions. Scores above 70 surface in the High Risk and dashboard alert widgets.";
            } else if (lower.includes("pharmacy")) {
                botResponse = "You can review medicines and stock levels in the Pharmacy modules. Admins see verification and stock; patients see scripts in their dashboard.";
            } else if (lower.includes("symptom") || lower.includes("fever") || lower.includes("headache")) {
                botResponse = "For symptom analysis, try the AI Symptom Checker. Patients can open it from the Symptom AI item in the left navigation, or via the neural diagnosis panel on the dashboard.";
            } else if (lower.includes("appointment")) {
                botResponse = "Appointments can be managed from the Appointments section. Patients have it under their portal, doctors see upcoming sessions on their dashboard.";
            }
            setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
        }, 1000);
    };

    return (
        <>
            <div className="fixed bottom-8 right-8 z-50">
                <div className="relative group">
                    {/* Pulsating glow rings */}
                    <div className="absolute inset-0 rounded-full bg-[#0EA5E9] opacity-40 blur-md animate-[ping_3s_ease-in-out_infinite]"></div>
                    <div className="absolute inset-[-4px] rounded-full bg-[#8B5CF6] opacity-30 blur-lg animate-pulse"></div>

                    <motion.button
                        onClick={() => setIsOpen(!isOpen)}
                        whileHover={{ scale: 1.1, rotate: isOpen ? 90 : 0 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#0EA5E9] to-[#8B5CF6] flex items-center justify-center shadow-[0_0_25px_rgba(14,165,233,0.6)] border border-white/30 z-10 overflow-hidden group-hover:shadow-[0_0_35px_rgba(139,92,246,0.8)] transition-shadow"
                    >
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {isOpen ? <span className="text-2xl text-white">✕</span> : <span className="text-3xl text-white drop-shadow-md relative z-10">🤖</span>}
                    </motion.button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 50, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, y: 50, scale: 0.8 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-28 right-8 w-96 max-w-[calc(100vw-40px)] z-50 bg-[#0B1120]/95 backdrop-blur-2xl border border-[#1E293B] rounded-2xl overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(14,165,233,0.2)]"
                        style={{ height: '500px' }}
                    >
                        <div className="bg-[#0F172A] p-4 border-b border-[#1E293B] flex items-center gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold text-white uppercase tracking-widest text-sm">Nova Health AI</h3>
                                <div className="flex items-center gap-1.5 text-xs text-[#10B981]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> Online
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scroll">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user"
                                            ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-none shadow-lg"
                                            : "bg-white/10 text-slate-200 border border-white/10 rounded-bl-none shadow-md backdrop-blur-md"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask HealthSync AI..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold tracking-wider hover:bg-indigo-400 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                            >
                                SEND
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
