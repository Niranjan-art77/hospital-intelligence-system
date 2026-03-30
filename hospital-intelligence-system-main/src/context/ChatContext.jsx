import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import SocketService from '../services/socket';
import API from '../services/api';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [loading, setLoading] = useState(false);

    // Initialize socket connection
    useEffect(() => {
        if (user?.token) {
            const socketInstance = SocketService.connect(user.token);
            setSocket(socketInstance);

            // Listen for socket events
            socketInstance.on('new-message', handleNewMessage);
            socketInstance.on('user-typing', handleTypingIndicator);
            socketInstance.on('user-online', handleUserOnline);
            socketInstance.on('user-offline', handleUserOffline);
            socketInstance.on('message-seen', handleMessageSeen);

            return () => {
                SocketService.disconnect();
                setSocket(null);
            };
        }
    }, [user]);

    const handleNewMessage = useCallback((messageData) => {
        setMessages(prev => {
            const existingIndex = prev.findIndex(m => m.id === messageData.id);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = messageData;
                return updated;
            }
            return [...prev, messageData];
        });

        // Update conversation list
        setConversations(prev => {
            const updated = prev.map(conv => {
                if (conv.id === messageData.conversationId) {
                    return {
                        ...conv,
                        lastMessage: messageData.message,
                        lastMessageTime: messageData.timestamp,
                        unreadCount: messageData.senderId !== user.id ? (conv.unreadCount || 0) + 1 : conv.unreadCount
                    };
                }
                return conv;
            });
            return updated.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        });
    }, [user?.id]);

    const handleTypingIndicator = useCallback(({ userId, isTyping }) => {
        setTypingUsers(prev => {
            const newSet = new Set(prev);
            if (isTyping) {
                newSet.add(userId);
            } else {
                newSet.delete(userId);
            }
            return newSet;
        });
    }, []);

    const handleUserOnline = useCallback((userId) => {
        setOnlineUsers(prev => new Set(prev).add(userId));
    }, []);

    const handleUserOffline = useCallback((userId) => {
        setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
        });
    }, []);

    const handleMessageSeen = useCallback(({ messageId, userId }) => {
        setMessages(prev => prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'SEEN', seenBy: [...(msg.seenBy || []), userId] } : msg
        ));
    }, []);

    const fetchConversations = useCallback(async () => {
        if (!user?.id) return;
        
        setLoading(true);
        try {
            const response = await API.get(`/chat/conversations/${user.id}`);
            setConversations(response.data);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const fetchMessages = useCallback(async (conversationId) => {
        if (!conversationId) return;
        
        setLoading(true);
        try {
            const response = await API.get(`/chat/messages/${conversationId}`);
            setMessages(response.data);
            
            // Join the socket room for this conversation
            SocketService.joinRoom(conversationId);
            
            // Mark messages as seen
            const unseenMessages = response.data.filter(msg => 
                msg.senderId !== user.id && !msg.seenBy?.includes(user.id)
            );
            
            unseenMessages.forEach(msg => {
                SocketService.markMessageAsSeen(msg.id);
            });
            
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    const sendMessage = useCallback(async (conversationId, content, messageType = 'TEXT') => {
        if (!content.trim() || !conversationId) return;

        const messageData = {
            conversationId,
            senderId: user.id,
            content: content.trim(),
            messageType,
            timestamp: new Date().toISOString(),
            status: 'SENT'
        };

        try {
            // Send via socket for real-time delivery
            SocketService.sendMessage(messageData);
            
            // Also persist via API
            await API.post('/chat/message', messageData);
            
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }, [user?.id]);

    const startConversation = useCallback(async (participantId) => {
        try {
            const response = await API.post('/chat/conversation', {
                participantIds: [user.id, participantId]
            });
            
            const conversation = response.data;
            setConversations(prev => [conversation, ...prev]);
            setActiveConversation(conversation);
            fetchMessages(conversation.id);
            
            return conversation;
        } catch (error) {
            console.error('Failed to start conversation:', error);
            return null;
        }
    }, [user?.id, fetchMessages]);

    const sendTypingIndicator = useCallback((conversationId, isTyping) => {
        SocketService.emitTyping(conversationId, user.id, isTyping);
    }, [user?.id]);

    const markAsRead = useCallback((conversationId) => {
        setConversations(prev => prev.map(conv => 
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ));
    }, []);

    const switchConversation = useCallback((conversation) => {
        if (activeConversation?.id) {
            SocketService.leaveRoom(activeConversation.id);
        }
        
        setActiveConversation(conversation);
        setMessages([]);
        fetchMessages(conversation.id);
        markAsRead(conversation.id);
    }, [activeConversation?.id, fetchMessages, markAsRead]);

    const isUserOnline = useCallback((userId) => {
        return onlineUsers.has(userId);
    }, [onlineUsers]);

    const isUserTyping = useCallback((userId) => {
        return typingUsers.has(userId);
    }, [typingUsers]);

    const value = {
        socket,
        conversations,
        activeConversation,
        messages,
        loading,
        onlineUsers,
        typingUsers,
        fetchConversations,
        fetchMessages,
        sendMessage,
        startConversation,
        sendTypingIndicator,
        switchConversation,
        isUserOnline,
        isUserTyping,
        isConnected: socket?.connected || false
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
