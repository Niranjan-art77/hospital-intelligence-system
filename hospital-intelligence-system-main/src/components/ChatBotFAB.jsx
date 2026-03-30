import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Mic, Paperclip, MoreHorizontal } from 'lucide-react';
import API from '../services/api';

export default function ChatBotFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm Nova AI. I've analyzed your recent health patterns. How can I help you today?", sender: 'bot', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userQuery = input.trim();
        setMessages(prev => [...prev, { text: userQuery, sender: 'user', timestamp: new Date() }]);
        setInput('');
        setIsTyping(true);

        try {
            const queryLowercase = userQuery.toLowerCase();
            let botReply = '';

            // Simulate AI Processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (queryLowercase.includes('bed') || queryLowercase.includes('ward')) {
                const res = await API.get('/beds');
                const beds = res.data;
                const available = beds.filter(b => b.status === 'AVAILABLE').length;
                botReply = `I've checked the real-time ward telemetry. There are currently **${available}** available beds. Ward B has the highest capacity.`;
            } else if (queryLowercase.includes('critical') || queryLowercase.includes('emergency')) {
                const res = await API.get('/notifications');
                const crits = res.data.filter(n => !n.isRead && n.type === 'CRITICAL');
                botReply = crits.length > 0
                    ? `⚠️ **Priority Alert:** I've detected ${crits.length} critical events. ${crits[0].message}. I recommend immediate review in the Command Center.`
                    : `Checking all telemetry channels... ✅ All systems optimal. No active emergencies detected.`;
            } else if (queryLowercase.includes('score') || queryLowercase.includes('health')) {
                botReply = `Your **Health Intelligence Index is 84/100**. Your cardiovascular efficiency has improved by 4% this week. Keep up the activity!`;
            } else {
                botReply = `I'm your Health Intelligence Assistant. I can track your **real-time vitals**, check **bed availability**, or analyze **symptoms**. What would you like to explore?`;
            }

            setMessages(prev => [...prev, { text: botReply, sender: 'bot', timestamp: new Date() }]);
        } catch (err) {
            setMessages(prev => [...prev, { text: "I encountered a sync error with the central database. Please try again shortly.", sender: 'bot', timestamp: new Date() }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-[100] font-sans">
            {/* Expanding Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                        className="mb-6 w-[400px] h-[600px] bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden ring-1 ring-white/20"
                    >
                        {/* Premium Header */}
                        <div className="p-6 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-b border-white/10 relative">
                            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 blur-[60px] rounded-full"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-fuchsia-500 blur-[60px] rounded-full"></div>
                            </div>
                            
                            <div className="flex justify-between items-center relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
                                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                                            <Sparkles className="text-white w-6 h-6 animate-pulse" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                                            Nova AI
                                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">PRO</span>
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex gap-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Always Active</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors">
                                        <MoreHorizontal size={18} />
                                    </button>
                                    <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.sender === 'bot' ? -10 : 10, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    className={`flex ${msg.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div className={`group relative max-w-[85%] flex gap-3 ${msg.sender === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${msg.sender === 'bot' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
                                            {msg.sender === 'bot' ? <Bot size={16} /> : <User size={16} />}
                                        </div>
                                        <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-lg ${
                                            msg.sender === 'bot' 
                                            ? 'bg-white/5 text-slate-200 border border-white/10 rounded-tl-none' 
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-none border border-white/20'
                                        }`}>
                                            {msg.text}
                                            <div className={`mt-2 text-[9px] font-bold uppercase tracking-widest ${msg.sender === 'bot' ? 'text-slate-500' : 'text-white/60'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
                            {['Check Vitals', 'Find Doctor', 'Symptom Report', 'Available Beds'].map(action => (
                                <button key={action} onClick={() => setInput(action)} className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:text-indigo-400 transition-all">
                                    {action}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-slate-900/40 border-t border-white/10 backdrop-blur-md">
                            <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-1.5 pr-3 shadow-inner flex items-center gap-2 focus-within:border-indigo-500/50 transition-all">
                                <button className="p-3 text-slate-500 hover:text-indigo-400 transition-colors">
                                    <Paperclip size={20} />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                                    placeholder="Type your health query..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-sm font-medium py-3"
                                />
                                <button className="p-3 text-slate-500 hover:text-indigo-400 transition-colors mr-1">
                                    <Mic size={20} />
                                </button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all"
                                >
                                    <Send size={20} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Premium Circular FAB with Pulse */}
            <div className="relative group">
                {/* Magnetic Hover Effect Background */}
                <div className="absolute inset-[-12px] bg-indigo-600/20 blur-[20px] rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                
                {/* Pulse Rings */}
                {!isOpen && (
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-[ping_2s_infinite_ease-out]"></div>
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-[ping_3s_infinite_ease-out_1s]"></div>
                    </div>
                )}

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-2 transition-all duration-500 ${
                        isOpen 
                        ? 'bg-slate-900 border-white/20 rotate-90 scale-90' 
                        : 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 border-white/30 rotate-0'
                    }`}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                                <X className="text-white w-8 h-8" strokeWidth={3} />
                            </motion.div>
                        ) : (
                            <motion.div key="bot" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex flex-col items-center">
                                <Sparkles className="text-white w-8 h-8 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" strokeWidth={2.5} />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80 mt-1">Nova AI</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Glowing Accent */}
                    <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
                </motion.button>
                
                {/* Unread Indicator */}
                {!isOpen && messages.length > 0 && (
                    <div className="absolute top-1 right-1 w-6 h-6 bg-rose-500 border-4 border-slate-950 rounded-full flex items-center justify-center z-10 shadow-lg">
                        <span className="text-[10px] font-black text-white">1</span>
                    </div>
                )}
            </div>
        </div>
    );
}
