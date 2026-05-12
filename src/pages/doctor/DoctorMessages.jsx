import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, MoreVertical, Search, Phone, Video, 
    Check, CheckCheck, Clock, User, MessageCircle,
    Shield, Sparkles, Circle, Paperclip, Loader2,
    Users, Activity, ChevronLeft, Radar, Zap
} from "lucide-react";

export default function DoctorMessages() {
    const { user } = useAuth();
    const {
        conversations,
        activeConversation,
        messages,
        loading,
        onlineUsers,
        typingUsers,
        fetchConversations,
        sendMessage,
        sendTypingIndicator,
        switchConversation,
        isUserOnline,
        isUserTyping,
        isConnected
    } = useChat();
    
    const [input, setInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeConversation) return;
        
        await sendMessage(activeConversation.id, input);
        setInput("");
        handleStopTyping();
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        
        if (!isTyping && e.target.value.trim() && activeConversation) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation.id, true);
        }
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => handleStopTyping(), 1000);
    };

    const handleStopTyping = () => {
        setIsTyping(false);
        if (activeConversation) {
            sendTypingIndicator(activeConversation.id, false);
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const filteredConversations = conversations.filter(conv => 
        conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-5rem)] p-6 gap-6 overflow-hidden relative selection:bg-cyan-500/30">
            <div className="absolute inset-0 medical-grid opacity-20 pointer-events-none" />
            
            {/* Conversations Sidebar */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-96 glass-card flex flex-col p-6 overflow-hidden border-white/5 bg-slate-950/40 relative z-10"
            >
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Neural <span className="text-cyan-400">Nodes</span></h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500'} animate-pulse`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {isConnected ? 'Link Stable' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="relative mb-8 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search Subjects..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-xs text-white focus:outline-none focus:border-cyan-500/30 transition-all font-bold placeholder:text-slate-700 uppercase"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-2">
                    {filteredConversations.map(conv => (
                        <motion.div 
                            key={conv.id} 
                            onClick={() => switchConversation(conv)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`p-4 rounded-[1.5rem] cursor-pointer transition-all border ${
                                activeConversation?.id === conv.id 
                                ? "bg-cyan-500/10 border-cyan-500/30 shadow-xl" 
                                : "bg-white/[0.02] border-transparent hover:bg-white/[0.05] hover:border-white/5"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 p-0.5 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conv.participantName}&backgroundColor=transparent`} 
                                             alt="P" className="w-full h-full object-cover" />
                                    </div>
                                    {isUserOnline(conv.participantId) && (
                                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-black text-white text-[11px] truncate uppercase tracking-tight">{conv.participantName}</span>
                                        {conv.lastMessageTime && (
                                            <span className="text-[8px] font-black text-slate-600 uppercase">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate font-bold uppercase tracking-tight">{conv.lastMessage || "Initialize Briefing..."}</div>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[9px] font-black text-white shadow-lg shadow-cyan-500/30">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-600 opacity-30">
                            <Users size={40} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Synchronized Nodes</p>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Chat Interface */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 glass-card flex flex-col p-0 relative overflow-hidden border-white/5 bg-slate-950/20 z-10"
            >
                {activeConversation ? (
                    <>
                        {/* Interactive Header */}
                        <div className="px-10 py-8 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-2xl shadow-cyan-500/10">
                                    <div className="w-full h-full rounded-3xl bg-slate-950 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeConversation.participantName}&backgroundColor=transparent`} 
                                             alt="P" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{activeConversation.participantName}</h3>
                                        <span className="text-[9px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full font-black uppercase tracking-widest">SUBJECT-{activeConversation.participantId?.slice(0,4)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${isUserOnline(activeConversation.participantId) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse' : 'bg-slate-600'} rounded-full`} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                            {isUserOnline(activeConversation.participantId) ? 'Bio-Telemetry Online' : 'Telemetry Link Severed'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button className="p-4 bg-white/[0.02] hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-2xl border border-white/5 transition-all group">
                                    <Phone size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button className="p-4 bg-white/[0.02] hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 rounded-2xl border border-white/5 transition-all group">
                                    <Video size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button className="p-4 bg-white/[0.02] hover:bg-slate-800 text-slate-400 rounded-2xl border border-white/5 transition-all">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tactical Message Stream */}
                        <div className="flex-1 px-10 py-10 overflow-y-auto custom-scroll flex flex-col gap-8 relative">
                            <div className="absolute inset-0 scanline opacity-[0.01] pointer-events-none" />
                            
                            {messages.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-20 italic">
                                    <MessageCircle size={48} className="mb-4" />
                                    <p className="text-xs uppercase font-black tracking-widest">No Transmissions Recorded</p>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[65%] flex flex-col ${m.senderId === user.id ? "items-end" : "items-start"}`}>
                                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-bold shadow-2xl relative ${
                                            m.senderId === user.id 
                                            ? "bg-cyan-600/10 border border-cyan-500/30 text-white rounded-br-none" 
                                            : "bg-slate-900 border border-white/5 text-slate-200 rounded-bl-none"
                                        }`}>
                                            {m.senderId === user.id && (
                                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500/20 rounded-full blur-xl" />
                                            )}
                                            {m.content}
                                        </div>
                                        <div className={`flex items-center gap-3 mt-3 px-2 text-[9px] font-black uppercase text-slate-600 ${m.senderId === user.id ? "flex-row-reverse" : "flex-row"}`}>
                                            <span className="tracking-widest">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Live"}</span>
                                            {m.senderId === user.id && (
                                                <div className="flex items-center gap-1 text-cyan-400">
                                                    <CheckCheck size={12} />
                                                    <span className="tracking-tighter">SENT</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isUserTyping(activeConversation?.participantId) && (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-900/80 px-5 py-3 rounded-full border border-white/5 flex gap-2 items-center shadow-xl">
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        <span className="text-[8px] font-black text-cyan-400/60 uppercase tracking-widest ml-1">Inputting...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Neural Input HUD */}
                        <div className="px-10 py-10 border-t border-white/5 bg-slate-950/60 backdrop-blur-2xl">
                            <form onSubmit={handleSendMessage} className="flex gap-5 items-center bg-slate-900/50 p-2.5 rounded-[2.5rem] border border-white/10 shadow-inner group focus-within:border-cyan-500/30 transition-all">
                                <div className="w-12 h-12 rounded-full bg-white/[0.03] flex items-center justify-center text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                                    <Paperclip size={18} />
                                </div>
                                <input
                                    type="text" 
                                    value={input} 
                                    onChange={handleInputChange}
                                    onBlur={handleStopTyping}
                                    placeholder="Enter clinical directive or briefing..."
                                    className="flex-1 bg-transparent py-4 px-2 text-white text-[13px] font-bold focus:outline-none placeholder:text-slate-700 uppercase tracking-tight"
                                />
                                <div className="flex items-center gap-3 pr-2">
                                    <button type="button" className="p-3 text-slate-600 hover:text-indigo-400 transition-colors">
                                        <Sparkles size={20} />
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={!input.trim()}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                            input.trim() 
                                            ? "bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105 active:scale-95" 
                                            : "bg-slate-800 text-slate-600"
                                        }`}
                                    >
                                        <Send size={20} className={input.trim() ? "translate-x-0.5" : ""} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative overflow-hidden">
                        <div className="absolute inset-0 medical-grid opacity-10" />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="w-32 h-32 rounded-full border-2 border-cyan-500/10 flex items-center justify-center mb-8 relative">
                                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping opacity-20" />
                                <MessageCircle size={64} className="text-cyan-500/30 animate-pulse" />
                            </div>
                        </motion.div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] italic">Initialize <span className="text-cyan-400">Bio-Link</span></h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-4 max-w-sm leading-relaxed">Secure tactical briefing conduit. Select clinical subject to synchronize neural telemetry and begin transmission.</p>
                        
                        <div className="mt-12 grid grid-cols-3 gap-6 opacity-30">
                            {[
                                { icon: <Shield size={16} />, label: "Encrypted" },
                                { icon: <Zap size={16} />, label: "Low Latency" },
                                { icon: <Radar size={16} />, label: "Secure Link" }
                            ].map((badge, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">{badge.icon}</div>
                                    <span className="text-[8px] font-black uppercase tracking-widest">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
