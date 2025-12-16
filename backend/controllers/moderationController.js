const Message = require('../models/Message');
const User = require('../models/User');
const MessageReport = require('../models/MessageReport');
const Report = require('../models/Report');
const notificationHelper = require('../utils/notificationHelper');

// Soft delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reason } = req.body;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Mensaje no encontrado'
            });
        }

        // Update message status
        message.status = 'deleted';
        message.moderation = {
            actionBy: req.user._id,
            reason: reason || 'Violación de normas',
            actionAt: new Date()
        };
        await message.save();

        // Broadcast deletion via WebSocket
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom(message.reportId, {
            action: 'message:deleted',
            data: {
                messageId: message._id,
                reason: message.moderation.reason
            }
        });

        // Create system notification for audit
        await notificationHelper.notifyUserAction(
            'message_deleted',
            message.sender,
            req.user._id,
            reason,
            message.reportId
        );

        res.json({
            success: true,
            message: 'Mensaje eliminado',
            data: message
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error al el iminar mensaje'
        });
    }
};

// Mute a user
exports.muteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { durationSeconds, reason } = req.body;

        if (!durationSeconds || durationSeconds < 0) {
            return res.status(400).json({
                success: false,
                message: 'Duración inválida'
            });
        }

        const mutedUntil = new Date(Date.now() + durationSeconds * 1000);

        await User.findByIdAndUpdate(userId, {
            mutedUntil,
            $inc: { strikeCount: 1 }
        });

        // Create system notification
        await notificationHelper.notifyUserAction(
            'user_muted',
            userId,
            req.user._id,
            reason
        );

        res.json({
            success: true,
            message: 'Usuario silenciado',
            data: { userId, mutedUntil, reason }
        });
    } catch (error) {
        console.error('Error muting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error al silenciar usuario'
        });
    }
};

// Report a message (for regular users)
exports.reportMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { reportId, reason, description } = req.body;

        // Check if already reported by this user
        const existingReport = await MessageReport.findOne({
            messageId,
            reportedBy: req.user._id
        });

        if (existingReport) {
            return res.status(400).json({
                success: false,
                message: 'Ya reportaste este mensaje'
            });
        }

        // Create message report
        await MessageReport.create({
            messageId,
            reportId,
            reportedBy: req.user._id,
            reason,
            description: description || ''
        });

        // Count total reports for this message
        const reportCount = await MessageReport.countDocuments({ messageId });

        // Get all reporter IDs
        const reports = await MessageReport.find({ messageId }).select('reportedBy');
        const reporterIds = reports.map(r => r.reportedBy);

        // Create mod notification
        await notificationHelper.notifyMessageReported(
            messageId,
            reportId,
            reason,
            reporterIds,
            reportCount
        );

        res.json({
            success: true,
            message: 'Mensaje reportado correctamente'
        });
    } catch (error) {
        console.error('Error reporting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error al reportar mensaje'
        });
    }
};

// Update chat status (slowmode, closed, etc.)
exports.updateChatStatus = async (req, res) => {
    try {
        const { reportId } = req.params;
        const { chatStatus, slowmodeSeconds } = req.body;

        if (!['open', 'slowmode', 'closed'].includes(chatStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid chat status'
            });
        }

        const report = await Report.findByIdAndUpdate(
            reportId,
            { chatStatus, slowmodeSeconds: slowmodeSeconds || 0 },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Create notification
        await notificationHelper.notifyChatStatusChanged(
            reportId,
            chatStatus,
            req.user._id,
            slowmodeSeconds
        );

        // Broadcast to chat room
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom(reportId, {
            action: 'chat:status',
            data: { chatStatus, slowmodeSeconds }
        });

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Error updating chat status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar estado del chat'
        });
    }
};

// Ban user (admin only)
exports.banUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        await User.findByIdAndUpdate(userId, {
            banned: true,
            $inc: { strikeCount: 1 }
        });

        // Create system notification
        await notificationHelper.notifyUserAction(
            'user_banned',
            userId,
            req.user._id,
            reason
        );

        res.json({
            success: true,
            message: 'Usuario baneado'
        });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({
            success: false,
            message: 'Error al banear usuario'
        });
    }
};

