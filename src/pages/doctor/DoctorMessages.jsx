import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Send, MoreVertical, Search, Phone, Video, 
    Check, CheckCheck, Clock, User, MessageCircle,
    Shield, Sparkles, Circle, Paperclip, Loader2,
    Users, Activity, ChevronLeft
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
        
        if (!isTyping && e.target.value.trim()) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation?.id, true);
        }
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => handleStopTyping(), 1000);
    };

    const handleStopTyping = () => {
        setIsTyping(false);
        sendTypingIndicator(activeConversation?.id, false);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    const filteredConversations = conversations.filter(conv => 
        conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-8rem)] gap-6 p-4 overflow-hidden relative">
            {/* Sidebar */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 hologram-card flex flex-col p-6 overflow-hidden bg-slate-900/40"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white tracking-tight uppercase">Patients</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-500' : 'bg-rose-500'} animate-pulse`} />
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {isConnected ? 'Sync Active' : 'Offline'}
                        </span>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Neural Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all font-bold placeholder:text-slate-700"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-1">
                    {filteredConversations.map(conv => (
                        <motion.div 
                            key={conv.id} 
                            onClick={() => switchConversation(conv)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                                activeConversation?.id === conv.id 
                                ? "bg-cyan-600/20 border-cyan-500/30 shadow-lg" 
                                : "bg-white/5 border-transparent hover:bg-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${conv.participantName}&backgroundColor=transparent`} 
                                         alt="P" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                                    {isUserOnline(conv.participantId) && (
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-500 border-2 border-slate-900 rounded-full" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-black text-white text-xs truncate uppercase tracking-tight">{conv.participantName}</div>
                                    <div className="text-[9px] text-slate-500 truncate mt-1 uppercase font-bold">{conv.lastMessage || "Start Briefing"}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 hologram-card flex flex-col p-0 relative overflow-hidden bg-slate-900/20"
            >
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/5 bg-slate-900/40 backdrop-blur-md flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px]">
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${activeConversation.participantName}&backgroundColor=transparent`} 
                                         alt="P" className="w-full h-full rounded-2xl bg-slate-900 object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">{activeConversation.participantName}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${isUserOnline(activeConversation.participantId) ? 'bg-cyan-500 animate-pulse' : 'bg-slate-600'} rounded-full`} />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {isUserOnline(activeConversation.participantId) ? 'Biometric Link Active' : 'Uplink Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-white/5 hover:bg-cyan-500/10 text-slate-300 rounded-xl border border-white/5 transition-all"><Phone size={18} /></button>
                                <button className="p-3 bg-white/5 hover:bg-cyan-500/10 text-slate-300 rounded-xl border border-white/5 transition-all"><Video size={18} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 px-8 py-8 overflow-y-auto custom-scroll flex flex-col gap-6">
                            {messages.map((m, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[70%] ${m.senderId === user.id ? "items-end" : "items-start"}`}>
                                        <div className={`px-6 py-3 rounded-2xl text-xs font-bold shadow-2xl ${
                                            m.senderId === user.id 
                                            ? "bg-cyan-600/20 border border-cyan-500/30 text-white rounded-br-none" 
                                            : "bg-slate-800/80 border border-white/5 text-slate-100 rounded-bl-none"
                                        }`}>
                                            {m.content}
                                        </div>
                                        <div className={`flex items-center gap-2 mt-2 px-2 text-[8px] font-black uppercase text-slate-500 ${m.senderId === user.id ? "flex-row-reverse" : "flex-row"}`}>
                                            <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                                            {m.senderId === user.id && <CheckCheck size={10} className="text-cyan-400" />}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isUserTyping(activeConversation?.participantId) && (
                                <div className="flex justify-start">
                                    <div className="bg-slate-800/50 px-4 py-2 rounded-full border border-white/5 flex gap-1 items-center">
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" />
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="px-8 py-8 border-t border-white/5 bg-slate-900/40 backdrop-blur-xl">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-center bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                                <input
                                    type="text" 
                                    value={input} 
                                    onChange={handleInputChange}
                                    onBlur={handleStopTyping}
                                    placeholder="Enter medical directive..."
                                    className="flex-1 bg-transparent py-3 px-4 text-white text-xs font-bold focus:outline-none placeholder:text-slate-700 uppercase"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim()}
                                    className={`p-3 rounded-xl transition-all ${
                                        input.trim() ? "bg-cyan-600 text-white shadow-lg shadow-cyan-600/30" : "bg-slate-800 text-slate-500"
                                    }`}
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                        <MessageCircle size={80} className="text-cyan-400 mb-6" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Select Bio-Link</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Initialize secure tactical briefing with clinical subject</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
