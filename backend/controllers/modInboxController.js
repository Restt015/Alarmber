const ModNotification = require('../models/ModNotification');
const MessageReport = require('../models/MessageReport');

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
                // Pending: unread/read notifications that need action (not system events, not resolved)
                query.type = { $ne: 'system_event' };
                query.status = { $ne: 'resolved' };
                break;
            case 'reported':
                // Reported: message reports specifically
                query.type = 'message_reported';
                break;
            case 'system':
                // System: audit/event logs
                query.type = { $in: ['system_event', 'chat_status_changed'] };
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
            .populate('targetUserId', 'name email')
            .populate('actionBy', 'name')
            .lean();

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
            status: 'unread'
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
        const notification = await ModNotification.findByIdAndUpdate(
            req.params.id,
            { status: 'resolved' },
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
