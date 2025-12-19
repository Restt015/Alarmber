
// Get WS URL from env
const WS_URL = process.env.EXPO_PUBLIC_WS_URL || 'ws://192.168.0.3:5001';

class ChatService {
    constructor() {
        this.ws = null;
        this.reportId = null;
        this.token = null;
        this.messageQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.reconnectTimeout = null;
        this.listeners = new Set();
        this.isConnected = false;
        this.isConnecting = false;
        this.forcedDisconnect = false;
    }

    // Connect to chat room
    async connect(reportId, token) {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            if (this.reportId === reportId) return; // Already connected to this room
            this.disconnect();
        }

        this.reportId = reportId;
        this.token = token;
        this.forcedDisconnect = false;
        this.reconnectAttempts = 0;

        await this._connect();
    }

    async _connect() {
        if (this.forcedDisconnect || this.isConnecting) return;

        this.isConnecting = true;
        this.notifyListeners({ type: 'connecting' });

        try {
            const url = `${WS_URL}?reportId=${this.reportId}&token=${this.token}`;
            console.log('🔌 Connecting to Chat WS:', url);

            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log('✅ Chat WS Connected');
                this.isConnected = true;
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this.notifyListeners({ type: 'connected' });
                this._processQueue();
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.action === 'ping') {
                        this.send({ action: 'pong' });
                        return;
                    }

                    if (message.action === 'message:new') {
                        this.notifyListeners({ type: 'message', payload: message.data });
                    }

                    if (message.action === 'error') {
                        console.error('WS Error:', message.message);
                        this.notifyListeners({ type: 'error', payload: message.message });
                    }

                } catch (e) {
                    console.error('Error parsing WS message:', e);
                }
            };

            this.ws.onerror = (e) => {
                console.log('❌ WS Error occurred');
                // Don't notify 'error' here, let onclose handle retry logic
            };

            this.ws.onclose = (e) => {
                console.log(`🔌 WS Closed (code: ${e.code})`);
                this.isConnected = false;
                this.isConnecting = false;
                this.notifyListeners({ type: 'disconnected' });

                if (!this.forcedDisconnect && e.code !== 1000 && e.code !== 4001) {
                    this._handleReconnect();
                } else if (e.code === 4001) {
                    console.error('Auth failed or invalid parameters');
                }
            };

        } catch (error) {
            console.error('WS Connection setup error:', error);
            this.isConnecting = false;
            this._handleReconnect();
        }
    }

    _handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts || this.forcedDisconnect) return;

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        this.reconnectAttempts++;

        console.log(`🔄 Reconnecting in ${delay}ms (Attempt ${this.reconnectAttempts})`);

        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        this.reconnectTimeout = setTimeout(() => {
            this._connect();
        }, delay);
    }

    disconnect() {
        this.forcedDisconnect = true;
        if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);

        if (this.ws) {
            this.ws.close(1000, 'User left'); // 1000 = Normal Closure
            this.ws = null;
        }

        this.isConnected = false;
        this.isConnecting = false;
        this.reportId = null;
        this.token = null;
    }

    send(content) {
        if (typeof content === 'string') {
            this.sendInternal({
                action: 'message:send',
                content,
                type: 'text', // Message content type
                timestamp: new Date().toISOString() // for optimistic UI
            });
        } else {
            this.sendInternal(content);
        }
    }

    sendInternal(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            if (data.action === 'message:send') {
                // Optional: Queue messages if disconnected?
                // For now, we'll let the UI handle offline state
                console.warn('Cannot send message: Disconnected');
            }
        }
    }

    _processQueue() {
        while (this.messageQueue.length > 0) {
            const msg = this.messageQueue.shift();
            this.sendInternal(msg);
        }
    }

    // Listener Management
    subscribe(callback) {
        this.listeners.add(callback);
        // Immediate state sync
        callback({ type: this.isConnected ? 'connected' : 'disconnected' });

        return () => {
            this.listeners.delete(callback);
        };
    }

    notifyListeners(event) {
        this.listeners.forEach(callback => callback(event));
    }
}

export default new ChatService();
