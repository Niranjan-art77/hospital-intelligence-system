import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Paperclip, Phone, Video, MoreVertical, Smile,
    Mic, MicOff, Camera, Image, File, Download, Eye,
    Check, CheckCheck, Clock, User, Circle, Search,
    Filter, Star, Archive, Trash2, Reply, Edit2,
    Forward, Info, Shield, Volume2, VolumeX, Settings,
    Wifi, WifiOff, RefreshCw, X, ChevronLeft, Hash
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import API from '../services/api';
import SocketService from '../services/socket';

export default function RealTimeChat({ doctorId, patientId, onClose }) {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [typing, setTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState('offline');
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [recording, setRecording] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [messageStatuses, setMessageStatuses] = useState({});
    const [replyToMessage, setReplyToMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState('');
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const roomId = [doctorId, patientId].sort().join('-');

    useEffect(() => {
        initializeChat();
        return () => cleanup();
    }, [doctorId, patientId]);

    const initializeChat = async () => {
        try {
            setLoading(true);
            
            // Get user info
            const savedUser = localStorage.getItem('nova_user');
            const { token } = JSON.parse(savedUser);
            
            // Connect to socket
            SocketService.connect(token);
            setConnectionStatus('connected');
            
            // Join chat room
            SocketService.joinRoom(roomId);
            
            // Get other user info
            const otherUserId = user.role === 'DOCTOR' ? patientId : doctorId;
            const userResponse = await API.get(`/users/${otherUserId}`);
            setOtherUser(userResponse.data);
            
            // Load message history
            await loadMessageHistory();
            
            // Setup socket listeners
            setupSocketListeners();
            
            // Mark messages as read
            await markMessagesAsRead();
            
        } catch (error) {
            console.error('Failed to initialize chat:', error);
            setConnectionStatus('error');
            addToast({
                type: 'error',
                title: 'Connection Error',
                message: 'Failed to connect to chat. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadMessageHistory = async () => {
        try {
            const response = await API.get(`/messages/room/${roomId}`);
            setMessages(response.data || []);
            
            // Count unread messages
            const unread = response.data.filter(msg => 
                msg.senderId !== user.id && !msg.read
            ).length;
            setUnreadCount(unread);
            
            // Scroll to bottom
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            console.error('Failed to load message history:', error);
        }
    };

    const setupSocketListeners = () => {
        SocketService.onMessage((message) => {
            setMessages(prev => [...prev, message]);
            
            if (message.senderId !== user.id) {
                setUnreadCount(prev => prev + 1);
                // Play notification sound
                playNotificationSound();
            }
            
            scrollToBottom();
        });

        SocketService.onTyping((data) => {
            if (data.userId !== user.id) {
                setOtherUserTyping(data.isTyping);
                
                // Clear typing indicator after 3 seconds
                setTimeout(() => {
                    setOtherUserTyping(false);
                }, 3000);
            }
        });

        SocketService.onUserOnline((data) => {
            if (data.userId === (user.role === 'DOCTOR' ? patientId : doctorId)) {
                setOnlineStatus('online');
            }
        });

        SocketService.onUserOffline((data) => {
            if (data.userId === (user.role === 'DOCTOR' ? patientId : doctorId)) {
                setOnlineStatus('offline');
            }
        });

        SocketService.onMessageSeen((data) => {
            setMessages(prev => prev.map(msg => 
                msg.id === data.messageId ? { ...msg, read: true } : msg
            ));
        });
    };

    const cleanup = () => {
        SocketService.leaveRoom(roomId);
        SocketService.off('new-message');
        SocketService.off('user-typing');
        SocketService.off('user-online');
        SocketService.off('user-offline');
        SocketService.off('message-seen');
        
        if (mediaRecorderRef.current && recording) {
            stopRecording();
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTyping = (value) => {
        setNewMessage(value);
        
        if (!typing && value.trim()) {
            setTyping(true);
            SocketService.emitTyping(roomId, user.id, true);
        }
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set typing to false after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
            SocketService.emitTyping(roomId, user.id, false);
        }, 1000);
    };

    const sendMessage = async (messageData = {}) => {
        if ((!newMessage.trim() && !messageData.file && !audioURL) || sending) return;

        setSending(true);
        const tempId = Date.now().toString();
        
        try {
            let fileUrl = '';
            let fileType = '';
            let fileName = '';
            
            // Handle file upload
            if (messageData.file || selectedFile) {
                const fileToUpload = messageData.file || selectedFile;
                const formData = new FormData();
                formData.append('file', fileToUpload);
                formData.append('roomId', roomId);
                
                const uploadResponse = await API.post('/chat/upload', formData, {
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                });
                
                fileUrl = uploadResponse.data.url;
                fileType = uploadResponse.data.type;
                fileName = uploadResponse.data.name;
            }
            
            // Handle audio message
            if (audioURL) {
                const audioBlob = await fetch(audioURL).then(r => r.blob());
                const formData = new FormData();
                formData.append('audio', audioBlob, 'voice-message.mp3');
                formData.append('roomId', roomId);
                
                const uploadResponse = await API.post('/chat/upload-audio', formData);
                fileUrl = uploadResponse.data.url;
                fileType = 'audio';
                fileName = 'Voice Message';
            }
            
            const messagePayload = {
                id: tempId,
                roomId,
                senderId: user.id,
                receiverId: user.role === 'doctor' ? patientId : doctorId,
                content: newMessage.trim(),
                fileUrl,
                fileType,
                fileName,
                replyTo: replyToMessage?.id,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };
            
            // Add temporary message to UI
            setMessages(prev => [...prev, messagePayload]);
            setMessageStatuses(prev => ({ ...prev, [tempId]: 'sending' }));
            
            // Send via socket
            SocketService.sendMessage(messagePayload);
            
            // Clear inputs
            setNewMessage('');
            setReplyToMessage(null);
            setSelectedFile(null);
            setAudioURL('');
            setUploadProgress(0);
            
            // Update status to sent
            setTimeout(() => {
                setMessageStatuses(prev => ({ ...prev, [tempId]: 'sent' }));
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'sent' } : msg
                ));
            }, 500);
            
            // Update status to delivered
            setTimeout(() => {
                setMessageStatuses(prev => ({ ...prev, [tempId]: 'delivered' }));
                setMessages(prev => prev.map(msg => 
                    msg.id === tempId ? { ...msg, status: 'delivered' } : msg
                ));
            }, 1000);
            
        } catch (error) {
            console.error('Failed to send message:', error);
            addToast({
                type: 'error',
                title: 'Message Failed',
                message: 'Unable to send message. Please try again.'
            });
            
            // Remove failed message
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
            setMessageStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[tempId];
                return newStatuses;
            });
        } finally {
            setSending(false);
        }
    };
        
        try {
            const message = {
                roomId,
                senderId: user.id,
                content: newMessage.trim(),
                type: messageData.type || 'text',
                fileUrl: messageData.fileUrl || null,
                fileName: messageData.fileName || null,
                fileSize: messageData.fileSize || null,
                timestamp: new Date().toISOString(),
                read: false
            };

            // Send via socket for real-time delivery
            SocketService.sendMessage(message);
            
            // Also save to database
            await API.post('/messages', message);
            
            setNewMessage('');
            setTyping(false);
            scrollToBottom();
            
        } catch (error) {
            console.error('Failed to send message:', error);
            addToast({
                type: 'error',
                title: 'Send Failed',
                message: 'Failed to send message. Please try again.'
            });
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('roomId', roomId);
            
            const response = await API.post('/messages/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            await sendMessage({
                type: file.type.startsWith('image/') ? 'image' : 'file',
                fileUrl: response.data.fileUrl,
                fileName: file.name,
                fileSize: file.size
            });
            
        } catch (error) {
            console.error('Failed to upload file:', error);
            addToast({
                type: 'error',
                title: 'Upload Failed',
                message: 'Failed to upload file. Please try again.'
            });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
                await handleFileUpload(audioFile);
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setRecording(true);
            
        } catch (error) {
            console.error('Failed to start recording:', error);
            addToast({
                type: 'error',
                title: 'Recording Failed',
                message: 'Failed to access microphone. Please check permissions.'
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            const unreadMessages = messages.filter(msg => 
                msg.senderId !== user.id && !msg.read
            );
            
            for (const message of unreadMessages) {
                await API.put(`/messages/${message.id}/read`);
                SocketService.markMessageAsSeen(message.id);
            }
            
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
        }
    };

    const playNotificationSound = () => {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
        }
    };

    const getConnectionStatusIcon = () => {
        switch (connectionStatus) {
            case 'connected': return <Wifi className="w-4 h-4 text-green-400" />;
            case 'connecting': return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
            case 'error': return <WifiOff className="w-4 h-4 text-red-400" />;
            default: return <WifiOff className="w-4 h-4 text-slate-400" />;
        }
    };

    const getOnlineStatusColor = () => {
        switch (onlineStatus) {
            case 'online': return 'bg-green-400';
            case 'away': return 'bg-yellow-400';
            case 'busy': return 'bg-red-400';
            default: return 'bg-slate-400';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex">
            {/* Chat Container */}
            <div className="flex-1 flex flex-col bg-slate-900 m-4 rounded-2xl border border-white/10 overflow-hidden">
                {/* Header */}
                <div className="bg-slate-800/50 backdrop-blur-lg border-b border-white/10 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div className={`absolute bottom-0 right-0 w-3 h-3 ${getOnlineStatusColor()} rounded-full border-2 border-slate-800`}></div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-white">
                                    {otherUser?.name || 'Unknown User'}
                                </h3>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="capitalize text-slate-400">
                                        {otherUser?.role?.toLowerCase() || 'User'}
                                    </span>
                                    <span className="text-slate-500">•</span>
                                    <span className="capitalize text-slate-400">
                                        {onlineStatus}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {getConnectionStatusIcon()}
                            <button
                                onClick={() => window.open(`/patient/voice-call/${roomId}`, '_blank')}
                                className="p-2 text-slate-400 hover:text-green-400 transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => window.open(`/patient/video-call/${roomId}`, '_blank')}
                                className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                                <Video className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setShowInfo(!showInfo)}
                                className="p-2 text-slate-400 hover:text-white transition-colors"
                            >
                                <Info className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => {
                        const isOwn = message.senderId === user.id;
                        const showDate = index === 0 || 
                            formatDate(messages[index - 1].timestamp) !== formatDate(message.timestamp);

                        return (
                            <div key={message.id}>
                                {showDate && (
                                    <div className="flex items-center justify-center my-4">
                                        <div className="bg-slate-700/50 px-3 py-1 rounded-full">
                                            <span className="text-xs text-slate-400">
                                                {formatDate(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                        isOwn ? 'order-2' : 'order-1'
                                    }`}>
                                        <div className={`rounded-2xl px-4 py-2 ${
                                            isOwn 
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                                                : 'bg-slate-800 text-white'
                                        }`}>
                                            {message.type === 'text' && (
                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                            )}
                                            
                                            {message.type === 'image' && (
                                                <div>
                                                    <img 
                                                        src={message.fileUrl} 
                                                        alt="Shared image"
                                                        className="rounded-lg max-w-full h-auto cursor-pointer"
                                                        onClick={() => window.open(message.fileUrl, '_blank')}
                                                    />
                                                    {message.fileName && (
                                                        <p className="text-xs mt-1 opacity-70">{message.fileName}</p>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {message.type === 'file' && (
                                                <div className="flex items-center gap-3">
                                                    <File className="w-5 h-5" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{message.fileName}</p>
                                                        <p className="text-xs opacity-70">
                                                            {message.fileSize && `${(message.fileSize / 1024).toFixed(1)} KB`}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => window.open(message.fileUrl, '_blank')}
                                                        className="p-1 hover:bg-white/10 rounded"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 ${
                                            isOwn ? 'justify-end' : 'justify-start'
                                        }`}>
                                            <span>{formatTime(message.timestamp)}</span>
                                            {isOwn && (
                                                <span>
                                                    {message.read ? (
                                                        <CheckCheck className="w-3 h-3 text-blue-400" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    
                    {otherUserTyping && (
                        <div className="flex justify-start">
                            <div className="bg-slate-800 rounded-2xl px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                    <span className="text-xs text-slate-400">typing...</span>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {typing && (
                    <div className="px-4 py-2 text-xs text-slate-500 text-center">
                        You are typing...
                    </div>
                )}

                {/* Message Input */}
                <div className="bg-slate-800/50 backdrop-blur-lg border-t border-white/10 p-4">
                    <div className="flex items-end gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>
                        
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <Image className="w-5 h-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                            <textarea
                                value={newMessage}
                                onChange={(e) => handleTyping(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder="Type a message..."
                                className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-xl text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                                rows={1}
                                style={{ minHeight: '40px', maxHeight: '120px' }}
                            />
                        </div>
                        
                        {newMessage.trim() ? (
                            <button
                                onClick={() => sendMessage()}
                                disabled={sending}
                                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                            >
                                {sending ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        ) : (
                            <button
                                onMouseDown={startRecording}
                                onMouseUp={stopRecording}
                                onTouchStart={startRecording}
                                onTouchEnd={stopRecording}
                                className={`p-2 rounded-xl transition-all ${
                                    recording 
                                        ? 'bg-red-600 text-white animate-pulse' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                    
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                    />
                </div>
            </div>

            {/* Info Sidebar */}
            <AnimatePresence>
                {showInfo && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-slate-800/50 backdrop-blur-lg border-l border-white/10 overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {otherUser?.name || 'Unknown User'}
                                </h3>
                                <p className="text-sm text-slate-400 capitalize">
                                    {otherUser?.role?.toLowerCase() || 'User'}
                                </p>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <div className={`w-2 h-2 ${getOnlineStatusColor()} rounded-full`}></div>
                                    <span className="text-sm text-slate-400 capitalize">
                                        {onlineStatus}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Contact Info</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Mail className="w-4 h-4" />
                                            {otherUser?.email || 'N/A'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <Phone className="w-4 h-4" />
                                            {otherUser?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Statistics</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Total Messages</span>
                                            <span className="text-white">{messages.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Unread</span>
                                            <span className="text-white">{unreadCount}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-white/10">
                                    <button className="w-full p-2 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors text-sm">
                                        Clear Chat History
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
