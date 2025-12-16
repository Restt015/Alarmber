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
        // Rate limiting: Map<userId, { count: number, resetAt: Date }>
        this.rateLimits = new Map();
        // ANTI-SPAM CONSTANTS
        this.MAX_MESSAGES_PER_WINDOW = 5;
        this.RATE_LIMIT_WINDOW_MS = 30000; // 30 seconds
        this.MAX_MESSAGE_LENGTH = 500;
        this.MIN_MESSAGE_LENGTH = 1;
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

            if (!content || !content.trim()) {
                return this.send(ws, { action: 'error', message: 'El mensaje no puede estar vacío' });
            }

            // Content validation
            if (content.length > this.MAX_MESSAGE_LENGTH) {
                return this.send(ws, { action: 'error', message: `Máximo ${this.MAX_MESSAGE_LENGTH} caracteres` });
            }

            if (content.trim().length < this.MIN_MESSAGE_LENGTH) {
                return this.send(ws, { action: 'error', message: 'Mensaje demasiado corto' });
            }

            // 1. Check user ban status
            const user = await User.findById(ws.user._id);
            if (user.banned) {
                return this.send(ws, { action: 'error', message: 'Tu cuenta ha sido suspendida' });
            }

            // 2. Check mute status
            if (user.mutedUntil && new Date() < new Date(user.mutedUntil)) {
                const remaining = Math.ceil((new Date(user.mutedUntil) - new Date()) / 1000);
                return this.send(ws, { action: 'error', message: `Estás silenciado. Espera ${remaining}s` });
            }

            // 3. Rate limiting check
            const rateLimitError = this.checkRateLimit(ws.user._id);
            if (rateLimitError) {
                // Track violations for spam detection
                const userLimit = this.rateLimits.get(ws.user._id);
                if (userLimit && !userLimit.violations) {
                    userLimit.violations = 0;
                }
                if (userLimit) {
                    userLimit.violations = (userLimit.violations || 0) + 1;

                    // Notify mods if excessive violations
                    if (userLimit.violations >= 3) {
                        const notificationHelper = require('../utils/notificationHelper');
                        await notificationHelper.notifySpamDetected(
                            ws.user._id,
                            ws.reportId,
                            userLimit.count
                        );
                    }
                }

                return this.send(ws, { action: 'error', message: rateLimitError });
            }

            // 4. Get report and check chat status
            const Report = require('../models/Report');
            const report = await Report.findById(ws.reportId);

            if (!report) {
                return this.send(ws, { action: 'error', message: 'Reporte no encontrado' });
            }

            // Check if chat is closed (only allow moderators/admins)
            if (report.chatStatus === 'closed' && !['moderator', 'admin'].includes(user.role)) {
                return this.send(ws, { action: 'error', message: 'El chat está cerrado por moderadores' });
            }

            // 5. Slowmode check (only for regular users)
            if (report.chatStatus === 'slowmode' && report.slowmodeSeconds > 0 && user.role === 'user') {
                if (user.lastMessageAt) {
                    const timeSinceLastMessage = (new Date() - new Date(user.lastMessageAt)) / 1000;
                    if (timeSinceLastMessage < report.slowmodeSeconds) {
                        const remaining = Math.ceil(report.slowmodeSeconds - timeSinceLastMessage);
                        return this.send(ws, { action: 'error', message: `Modo lento activo. Espera ${remaining}s` });
                    }
                }
            }

            // Validate type is a valid enum value
            const validTypes = ['text', 'image', 'system'];
            const messageType = validTypes.includes(type) ? type : 'text';

            // 6. Save to MongoDB
            const savedMessage = await Message.create({
                reportId: ws.reportId,
                sender: ws.user._id,
                content: content.trim(),
                type: messageType,
                metadata,
                senderRole: user.role,
                senderName: user.name,
                status: 'active'
            });

            // Populate user info for broadcast
            await savedMessage.populate('sender', 'name profileImage');

            // 7. Update timestamps
            await User.findByIdAndUpdate(ws.user._id, { lastMessageAt: new Date() });
            await Report.findByIdAndUpdate(ws.reportId, { lastMessageAt: new Date() });

            // 8. Increment rate limit counter
            this.incrementRateLimit(ws.user._id);

            // 9. Broadcast to Room
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

    // Rate limiting helpers
    checkRateLimit(userId) {
        const now = Date.now();
        const userLimit = this.rateLimits.get(userId);

        if (!userLimit) {
            return null; // First message, no limit
        }

        // Check if window has expired
        if (now > userLimit.resetAt) {
            this.rateLimits.delete(userId);
            return null;
        }

        // Check if limit exceeded
        if (userLimit.count >= this.MAX_MESSAGES_PER_WINDOW) {
            const remaining = Math.ceil((userLimit.resetAt - now) / 1000);
            return `Demasiados mensajes. Espera ${remaining}s`;
        }

        return null;
    }

    incrementRateLimit(userId) {
        const now = Date.now();
        const userLimit = this.rateLimits.get(userId);

        if (!userLimit || now > userLimit.resetAt) {
            this.rateLimits.set(userId, {
                count: 1,
                resetAt: now + this.RATE_LIMIT_WINDOW_MS
            });
        } else {
            userLimit.count++;
        }
    }
}

module.exports = new WebSocketService();
