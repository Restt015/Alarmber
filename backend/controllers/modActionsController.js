const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const ModNotification = require('../models/ModNotification'); // Added ModNotification
const ModerationLog = require('../models/ModerationLog');
const Report = require('../models/Report');

// Helper to resolve notification linked to action
const resolveRelatedNotification = async (notificationId, moderatorId, note) => {
    if (!notificationId) return null;
    try {
        const notif = await ModNotification.findByIdAndUpdate(
            notificationId,
            {
                status: 'resolved',
                'meta.resolvedAt': new Date(),
                'meta.resolvedBy': moderatorId,
                'meta.resolutionNote': note
            },
            { new: true }
        );

        // Broadcast update
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom('mods', {
            action: 'mod:notification:updated',
            data: notif
        });

        return notif;
    } catch (error) {
        console.error('Error auto-resolving notification:', error);
        return null;
    }
};

// Warning templates
const WARNING_TEMPLATES = {
    spam_detected: (meta) => `Spam detectado (${meta.count || 'varios'} mensajes en ${meta.windowSeconds || 30}s). Próxima vez serás silenciado.`,
    inappropriate_language: 'Lenguaje inapropiado detectado. Próxima vez serás suspendido.',
    off_topic: 'Mantén el chat relevante al reporte. Evita mensajes off-topic.'
};

// @desc    Warn a user
// @route   POST /api/mod/actions/warn
// @access  Moderator+
exports.warnUser = async (req, res, next) => {
    try {
        const { userId, reportId, template, customReason, meta } = req.body;

        if (!userId || !reportId) {
            return res.status(400).json({
                success: false,
                message: 'userId and reportId are required'
            });
        }

        // Determine warning message
        let warningMessage;
        let warningTemplate = template || 'custom';

        if (template && WARNING_TEMPLATES[template]) {
            warningMessage = WARNING_TEMPLATES[template](meta || {});
        } else {
            warningMessage = customReason || 'Has recibido una advertencia del equipo de moderación.';
            warningTemplate = 'custom';
        }

        // Create user notification
        await Notification.create({
            userId,
            type: 'moderation_warning',
            title: '⚠️ Advertencia de Moderación',
            message: warningMessage,
            priority: 'high',
            data: {
                reportId,
                moderatorId: req.user._id,
                template: warningTemplate
            }
        });

        // Auto-resolve notification if provided
        await resolveRelatedNotification(
            req.body.notificationId,
            req.user._id,
            `Acción tomada: Advertencia (${warningTemplate})`
        );

        res.json({
            success: true,
            message: 'Usuario advertido correctamente',
            data: {
                userId,
                warningMessage
            }
        });
    } catch (error) {
        console.error('Error warning user:', error);
        next(error);
    }
};


// @desc    Mute a user from chat
// @route   POST /api/mod/actions/mute
// @access  Moderator+
exports.muteUser = async (req, res, next) => {
    try {
        const { userId, durationSeconds, reason, reportId } = req.body;

        if (!userId || !durationSeconds || durationSeconds < 0) {
            return res.status(400).json({
                success: false,
                message: 'userId and valid durationSeconds are required'
            });
        }

        const chatMuteUntil = new Date(Date.now() + durationSeconds * 1000);
        const chatMuteReason = reason || 'Violación de normas del chat';

        // Update user
        await User.findByIdAndUpdate(userId, {
            chatMuteUntil,
            chatMuteReason,
            $inc: { strikeCount: 1 }
        });

        // Create user notification
        const durationText = durationSeconds >= 86400
            ? `${Math.round(durationSeconds / 86400)} día(s)`
            : durationSeconds >= 3600
                ? `${Math.round(durationSeconds / 3600)} hora(s)`
                : `${Math.round(durationSeconds / 60)} minuto(s)`;

        await Notification.create({
            userId,
            type: 'moderation_mute',
            title: '🔇 Chat Silenciado',
            message: `No podrás enviar mensajes durante ${durationText}. Motivo: ${chatMuteReason}`,
            priority: 'high',
            data: {
                reportId,
                moderatorId: req.user._id,
                muteUntil: chatMuteUntil,
                durationSeconds
            }
        });



        // Auto-resolve notification if provided
        await resolveRelatedNotification(
            req.body.notificationId,
            req.user._id,
            `Acción tomada: Silenciado (${durationSeconds}s)`
        );

        res.json({
            success: true,
            message: 'Usuario silenciado correctamente',
            data: {
                userId,
                chatMuteUntil,
                durationSeconds
            }
        });
    } catch (error) {
        console.error('Error muting user:', error);
        next(error);
    }
};

// @desc    Ban a user (temporal or permanent)
// @route   POST /api/mod/actions/ban
// @access  Moderator+
exports.banUser = async (req, res, next) => {
    try {
        const { userId, durationSeconds, reason, reportId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const banReason = reason || 'Violación grave de normas';
        let updateData;
        let isPermanent = false;

        // Determine if permanent or temporal
        if (!durationSeconds || durationSeconds === 0) {
            // Permanent ban
            updateData = {
                banPermanent: true,
                bannedUntil: null,
                banReason,
                $inc: { strikeCount: 1 }
            };
            isPermanent = true;
        } else {
            // Temporal ban
            const bannedUntil = new Date(Date.now() + durationSeconds * 1000);
            updateData = {
                banPermanent: false,
                bannedUntil,
                banReason,
                $inc: { strikeCount: 1 }
            };
        }

        // Update user
        await User.findByIdAndUpdate(userId, updateData);

        // Create user notification
        const banMessage = isPermanent
            ? `Tu cuenta ha sido suspendida permanentemente. Motivo: ${banReason}`
            : `Tu cuenta ha sido suspendida hasta ${new Date(Date.now() + durationSeconds * 1000).toLocaleString('es-ES')}. Motivo: ${banReason}`;

        await Notification.create({
            userId,
            type: 'moderation_ban',
            title: '🚫 Cuenta Suspendida',
            message: banMessage,
            priority: 'critical',
            data: {
                reportId,
                moderatorId: req.user._id,
                isPermanent,
                bannedUntil: updateData.bannedUntil,
                durationSeconds: durationSeconds || 0
            }
        });



        // Auto-resolve notification if provided
        await resolveRelatedNotification(
            req.body.notificationId,
            req.user._id,
            `Acción tomada: Suspensión (${isPermanent ? 'Permanente' : durationSeconds + 's'})`
        );

        res.json({
            success: true,
            message: isPermanent ? 'Usuario baneado permanentemente' : 'Usuario baneado temporalmente',
            data: {
                userId,
                banPermanent: isPermanent,
                bannedUntil: updateData.bannedUntil,
                banReason
            }
        });
    } catch (error) {
        console.error('Error banning user:', error);
        next(error);
    }
};

// @desc    Delete spam messages
// @route   POST /api/mod/actions/delete-messages
// @access  Moderator+
exports.deleteMessages = async (req, res, next) => {
    try {
        const { reportId, messageIds, reason } = req.body;

        if (!reportId || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'reportId and messageIds array are required'
            });
        }

        console.log('🗑️ Delete Action Payload:', { reportId, messageIds, reason });

        // Ensure IDs are valid ObjectIds
        const mongoose = require('mongoose');
        const objectIdMessageIds = messageIds.map(id => new mongoose.Types.ObjectId(id));
        const objectIdReportId = new mongoose.Types.ObjectId(reportId);

        const deleteReason = reason || 'Spam detectado';

        // Update all messages to deleted status
        const result = await Message.updateMany(
            { _id: { $in: objectIdMessageIds }, reportId: objectIdReportId },
            {
                $set: {
                    status: 'deleted',
                    'moderation.actionBy': req.user._id,
                    'moderation.reason': deleteReason,
                    'moderation.actionAt': new Date()
                }
            }
        );

        console.log('🗑️ Delete Result:', result);

        // Emit WebSocket event
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom(reportId.toString(), {
            action: 'chat:messages:deleted',
            data: {
                messageIds,
                reason: deleteReason,
                count: result.modifiedCount
            }
        });



        // Auto-resolve notification if provided
        await resolveRelatedNotification(
            req.body.notificationId,
            req.user._id,
            `Acción tomada: Borrado de mensajes (${result.modifiedCount})`
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} mensaje(s) eliminado(s)`,
            data: {
                deletedCount: result.modifiedCount,
                messageIds
            }
        });
    } catch (error) {
        console.error('Error deleting messages:', error);
        next(error);
    }
};

// @desc    Enable slowmode on a chat
// @route   POST /api/mod/actions/slowmode
// @access  Moderator+
exports.setSlowmode = async (req, res, next) => {
    try {
        const { reportId, seconds, reason } = req.body;

        if (!reportId) {
            return res.status(400).json({
                success: false,
                message: 'reportId is required'
            });
        }

        const slowmodeSeconds = seconds || 15;
        const slowmodeReason = reason || 'Control de spam';

        // Update report with slowmode
        const report = await Report.findByIdAndUpdate(
            reportId,
            {
                chatStatus: 'slowmode',
                slowmodeSeconds
            },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Emit WebSocket event
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom(reportId.toString(), {
            action: 'chat:slowmode:enabled',
            data: {
                slowmodeSeconds,
                reason: slowmodeReason
            }
        });



        // Auto-resolve notification if provided
        await resolveRelatedNotification(
            req.body.notificationId,
            req.user._id,
            `Acción tomada: Slowmode (${slowmodeSeconds}s)`
        );

        res.json({
            success: true,
            message: `Slowmode activado (${slowmodeSeconds}s)`,
            data: {
                reportId,
                slowmodeSeconds,
                chatStatus: 'slowmode'
            }
        });
    } catch (error) {
        console.error('Error setting slowmode:', error);
        next(error);
    }
};
