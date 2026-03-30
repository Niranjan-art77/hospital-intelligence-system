import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, Send, Mic, MicOff, X, Minimize2,
    Maximize2, Bot, User, Clock, CheckCircle,
    AlertTriangle, Heart, Pill, Stethoscope, Brain,
    Activity, Zap, Target, Shield, Info, ChevronRight,
    Sparkles, Loader2, ThumbsUp, ThumbsDown, Copy,
    Download, Share2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';

export default function AIHealthAssistant() {
    const { user } = useAuth();
    const { addToast } = useToast();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [recognition, setRecognition] = useState(null);
    
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Medical knowledge base categories
    const categories = [
        { id: 'symptoms', name: 'Symptoms', icon: <Activity className="w-4 h-4" />, color: 'red' },
        { id: 'medicines', name: 'Medicines', icon: <Pill className="w-4 h-4" />, color: 'green' },
        { id: 'diseases', name: 'Diseases', icon: <Brain className="w-4 h-4" />, color: 'purple' },
        { id: 'first_aid', name: 'First Aid', icon: <Shield className="w-4 h-4" />, color: 'blue' },
        { id: 'prevention', name: 'Prevention', icon: <Heart className="w-4 h-4" />, color: 'pink' },
        { id: 'nutrition', name: 'Nutrition', icon: <Zap className="w-4 h-4" />, color: 'yellow' }
    ];

    // Common health questions
    const commonQuestions = [
        'What are the symptoms of flu?',
        'How can I improve my immune system?',
        'What should I do for a headache?',
        'How much water should I drink daily?',
        'What are healthy eating habits?',
        'How can I reduce stress?',
        'What are the benefits of exercise?',
        'How can I improve my sleep?'
    ];

    useEffect(() => {
        initializeChat();
        setupSpeechRecognition();
        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const initializeChat = () => {
        const welcomeMessage = {
            id: Date.now(),
            type: 'bot',
            content: `Hello ${user?.name || 'there'}! I'm your AI Health Assistant. I can help you with information about symptoms, medicines, diseases, first aid, prevention tips, and nutrition. How can I assist you today?`,
            timestamp: new Date(),
            suggestions: commonQuestions.slice(0, 4)
        };
        setMessages([welcomeMessage]);
    };

    const setupSpeechRecognition = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognitionInstance = new SpeechRecognition();
            
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';
            
            recognitionInstance.onstart = () => {
                setIsListening(true);
            };
            
            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsListening(false);
            };
            
            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
                addToast({
                    type: 'error',
                    title: 'Speech Recognition Error',
                    message: 'Unable to recognize speech. Please try again.'
                });
            };
            
            recognitionInstance.onend = () => {
                setIsListening(false);
            };
            
            setRecognition(recognitionInstance);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const generateBotResponse = async (userMessage) => {
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const lowerMessage = userMessage.toLowerCase();
        let response = '';
        let suggestions = [];
        let category = null;
        
        // Symptom-related queries
        if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
            category = 'symptoms';
            if (lowerMessage.includes('headache')) {
                response = `Headaches can be caused by various factors including stress, dehydration, lack of sleep, or medical conditions. Common types include tension headaches, migraines, and cluster headaches.

**Immediate relief:**
- Rest in a quiet, dark room
- Apply cold or warm compress
- Stay hydrated
- Over-the-counter pain relievers (if appropriate)

**When to see a doctor:**
- Sudden severe headache
- Headache with fever, stiff neck, or confusion
- Headache after head injury
- Worsening pattern of headaches

Would you like to know more about specific types of headaches or prevention strategies?`;
                suggestions = ['What causes migraines?', 'How to prevent headaches?', 'When is headache an emergency?'];
            } else if (lowerMessage.includes('fever')) {
                response = `Fever is a temporary increase in body temperature, often due to an illness. Normal body temperature is around 98.6°F (37°C).

**Managing fever at home:**
- Rest and stay hydrated
- Take lukewarm baths
- Wear lightweight clothing
- Use fever-reducing medications (acetaminophen, ibuprofen)

**When to seek medical attention:**
- Temperature above 103°F (39.4°C)
- Fever lasting more than 3 days
- Fever with severe headache, stiff neck, or rash
- Fever in infants under 3 months

Always consult a healthcare provider for proper diagnosis and treatment.`;
                suggestions = ['What causes fever?', 'How to break a fever?', 'Fever in children'];
            }
        }
        
        // Medicine-related queries
        else if (lowerMessage.includes('medicine') || lowerMessage.includes('drug') || lowerMessage.includes('medication')) {
            category = 'medicines';
            response = `Regarding medications, it's important to:

**Safety Guidelines:**
- Always follow prescribed dosage
- Read medication labels carefully
- Inform your doctor about all medications you take
- Store medications properly
- Never share prescription medications

**Common Interactions:**
- Some foods can affect medication absorption
- Certain medications shouldn't be taken together
- Alcohol can interact with many medications

**Important:** Always consult your healthcare provider or pharmacist for specific medication questions. They can provide personalized advice based on your medical history and current medications.

What specific medication or medication-related topic would you like to know more about?`;
            suggestions = ['How to read medicine labels?', 'Common drug interactions?', 'Tips for remembering medication'];
        }
        
        // Disease-related queries
        else if (lowerMessage.includes('disease') || lowerMessage.includes('condition') || lowerMessage.includes('illness')) {
            category = 'diseases';
            response = `Understanding diseases and conditions is important for your health. Here are some key points:

**Prevention Strategies:**
- Regular health check-ups
- Vaccinations
- Healthy lifestyle choices
- Stress management
- Adequate sleep

**Warning Signs:**
- Unexplained weight changes
- Persistent fatigue
- Changes in appetite
- Unusual pain or discomfort
- Changes in bodily functions

**Risk Factors:**
- Age and genetics
- Lifestyle choices
- Environmental factors
- Pre-existing conditions

Remember: Early detection and treatment often lead to better outcomes. Always consult healthcare professionals for diagnosis and treatment.

What specific health condition are you concerned about?`;
            suggestions = ['How to prevent heart disease?', 'Diabetes warning signs?', 'Cancer prevention tips'];
        }
        
        // First aid queries
        else if (lowerMessage.includes('first aid') || lowerMessage.includes('emergency') || lowerMessage.includes('injury')) {
            category = 'first_aid';
            response = `Basic first aid knowledge can save lives. Here are essential first aid tips:

**Universal First Aid Steps:**
1. Assess the situation for safety
2. Check for responsiveness
3. Call emergency services if needed
4. Provide appropriate care

**Common First Aid Situations:**

**Cuts and Scrapes:**
- Clean with water
- Apply antibiotic ointment
- Cover with sterile bandage

**Burns:**
- Cool with running water (10-15 minutes)
- Cover with sterile, non-stick dressing
- Don't apply ice or butter

**Choking:**
- Perform Heimlich maneuver
- Call emergency services if unsuccessful

**Important:** This is general guidance. Always seek professional medical help for emergencies. Consider taking a certified first aid course.

Would you like specific first aid instructions for a particular situation?`;
            suggestions = ['How to perform CPR?', 'Treating sprains and strains?', 'Allergic reaction first aid'];
        }
        
        // Prevention queries
        else if (lowerMessage.includes('prevent') || lowerMessage.includes('avoid') || lowerMessage.includes('reduce risk')) {
            category = 'prevention';
            response = `Prevention is the best medicine! Here are key prevention strategies:

**Lifestyle Prevention:**
- Regular physical activity (150 minutes/week)
- Balanced diet rich in fruits and vegetables
- Maintain healthy weight
- Don't smoke, limit alcohol
- Get adequate sleep (7-9 hours)

**Health Screenings:**
- Regular blood pressure checks
- Cholesterol screening
- Cancer screenings as recommended
- Diabetes screening
- Vision and dental check-ups

**Mental Health:**
- Stress management techniques
- Social connections
- Regular exercise
- Professional help when needed

**Environmental Safety:**
- Hand hygiene
- Food safety practices
- Sun protection
- Home safety measures

What specific area of prevention would you like to explore further?`;
            suggestions = ['How to boost immunity?', 'Heart disease prevention', 'Healthy aging tips'];
        }
        
        // Nutrition queries
        else if (lowerMessage.includes('food') || lowerMessage.includes('diet') || lowerMessage.includes('nutrition') || lowerMessage.includes('eat')) {
            category = 'nutrition';
            response = `Good nutrition is fundamental to health and well-being. Here's what you need to know:

**Balanced Diet Components:**
- Fruits and vegetables (5+ servings daily)
- Whole grains
- Lean proteins
- Healthy fats
- Dairy or alternatives

**Key Nutrients:**
- Vitamins and minerals
- Fiber for digestive health
- Protein for muscle maintenance
- Calcium for bone health
- Omega-3 for brain function

**Healthy Eating Tips:**
- Eat regular meals
- Control portion sizes
- Limit processed foods
- Stay hydrated (8+ glasses water)
- Read nutrition labels

**Special Considerations:**
- Age-specific nutritional needs
- Dietary restrictions
- Medical conditions affecting diet
- Athletic performance needs

What specific nutrition topic interests you most?`;
            suggestions = ['Healthy meal planning?', 'Supplements guide?', 'Nutrition for weight loss?'];
        }
        
        // General health queries
        else if (lowerMessage.includes('health') || lowerMessage.includes('wellness') || lowerMessage.includes('healthy')) {
            response = `Maintaining good health involves multiple aspects of your life:

**Physical Health:**
- Regular exercise (cardio, strength, flexibility)
- Balanced nutrition and hydration
- Adequate sleep (7-9 hours)
- Regular medical check-ups
- Avoid harmful substances

**Mental Health:**
- Stress management
- Social connections
- Mindfulness and meditation
- Professional help when needed
- Work-life balance

**Preventive Care:**
- Vaccinations
- Screenings and tests
- Health monitoring
- Early detection of issues

**Lifestyle Habits:**
- Consistent daily routine
- Limit screen time
- Practice good hygiene
- Maintain healthy relationships

What specific aspect of health would you like to focus on?`;
            suggestions = ['How to create a fitness routine?', 'Stress management techniques?', 'Building healthy habits'];
        }
        
        // Default response
        else {
            response = `I'm here to help with health-related information! I can assist you with:

🏥 **Symptoms** - Understanding various symptoms and what they might indicate
💊 **Medicines** - General information about medications and their proper use
🧠 **Diseases** - Information about health conditions and their management
🆘 **First Aid** - Basic first aid guidance for common situations
🛡️ **Prevention** - Tips for preventing illness and maintaining health
🥗 **Nutrition** - Guidance on healthy eating and nutritional needs

Please feel free to ask me about any of these topics, or try one of these suggestions:`;
            suggestions = commonQuestions.slice(0, 4);
        }
        
        return { response, suggestions, category };
    };

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim()) return;
        
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);
        
        try {
            const { response, suggestions, category } = await generateBotResponse(messageText);
            
            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: response,
                timestamp: new Date(),
                suggestions,
                category
            };
            
            setMessages(prev => [...prev, botMessage]);
            setSuggestions(suggestions);
            
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleVoiceInput = () => {
        if (recognition) {
            if (isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        } else {
            addToast({
                type: 'error',
                title: 'Speech Recognition Not Available',
                message: 'Your browser does not support speech recognition.'
            });
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const copyMessage = (content) => {
        navigator.clipboard.writeText(content);
        addToast({
            type: 'success',
            title: 'Copied',
            message: 'Message copied to clipboard'
        });
    };

    const rateMessage = (messageId, rating) => {
        // In a real app, this would send feedback to improve the AI
        console.log(`Message ${messageId} rated: ${rating}`);
        addToast({
            type: 'info',
            title: 'Thank you',
            message: 'Your feedback helps me improve'
        });
    };

    const clearChat = () => {
        setMessages([]);
        initializeChat();
    };

    const downloadChat = () => {
        const chatContent = messages.map(msg => 
            `[${msg.timestamp.toLocaleString()}] ${msg.type.toUpperCase()}: ${msg.content}`
        ).join('\n\n');
        
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg z-50"
                >
                    <MessageCircle className="w-6 h-6 text-white" />
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 ${
                            isMinimized ? 'bottom-6 right-6 w-80 h-14' : 'bottom-6 right-6 w-96 h-[600px] md:w-[500px]'
                        }`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">AI Health Assistant</h3>
                                    {!isMinimized && (
                                        <p className="text-xs text-blue-100">Always here to help</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1 text-white/80 hover:text-white transition-colors"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 text-white/80 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Chat Content */}
                        {!isMinimized && (
                            <>
                                {/* Categories */}
                                <div className="p-4 border-b border-white/10">
                                    <div className="flex gap-2 overflow-x-auto">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                                                    selectedCategory === cat.id
                                                        ? `bg-${cat.color}-500 text-white`
                                                        : 'bg-slate-700 text-slate-300 hover:text-white'
                                                }`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    {cat.icon}
                                                    {cat.name}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message) => (
                                        <motion.div
                                            key={message.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`flex gap-3 ${
                                                message.type === 'user' ? 'justify-end' : 'justify-start'
                                            }`}
                                        >
                                            {message.type === 'bot' && (
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <Bot className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                            <div className={`max-w-[80%] ${
                                                message.type === 'user' ? 'order-first' : ''
                                            }`}>
                                                <div className={`p-3 rounded-lg ${
                                                    message.type === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-700 text-white'
                                                }`}>
                                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-500">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                    {message.type === 'bot' && (
                                                        <>
                                                            <button
                                                                onClick={() => copyMessage(message.content)}
                                                                className="p-1 text-slate-500 hover:text-white transition-colors"
                                                            >
                                                                <Copy className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => rateMessage(message.id, 'up')}
                                                                className="p-1 text-slate-500 hover:text-green-400 transition-colors"
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => rateMessage(message.id, 'down')}
                                                                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {/* Suggestions */}
                                                {message.suggestions && (
                                                    <div className="mt-3 space-y-2">
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(suggestion)}
                                                                className="w-full text-left p-2 bg-slate-600/50 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-600 transition-colors flex items-center gap-2"
                                                            >
                                                                <ChevronRight className="w-3 h-3" />
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {message.type === 'user' && (
                                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 order-first">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                    
                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex gap-3"
                                        >
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-slate-700 p-3 rounded-lg">
                                                <div className="flex gap-1">
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                    
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 border-t border-white/10">
                                    <div className="flex gap-2">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Ask about symptoms, medicines, or health..."
                                            className="flex-1 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={handleVoiceInput}
                                            className={`p-2 rounded-lg transition-colors ${
                                                isListening
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-slate-700 text-slate-400 hover:text-white'
                                            }`}
                                        >
                                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => sendMessage()}
                                            disabled={!input.trim() || isTyping}
                                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={clearChat}
                                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors"
                                        >
                                            Clear Chat
                                        </button>
                                        <button
                                            onClick={downloadChat}
                                            className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600 transition-colors"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
