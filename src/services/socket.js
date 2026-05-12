import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 
  (import.meta.env.PROD 
    ? 'https://hospital-intelligence-system-2.onrender.com' 
    : 'http://localhost:5000');

class SocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this._reconnectTimeout = null;
    }

    connect(token) {
        // If already connected, return existing socket
        if (this.socket?.connected) {
            return this.socket;
        }

        // Clean up any orphaned socket before re-connecting
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
        }

        console.log(`[Socket] Connecting to ${SOCKET_URL}...`);

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity, // Keep trying in production
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            autoConnect: true
        });

        this.socket.on('connect', () => {
            console.log('[Socket] Connected successfully');
            this.connected = true;
        });

        this.socket.on('disconnect', (reason) => {
            console.warn(`[Socket] Disconnected: ${reason}`);
            this.connected = false;
            // If server closed the connection, manually reconnect
            if (reason === 'io server disconnect') {
                this.socket.connect();
            }
        });

        this.socket.on('connect_error', (error) => {
            console.error('[Socket] Connection error:', error.message);
            this.connected = false;
        });

        this.socket.on('reconnect_attempt', (attempt) => {
            console.log(`[Socket] Reconnection attempt #${attempt}`);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    joinRoom(roomId) {
        if (this.socket && this.connected) {
            this.socket.emit('join-room', roomId);
        }
    }

    leaveRoom(roomId) {
        if (this.socket && this.connected) {
            this.socket.emit('leave-room', roomId);
        }
    }

    sendMessage(messageData) {
        if (this.socket && this.connected) {
            this.socket.emit('send-message', messageData);
        }
    }

    onMessage(callback) {
        if (this.socket) {
            this.socket.off('new-message');
            this.socket.on('new-message', callback);
        }
    }

    onTyping(callback) {
        if (this.socket) {
            this.socket.off('user-typing');
            this.socket.on('user-typing', callback);
        }
    }

    onUserOnline(callback) {
        if (this.socket) {
            this.socket.off('user-online');
            this.socket.on('user-online', callback);
        }
    }

    onUserOffline(callback) {
        if (this.socket) {
            this.socket.off('user-offline');
            this.socket.on('user-offline', callback);
        }
    }

    emitTyping(conversationId, userId, isTyping) {
        if (this.socket && this.connected) {
            this.socket.emit('typing', { conversationId, userId, isTyping });
        }
    }

    markMessageAsSeen(messageId) {
        if (this.socket && this.connected) {
            this.socket.emit('mark-seen', messageId);
        }
    }

    onMessageSeen(callback) {
        if (this.socket) {
            this.socket.off('message-seen');
            this.socket.on('message-seen', callback);
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
