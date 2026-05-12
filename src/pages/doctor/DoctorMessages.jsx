import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";
import socketService from "../../services/socket";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Search, MoreVertical, Phone, Video, 
  User, CheckCheck, Clock, Brain, Shield,
  ChevronLeft, Sparkles, Filter
} from 'lucide-react';

export default function DoctorMessages() {
    const { user } = useAuth();
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        // Load patients
        API.get("/patients")
           .then(res => setPatients(res.data))
           .catch(console.error);

        // Connect socket
        const socket = socketService.connect(localStorage.getItem('token'));
        
        socketService.onMessage((msg) => {
            if (selectedPatient && (msg.senderId === selectedPatient.id || msg.receiverId === selectedPatient.id)) {
                setMessages(prev => [...prev, msg]);
            }
        });

        return () => socketService.disconnect();
    }, [selectedPatient]);

    useEffect(() => {
        if (!selectedPatient || !user?.id) return;
        
        // Fetch history
        API.get(`/api/chat/history?user1=${user.id}&user2=${selectedPatient.id}`)
            .then(res => setMessages(res.data))
            .catch(console.error);
            
        // Join room
        const roomId = [user.id, selectedPatient.id].sort().join('-');
        socketService.joinRoom(roomId);
        
        return () => socketService.leaveRoom(roomId);
    }, [selectedPatient, user]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedPatient) return;

        const roomId = [user.id, selectedPatient.id].sort().join('-');
        const msgData = {
            senderId: user.id,
            receiverId: selectedPatient.id,
            roomId,
            content: input,
            senderRole: "DOCTOR",
            timestamp: new Date().toISOString()
        };

        try {
            await API.post("/chat/send", msgData);
            socketService.sendMessage(msgData);
            setMessages(prev => [...prev, msgData]);
            setInput("");
        } catch (error) {
            console.error("Transmission failed", error);
        }
    };

    const filteredPatients = patients.filter(p => 
        p.fullName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-2rem)] medical-grid overflow-hidden rounded-[2rem] border border-white/5 bg-slate-900/50 backdrop-blur-3xl m-4">
            {/* Sidebar */}
            <div className={`w-full md:w-96 flex flex-col border-r border-white/5 bg-black/20 ${selectedPatient ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-8 border-bottom border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            MESSAGES <span className="text-blue-400 text-xs font-mono border border-blue-400/30 px-2 rounded">SECURE</span>
                        </h2>
                        <div className="w-10 h-10 glass-card flex items-center justify-center text-slate-400">
                            <Filter className="w-4 h-4" />
                        </div>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text"
                            placeholder="Identify Patient..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-blue-400/50 transition-all font-mono"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scroll">
                    {filteredPatients.map(p => (
                        <motion.div
                            key={p.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedPatient(p)}
                            className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                                selectedPatient?.id === p.id 
                                ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]' 
                                : 'bg-transparent border-transparent hover:bg-white/5'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.fullName}`} alt="Avatar" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-black text-white text-sm truncate">{p.fullName}</h4>
                                        <span className="text-[10px] font-mono text-slate-500">12:45</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate font-medium">Monitoring vitals for last 24h...</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col relative bg-black/10 ${!selectedPatient ? 'hidden md:flex' : 'flex'}`}>
                {selectedPatient ? (
                    <>
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl relative z-10">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedPatient(null)} className="md:hidden p-2 text-slate-400">
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${selectedPatient.fullName}`} alt="Avatar" className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white tracking-tight">{selectedPatient.fullName}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="status-indicator status-online" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Biometric Link Active</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                    <Video className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 glass-card flex items-center justify-center text-slate-400 hover:text-white transition-all">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scroll">
                            {messages.map((m, i) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i}
                                    className={`flex ${m.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] space-y-2 ${m.senderId === user.id ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-4 rounded-3xl relative ${
                                            m.senderId === user.id 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5'
                                        }`}>
                                            <p className="text-sm leading-relaxed font-medium">{m.content || m.message}</p>
                                            <div className={`absolute top-0 w-4 h-4 ${
                                                m.senderId === user.id 
                                                ? '-right-1 bg-blue-600' 
                                                : '-left-1 bg-slate-800 border-l border-t border-white/5'
                                            } rotate-45 -z-10`} />
                                        </div>
                                        <div className="flex items-center gap-2 px-2">
                                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                                                {m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now"}
                                            </span>
                                            {m.senderId === user.id && <CheckCheck className="w-3 h-3 text-blue-400" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* AI Input Area */}
                        <div className="p-6 bg-slate-900/60 backdrop-blur-3xl border-t border-white/5 relative">
                            {/* AI Suggestion Chip */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-12 left-6 flex gap-2"
                            >
                                <div className="px-4 py-2 glass-card bg-blue-500/10 border-blue-500/20 flex items-center gap-2 cursor-pointer hover:bg-blue-500/20 transition-all">
                                    <Sparkles className="w-3 h-3 text-blue-400" />
                                    <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">AI: Suggest Protocol</span>
                                </div>
                            </motion.div>

                            <form onSubmit={handleSendMessage} className="relative group">
                                <input 
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Execute medical consultation sequence..."
                                    className="w-full bg-slate-950/80 border border-white/10 rounded-[1.5rem] pl-6 pr-16 py-6 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-600"
                                />
                                <button 
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                            <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">End-to-End Encryption Enabled</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Brain className="w-3 h-3" />
                                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Neural Assist v2.4 Active</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-32 h-32 glass-card flex items-center justify-center text-blue-400 mb-8 animate-float">
                            <Brain className="w-16 h-16 opacity-20" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tighter">SELECT CLINICAL SUBJECT</h2>
                        <p className="max-w-xs text-slate-500 text-sm font-medium leading-relaxed">
                            Initialize a secure communication link with a patient to begin remote diagnostics.
                        </p>
                    </div>
                )}
            </div>

            {/* Global HUD Effect */}
            <div className="fixed inset-0 pointer-events-none scanline opacity-[0.02]" />
        </div>
    );
}
