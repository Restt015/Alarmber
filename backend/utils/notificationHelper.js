const ModNotification = require('../models/ModNotification');
const Message = require('../models/Message');
const Report = require('../models/Report');

/**
 * Create a mod notification and optionally broadcast it
 * @param {Object} data - Notification data
 * @param {Boolean} broadcast - Whether to broadcast via WebSocket
 * @returns {Promise<Object>} Created notification
 */
const createModNotification = async (data, broadcast = true) => {
    const notification = await ModNotification.create(data);

    if (broadcast) {
        try {
            const websocketService = require('../services/websocketService');
            websocketService.broadcastToRoom('mods', {
                action: 'mod:notification:new',
                data: notification
            });
        } catch (error) {
            console.error('[Notification Helper] Failed to broadcast:', error.message);
            // Don't fail notification creation if WS fails
        }
    }

    return notification;
};

/**
 * Notify when a message is reported by users
 */
const notifyMessageReported = async (messageId, reportId, reason, reporterIds, reportCount = 1) => {
    try {
        const message = await Message.findById(messageId).populate('sender', 'name');
        const report = await Report.findById(reportId);

        if (!message || !report) return null;

        const priority = reportCount >= 3 ? 'high' : reportCount >= 2 ? 'medium' : 'low';

        return await createModNotification({
            type: 'message_reported',
            reportId,
            messageId,
            targetUserId: message.sender._id,
            priority,
            status: 'unread',
            title: `Mensaje reportado ${reportCount > 1 ? `(${reportCount}x)` : ''}`,
            preview: message.content.substring(0, 100),
            meta: {
                reason,
                count: reportCount,
                reporterIds
            }
        });
    } catch (error) {
        console.error('[Notification Helper] notifyMessageReported error:', error);
        return null;
    }
};

/**
 * Notify when spam is detected
 */
const notifySpamDetected = async (userId, reportId, count) => {
    try {
        const user = await require('../models/User').findById(userId);
        const report = await Report.findById(reportId);

        if (!user || !report) return null;

        return await createModNotification({
            type: 'spam_detected',
            reportId,
            targetUserId: userId,
            priority: count >= 10 ? 'high' : 'medium',
            status: 'unread',
            title: 'Spam detectado',
            preview: `${user.name} envió ${count} mensajes en 30s`,
            meta: {
                count,
                suggestedAction: 'mute'
            }
        });
    } catch (error) {
        console.error('[Notification Helper] notifySpamDetected error:', error);
        return null;
    }
};

/**
 * Notify when chat status changes
 */
const notifyChatStatusChanged = async (reportId, newStatus, moderatorId, slowmodeSeconds = 0) => {
    try {
        const report = await Report.findById(reportId);
        const moderator = await require('../models/User').findById(moderatorId);

        if (!report || !moderator) return null;

        const statusLabels = {
            open: 'abierto',
            slowmode: 'modo lento',
            closed: 'cerrado'
        };

        return await createModNotification({
            type: 'chat_status_changed',
            reportId,
            actionBy: moderatorId,
            priority: 'low',
            status: 'unread',
            title: `Chat ${statusLabels[newStatus]}`,
            preview: `${moderator.name} cambió el estado del chat: "${report.name}"`,
            meta: {
                originalStatus: report.chatStatus,
                slowmodeSeconds
            }
        });
    } catch (error) {
        console.error('[Notification Helper] notifyChatStatusChanged error:', error);
        return null;
    }
};

/**
 * Notify system events (mute, ban, delete, etc.)
 */
const notifyUserAction = async (action, targetUserId, moderatorId, reason, reportId = null) => {
    try {
        const targetUser = await require('../models/User').findById(targetUserId);
        const moderator = await require('../models/User').findById(moderatorId);

        if (!targetUser || !moderator) return null;

        const actionLabels = {
            message_deleted: 'Mensaje eliminado',
            user_muted: 'Usuario silenciado',
            user_banned: 'Usuario baneado'
        };

        return await createModNotification({
            type: 'system_event',
            reportId,
            targetUserId,
            actionBy: moderatorId,
            priority: 'low',
            status: 'read', // System events start as read
            title: actionLabels[action] || 'Acción de moderación',
            preview: `${moderator.name} → ${targetUser.name}: ${reason || 'Sin razón'}`,
            meta: {
                reason,
                action
            }
        });
    } catch (error) {
        console.error('[Notification Helper] notifyUserAction error:', error);
        return null;
    }
};

module.exports = {
    createModNotification,
    notifyMessageReported,
    notifySpamDetected,
    notifyChatStatusChanged,
    notifyUserAction
};
