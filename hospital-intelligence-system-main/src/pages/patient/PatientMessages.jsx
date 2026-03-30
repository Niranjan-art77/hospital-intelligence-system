import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { uploadToCloudinary } from "../../services/cloudinary";
import { 
    Send, MoreVertical, Search, Phone, Video, 
    Check, CheckCheck, Clock, User, MessageCircle,
    UserPlus, Shield, Sparkles, Circle, Paperclip, Loader2
} from "lucide-react";

export default function PatientMessages() {
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
        startConversation,
        sendTypingIndicator,
        switchConversation,
        isUserOnline,
        isUserTyping,
        isConnected
    } = useChat();
    
    const [doctors, setDoctors] = useState([]);
    const [input, setInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        API.get("/doctors").then(res => setDoctors(res.data)).catch(console.error);
        fetchConversations();
    }, [fetchConversations]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeConversation) return;
        
        await sendMessage(activeConversation.id, input);
        setInput("");
        handleStopTyping();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeConversation) return;

        setUploadingFile(true);
        try {
            const cloudinaryData = await uploadToCloudinary(file);
            await sendMessage(activeConversation.id, cloudinaryData.url);
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        
        if (!isTyping && e.target.value.trim()) {
            setIsTyping(true);
            sendTypingIndicator(activeConversation?.id, true);
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 1000);
    };

    const handleStopTyping = () => {
        setIsTyping(false);
        sendTypingIndicator(activeConversation?.id, false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    const selectDoctor = async (doctor) => {
        // Check if conversation already exists
        const existingConversation = conversations.find(conv => 
            conv.participants?.includes(doctor.id)
        );
        
        if (existingConversation) {
            switchConversation(existingConversation);
        } else {
            const newConversation = await startConversation(doctor.id);
            if (newConversation) {
                switchConversation(newConversation);
            }
        }
    };

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 p-4 overflow-hidden relative">
            {/* Doctor List (Sidebar) */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-80 glass-card-glowing flex flex-col p-6 overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white tracking-tight">Consultations</h2>
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            {isConnected ? 'Connected' : 'Reconnecting...'}
                        </span>
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                            <UserPlus size={18} />
                        </div>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search specialists..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium placeholder:text-slate-700"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scroll space-y-3 pr-1">
                    {conversations.map(conv => (
                        <motion.div 
                            key={conv.id} 
                            onClick={() => switchConversation(conv)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-3xl cursor-pointer transition-all border ${
                                activeConversation?.id === conv.id 
                                ? "bg-blue-600/20 border-blue-500/30 shadow-lg shadow-blue-500/5" 
                                : "bg-white/5 border-transparent hover:bg-white/10"
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img src={conv.participantImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${conv.participantName}&backgroundColor=transparent`} 
                                         alt={conv.participantName} 
                                         className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isUserOnline(conv.participantId) ? 'bg-emerald-500' : 'bg-slate-600'} border-2 border-slate-900 rounded-full shadow-lg`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="font-black text-white text-sm truncate">{conv.participantName}</div>
                                        {conv.unreadCount > 0 && (
                                            <div className="bg-blue-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest truncate">{conv.specialization}</div>
                                    {conv.lastMessage && (
                                        <div className="text-[10px] text-slate-600 truncate mt-1">
                                            {conv.lastMessage}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    
                    {/* Available Doctors */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Available Specialists</p>
                        {filteredDoctors.map(doc => (
                            <motion.div 
                                key={doc.id} 
                                onClick={() => selectDoctor(doc)}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-4 rounded-3xl cursor-pointer transition-all border bg-white/5 border-transparent hover:bg-white/10 mb-3"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img src={doc.profileImage} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover border border-white/10" />
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${isUserOnline(doc.id) ? 'bg-emerald-500' : 'bg-slate-600'} border-2 border-slate-900 rounded-full shadow-lg`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-white text-sm truncate">{doc.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest truncate">{doc.specialization}</div>
                                    </div>
                                    {isUserOnline(doc.id) && (
                                        <Circle className="w-2 h-2 text-emerald-500 fill-current" />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
                
                <div className="mt-4 p-4 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                    <div className="flex items-center gap-3 text-blue-400 mb-1">
                        <Shield size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                </div>
            </motion.div>

            {/* Chat Area */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 glass-card-glowing flex flex-col p-0 relative overflow-hidden"
            >
                {activeConversation ? (
                    <>
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-white/5 bg-slate-900/20 backdrop-blur-md flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
                                    <img src={activeConversation.participantImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${activeConversation.participantName}&backgroundColor=transparent`} 
                                         alt={activeConversation.participantName} 
                                         className="w-full h-full rounded-2xl bg-slate-900 object-cover" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white">{activeConversation.participantName}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 ${isUserOnline(activeConversation.participantId) ? 'bg-emerald-500' : 'bg-slate-600'} rounded-full ${isUserOnline(activeConversation.participantId) ? 'animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`} />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                            {isUserOnline(activeConversation.participantId) ? 'Online' : 'Offline'} • Secure Global Uplink High-Def
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl transition-all border border-white/5 active:scale-95">
                                    <Phone size={20} />
                                </button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl transition-all border border-white/5 active:scale-95">
                                    <Video size={20} />
                                </button>
                                <button className="p-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl transition-all border border-white/5 active:scale-95">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 px-8 py-8 overflow-y-auto custom-scroll flex flex-col gap-6 relative">
                            {/* Decorative Blur */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                            
                            {messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center m-auto text-center py-20 grayscale opacity-30">
                                    <MessageCircle size={64} className="mb-4 text-blue-400" />
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Initialize Consultation Stream</p>
                                </div>
                            ) : messages.map((m, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex ${m.senderId === user.id ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[70%] relative group ${m.senderId === user.id ? "items-end" : "items-start"}`}>
                                        <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-2xl transition-all ${
                                            m.senderId === user.id 
                                            ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-none" 
                                            : "bg-slate-800/80 backdrop-blur-xl border border-white/5 text-slate-100 rounded-bl-none shadow-indigo-500/5"
                                        }`}>
                                            {m.content.includes('res.cloudinary.com') ? (
                                                <img src={m.content} alt="Attachment" className="max-w-[200px] sm:max-w-[250px] rounded-xl mt-1 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(m.content, '_blank')} />
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 mt-2 px-2 text-[10px] font-bold uppercase tracking-tighter text-slate-500 ${m.senderId === user.id ? "flex-row-reverse" : "flex-row"}`}>
                                            <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}</span>
                                            {m.senderId === user.id && (
                                                <span className="text-blue-400">
                                                    {m.status === "SEEN" ? <CheckCheck size={14} /> : m.status === "DELIVERED" ? <CheckCheck size={14} /> : <Check size={14} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            <AnimatePresence>
                                {(isUserTyping(activeConversation?.participantId) || typingUsers.has(activeConversation?.participantId)) && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-slate-800/50 backdrop-blur-md px-6 py-4 rounded-[2rem] rounded-bl-none border border-white/5 flex gap-1 items-center">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={scrollRef} />
                        </div>

                        {/* Input */}
                        <div className="px-8 py-8 border-t border-white/5 bg-slate-900/30 backdrop-blur-xl relative z-10">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-center bg-slate-950/50 p-2 rounded-[2.5rem] border border-white/5 shadow-inner group/form focus-within:border-blue-500/30 transition-all">
                                <div className="pl-4 text-slate-600 group-hover/form:text-blue-400 transition-colors">
                                    <Sparkles size={20} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept="image/*,.pdf"
                                />
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingFile}
                                    className="text-slate-500 hover:text-blue-400 p-2 ml-2 transition-colors disabled:opacity-50"
                                >
                                    {uploadingFile ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                                </button>
                                <input
                                    type="text" 
                                    value={input} 
                                    onChange={handleInputChange}
                                    onBlur={handleStopTyping}
                                    placeholder="Execute medical query..."
                                    className="flex-1 bg-transparent py-4 text-white text-sm font-bold focus:outline-none placeholder:text-slate-700"
                                />
                                <button 
                                    type="submit" 
                                    disabled={!input.trim()}
                                    className={`p-4 rounded-[2rem] shadow-glow transition-all active:scale-95 flex items-center justify-center group/btn ${
                                        input.trim() 
                                        ? "bg-blue-600 text-white hover:bg-blue-500" 
                                        : "bg-slate-800 text-slate-500 grayscale opacity-50"
                                    }`}
                                >
                                    <Send size={20} className="group-hover/btn:rotate-12 transition-transform" />
                                </button>
                            </form>
                            <p className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] mt-4">Verified Bio-Metric Secure Channel</p>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center relative">
                        {/* Background Pulsing Orb */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 rounded-full blur-[120px] animate-pulse" />
                        
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <div className="w-40 h-40 bg-white/5 border border-white/10 rounded-[4rem] flex items-center justify-center mb-10 shadow-3xl hover:border-blue-500/30 transition-all group">
                                <div className="absolute inset-0 bg-blue-500/10 rounded-[4rem] blur-2xl group-hover:bg-blue-500/20 transition-all" />
                                <MessageCircle size={80} className="text-blue-400 opacity-20 group-hover:opacity-50 transition-all" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Initialize Link</h2>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed font-medium uppercase tracking-widest text-xs">Select a specialist to begin secure tactical health briefing.</p>
                            
                            {!isConnected && (
                                <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                                    <p className="text-rose-400 text-xs font-black uppercase tracking-widest">Connection Offline • Attempting Reconnection</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
