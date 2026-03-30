import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, Send, Mic, MicOff, Sparkles, AlertTriangle,
    Heart, Brain, Pill, Shield, Activity, Clock,
    ChevronDown, ChevronUp, X, MessageCircle
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const medicalKnowledgeBase = {
    'disease information': {
        keywords: ['disease', 'condition', 'illness', 'sickness', 'disorder'],
        response: 'I can provide information about various medical conditions. Common conditions include diabetes, hypertension, asthma, and heart disease. Always consult with a healthcare professional for diagnosis and treatment.'
    },
    'symptoms': {
        keywords: ['symptom', 'pain', 'fever', 'cough', 'headache', 'nausea'],
        response: 'Symptoms are your body\'s way of signaling that something might be wrong. Common symptoms like fever, headache, or fatigue can indicate various conditions. Keep track of your symptoms and discuss them with your doctor.'
    },
    'prevention': {
        keywords: ['prevent', 'avoid', 'stop', 'protect', 'vaccine', 'immunization'],
        response: 'Prevention is key to maintaining good health. Regular exercise, balanced diet, adequate sleep, stress management, and routine check-ups are essential. Vaccinations and screenings help prevent many diseases.'
    },
    'medications': {
        keywords: ['medicine', 'drug', 'medication', 'prescription', 'pill', 'tablet'],
        response: 'Medications should only be taken as prescribed by your healthcare provider. Always follow dosage instructions, be aware of side effects, and inform your doctor about all medications you\'re taking including supplements.'
    },
    'first aid': {
        keywords: ['emergency', 'first aid', 'injury', 'wound', 'bleeding', 'burn'],
        response: 'For emergencies: Call emergency services immediately. For minor injuries, clean wounds with soap and water, apply pressure to bleeding, and use cold compresses for swelling. Seek medical attention for serious injuries.'
    }
};

export default function MedicalChatbot() {
    const { addToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        // Add welcome message
        setMessages([{
            id: 1,
            text: 'Hello! I\'m your medical assistant. I can provide information about diseases, symptoms, prevention, medications, and first aid. Remember, I\'m not a substitute for professional medical advice.',
            sender: 'bot',
            timestamp: new Date()
        }]);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        initializeVoiceRecognition();
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const initializeVoiceRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                setInput(transcript);
                
                if (event.results[0].isFinal) {
                    handleSendMessage(transcript);
                    setIsListening(false);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                addToast({
                    type: 'error',
                    title: 'Voice Recognition Error',
                    message: 'Unable to process voice input. Please try again.'
                });
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generateResponse = (userInput) => {
        const input = userInput.toLowerCase();
        
        for (const [category, data] of Object.entries(medicalKnowledgeBase)) {
            if (data.keywords.some(keyword => input.includes(keyword))) {
                return data.response;
            }
        }
        
        return 'I can provide information about diseases, symptoms, prevention, medications, and first aid. Please be more specific about what you\'d like to know, or consult with a healthcare professional for personalized advice.';
    };

    const handleSendMessage = async (text = input) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate bot thinking
        setTimeout(() => {
            const botResponse = {
                id: Date.now() + 1,
                text: generateResponse(text),
                sender: 'bot',
                timestamp: new Date()
            };
            
            setMessages(prev => [...prev, botResponse]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    const handleVoiceInput = () => {
        if (!recognitionRef.current) {
            addToast({
                type: 'error',
                title: 'Voice Recognition Not Available',
                message: 'Your browser does not support voice recognition.'
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-16' : 'w-96'}`}
        >
            <motion.div
                className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                animate={{ height: isMinimized ? 'auto' : '600px' }}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black">Medical Assistant</h3>
                            <p className="text-white/80 text-xs">Always here to help</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-2 text-white/80 hover:text-white transition-colors"
                        >
                            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <AnimatePresence>
                    {!isMinimized && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                                            message.sender === 'user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-slate-800 text-white'
                                        }`}>
                                            <p className="text-sm">{message.text}</p>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {isTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-slate-800 p-3 rounded-2xl">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                                </div>
                                                <span className="text-xs text-slate-400">Typing...</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t border-white/10">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleVoiceInput}
                                        className={`p-3 rounded-lg transition-all ${
                                            isListening
                                                ? 'bg-red-500 text-white animate-pulse'
                                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask about your health..."
                                        className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                    <button
                                        onClick={() => handleSendMessage()}
                                        disabled={!input.trim()}
                                        className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                    <Shield className="w-3 h-3" />
                                    <span>Not a substitute for professional medical advice</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
