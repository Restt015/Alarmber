const ModNotification = require('../models/ModNotification');
const MessageReport = require('../models/MessageReport');
const Message = require('../models/Message'); // Import Message model for hydration

// @desc    Get mod inbox notifications
// @route   GET /api/mod/inbox
// @access  Moderator+
exports.getInbox = async (req, res, next) => {
    try {
        const { tab = 'pending', status, priority, q, page = 1, limit = 20 } = req.query;

        // Build query based on tab
        const query = {};

        switch (tab) {
            case 'pending':
                // Pending: unread/read notifications that need action (exclude system types and resolved)
                query.type = { $nin: ['system_event', 'chat_status_changed', 'spam_detected'] };
                query.status = { $ne: 'resolved' };
                break;
            case 'reported':
                // Reported: message reports specifically (not resolved)
                query.type = 'message_reported';
                query.status = { $ne: 'resolved' };
                break;
            case 'system':
                // System: audit/event logs including spam_detected (not resolved)
                query.type = { $in: ['system_event', 'chat_status_changed', 'spam_detected'] };
                query.status = { $ne: 'resolved' };
                break;
            case 'resolved':
                // Resolved: all resolved notifications for audit history
                query.status = 'resolved';
                break;
        }

        // Additional filters
        if (status) {
            query.status = status;
        }
        if (priority) {
            query.priority = priority;
        }

        // Search in title and preview
        if (q) {
            query.$or = [
                { title: { $regex: q, $options: 'i' } },
                { preview: { $regex: q, $options: 'i' } }
            ];
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const notifications = await ModNotification.find(query)
            .sort({ priority: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('reportId', 'name status priority')
            .populate('targetUserId', 'name email profileImage')
            .populate('actionBy', 'name')
            .lean();

        // --- HYDRATION STEP ---
        // Fetch related data that isn't directly populated (like dynamic meta.messageId)

        // 1. Collect Message IDs for hydration
        const messageIds = notifications
            .filter(n => n.type === 'message_reported' && n.meta?.messageId)
            .map(n => n.meta.messageId);

        let messagesMap = {};
        if (messageIds.length > 0) {
            const messages = await Message.find({ _id: { $in: messageIds } })
                .select('content createdAt sender type')
                .lean();
            messages.forEach(m => messagesMap[m._id.toString()] = m);
        }

        // 2. Hydrate notifications
        notifications.forEach(n => {
            // Hydrate Message Reported
            if (n.type === 'message_reported' && n.meta?.messageId) {
                const msg = messagesMap[n.meta.messageId.toString()];
                if (msg) {
                    n.preview = msg.content; // Direct preview for UI
                    n.meta.messageDetail = msg; // Full detail for Case View
                } else {
                    n.preview = "Mensaje no disponible (eliminado)";
                }
            }

            // Hydrate Spam Detected (Generate better preview)
            if (n.type === 'spam_detected') {
                if (!n.preview) {
                    const count = n.meta?.count || n.meta?.messageIds?.length || 0;
                    n.preview = `Usuario envió ${count} mensajes rápidamente.`;
                }
            }
        });

        const total = await ModNotification.countDocuments(query);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get inbox stats
// @route   GET /api/mod/inbox/stats
// @access  Moderator+
exports.getStats = async (req, res, next) => {
    try {
        const pending = await ModNotification.countDocuments({
            type: { $ne: 'system_event' },
            status: { $ne: 'resolved' }
        });

        const reported = await ModNotification.countDocuments({
            type: 'message_reported',
            status: { $ne: 'resolved' }
        });

        const critical = await ModNotification.countDocuments({
            priority: 'high',
            status: { $in: ['unread', 'read'] } // Only unread/read, not resolved
        });

        res.json({
            success: true,
            data: {
                pending,
                reported,
                critical
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PATCH /api/mod/inbox/:id/read
// @access  Moderator+
exports.markRead = async (req, res, next) => {
    try {
        const notification = await ModNotification.findByIdAndUpdate(
            req.params.id,
            { status: 'read' },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        // Broadcast update
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom('mods', {
            action: 'mod:notification:updated',
            data: notification
        });

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as resolved
// @route   PATCH /api/mod/inbox/:id/resolve
// @access  Moderator+
exports.markResolved = async (req, res, next) => {
    try {
        const { resolutionNote } = req.body;

        const notification = await ModNotification.findByIdAndUpdate(
            req.params.id,
            {
                status: 'resolved',
                'meta.resolvedAt': new Date(),
                'meta.resolvedBy': req.user._id,
                'meta.resolutionNote': resolutionNote || ''
            },
            { new: true }
        ).populate('meta.resolvedBy', 'name');

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        // Broadcast update
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom('mods', {
            action: 'mod:notification:updated',
            data: notification
        });

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Bulk update notifications
// @route   PATCH /api/mod/inbox/bulk
// @access  Moderator+
exports.bulkUpdate = async (req, res, next) => {
    try {
        const { ids, status } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'IDs array is required'
            });
        }

        if (!['read', 'resolved'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be "read" or "resolved"'
            });
        }

        const result = await ModNotification.updateMany(
            { _id: { $in: ids } },
            { status }
        );

        res.json({
            success: true,
            data: {
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        next(error);
    }
};
