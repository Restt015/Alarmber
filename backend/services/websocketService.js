const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const logger = require('../utils/logger'); // Assuming you have a logger

class WebSocketService {
    constructor() {
        this.wss = null;
        this.rooms = new Map(); // Map<reportId, Set<WebSocket>>
        this.pingInterval = null;
    }

    initialize(port = 5001) {
        this.wss = new WebSocket.Server({ port });

        logger.info(`🚀 WebSocket Server running on port ${port}`);

        this.wss.on('connection', async (ws, req) => {
            try {
                // 1. Extract params from URL
                // URL: ws://host:port/?reportId=...&token=...
                const url = new URL(req.url, `ws://${req.headers.host}`);
                const reportId = url.searchParams.get('reportId');
                const token = url.searchParams.get('token');

                if (!reportId || !token) {
                    ws.close(4001, 'Missing parameters');
                    return;
                }

                // 2. Validate Token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('name profileImage');

                if (!user) {
                    ws.close(4001, 'User not found');
                    return;
                }

                // 3. Attach metadata to socket
                ws.user = user;
                ws.reportId = reportId;
                ws.isAlive = true;

                // 4. Join Room
                this.joinRoom(ws, reportId);

                // 5. Handle Messages
                ws.on('message', async (data) => {
                    try {
                        const parsed = JSON.parse(data);
                        await this.handleMessage(ws, parsed);
                    } catch (err) {
                        logger.error('WS Handle Message Error:', err);
                        console.error('Failed Payload:', data);
                        this.send(ws, { type: 'error', message: 'Invalid message format: ' + err.message });
                    }
                });

                // 6. Handle Pong
                ws.on('pong', () => {
                    ws.isAlive = true;
                });

                // 7. Handle Disconnect
                ws.on('close', () => {
                    this.leaveRoom(ws, reportId);
                });

            } catch (error) {
                logger.error('WS Connection error:', error.message);
                ws.close(4001, 'Unauthorized or Invalid Request');
            }
        });

        // Start Heartbeat
        this.startHeartbeat();
    }

    joinRoom(ws, reportId) {
        if (!this.rooms.has(reportId)) {
            this.rooms.set(reportId, new Set());
        }
        this.rooms.get(reportId).add(ws);
        // logger.info(`User ${ws.user.name} joined room ${reportId}`);
    }

    leaveRoom(ws, reportId) {
        if (this.rooms.has(reportId)) {
            const room = this.rooms.get(reportId);
            room.delete(ws);
            if (room.size === 0) {
                this.rooms.delete(reportId);
            }
        }
    }

    async handleMessage(ws, message) {
        // message: { action: 'message:send', content: '...', type: 'text' }
        if (message.action === 'message:send') {
            const { content, type = 'text', metadata = {} } = message;

            if (!content) return;

            // Validate type is a valid enum value
            const validTypes = ['text', 'image', 'system'];
            const messageType = validTypes.includes(type) ? type : 'text';

            // 1. Save to MongoDB
            const savedMessage = await Message.create({
                reportId: ws.reportId,
                sender: ws.user._id,
                content,
                type: messageType,
                metadata
            });

            // Populate user info for broadcast
            await savedMessage.populate('sender', 'name profileImage');

            // 2. Broadcast to Room
            this.broadcastToRoom(ws.reportId, {
                action: 'message:new',
                data: savedMessage
            });
        }

        if (message.action === 'ping') {
            this.send(ws, { action: 'pong' });
        }
    }

    broadcastToRoom(reportId, payload) {
        if (this.rooms.has(reportId)) {
            const room = this.rooms.get(reportId);
            const data = JSON.stringify(payload);
            room.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(data);
                }
            });
        }
    }

    send(ws, payload) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
        }
    }

    startHeartbeat() {
        this.pingInterval = setInterval(() => {
            this.wss.clients.forEach(ws => {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping();
            });
        }, 30000); // Check every 30s
    }
}

module.exports = new WebSocketService();
