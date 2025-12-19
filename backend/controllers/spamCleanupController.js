const ModNotification = require('../models/ModNotification');
const Message = require('../models/Message');
const User = require('../models/User');
const ModerationLog = require('../models/ModerationLog');
const Notification = require('../models/Notification');

// @desc    Cleanup spam notification with multiple action modes
// @route   POST /api/mod/actions/spam/cleanup
// @access  Moderator+
exports.spamCleanup = async (req, res, next) => {
    try {
        const { notificationId, actionMode } = req.body;

        if (!notificationId || !actionMode) {
            return res.status(400).json({
                success: false,
                message: 'notificationId and actionMode are required'
            });
        }

        const validModes = ['resolve_only', 'resolve_and_delete_messages', 'resolve_delete_and_mute_1h', 'resolve_delete_and_mute_24h'];
        if (!validModes.includes(actionMode)) {
            return res.status(400).json({
                success: false,
                message: `Invalid actionMode. Must be one of: ${validModes.join(', ')}`
            });
        }

        // Get notification
        const notification = await ModNotification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.type !== 'spam_detected') {
            return res.status(400).json({
                success: false,
                message: 'This endpoint is only for spam_detected notifications'
            });
        }

        const reportId = notification.reportId;
        const targetUserId = notification.targetUserId;
        const meta = notification.meta || {};

        let deletedCount = 0;
        let mutedUntil = null;
        let actionsSummary = [];

        // Step 1: Delete messages if requested
        if (actionMode.includes('delete_messages') || actionMode.includes('delete_and_mute')) {
            let messageIds = meta.messageIds || [];

            // Fallback: if no messageIds, get recent messages from user in report
            if (!messageIds || messageIds.length === 0) {
                const windowSeconds = meta.windowSeconds || 30;
                const lookbackTime = new Date(Date.now() - windowSeconds * 1000);

                const recentMessages = await Message.find({
                    reportId,
                    sender: targetUserId,
                    createdAt: { $gte: lookbackTime },
                    status: 'active'
                }).select('_id').lean();

                messageIds = recentMessages.map(m => m._id);
            }

            if (messageIds.length > 0) {
                const deleteResult = await Message.updateMany(
                    { _id: { $in: messageIds }, reportId },
                    {
                        status: 'deleted',
                        'moderation.actionBy': req.user._id,
                        'moderation.reason': 'Spam detectado',
                        'moderation.actionAt': new Date()
                    }
                );

                deletedCount = deleteResult.modifiedCount;

                // Emit WebSocket event
                const websocketService = require('../services/websocketService');
                websocketService.broadcastToRoom(reportId.toString(), {
                    action: 'chat:messages:deleted',
                    data: {
                        messageIds,
                        reason: 'Spam detectado',
                        count: deletedCount
                    }
                });

                // Log deletion
                await ModerationLog.create({
                    action: 'delete_messages',
                    moderatorId: req.user._id,
                    targetUserId,
                    reportId,
                    notificationId,
                    reason: 'Spam detectado',
                    meta: {
                        messageIds,
                        count: deletedCount,
                        rule: meta.rule
                    }
                });

                actionsSummary.push(`${deletedCount} mensaje(s) eliminado(s)`);
            }
        }

        // Step 2: Mute user if requested
        if (actionMode.includes('mute_1h') || actionMode.includes('mute_24h')) {
            const durationSeconds = actionMode.includes('mute_1h') ? 3600 : 86400;
            mutedUntil = new Date(Date.now() + durationSeconds * 1000);
            const muteReason = 'Spam detectado';

            await User.findByIdAndUpdate(targetUserId, {
                chatMuteUntil: mutedUntil,
                chatMuteReason: muteReason,
                $inc: { strikeCount: 1 }
            });

            // Create user notification
            const durationText = durationSeconds >= 86400
                ? `${Math.round(durationSeconds / 86400)} día(s)`
                : `${Math.round(durationSeconds / 3600)} hora(s)`;

            await Notification.create({
                userId: targetUserId,
                type: 'moderation_mute',
                title: '🔇 Chat Silenciado',
                message: `No podrás enviar mensajes durante ${durationText}. Motivo: ${muteReason}`,
                priority: 'high',
                data: {
                    reportId,
                    moderatorId: req.user._id,
                    muteUntil: mutedUntil,
                    durationSeconds
                }
            });

            // Log mute action
            await ModerationLog.create({
                action: 'mute',
                moderatorId: req.user._id,
                targetUserId,
                reportId,
                notificationId,
                reason: muteReason,
                durationSeconds
            });

            actionsSummary.push(`Usuario silenciado ${durationText}`);
        }

        // Step 3: Mark ALL pending spam notifications for this user/report as resolved
        await ModNotification.updateMany(
            {
                reportId,
                targetUserId,
                type: 'spam_detected',
                status: { $ne: 'resolved' }
            },
            {
                $set: {
                    status: 'resolved',
                    'meta.resolvedAt': new Date(),
                    'meta.resolvedBy': req.user._id,
                    'meta.resolutionNote': `Acción: ${actionMode} (Bulk Resolve)`,
                    'meta.deletedCount': deletedCount
                }
            }
        );

        // Log resolution
        await ModerationLog.create({
            action: 'resolve',
            moderatorId: req.user._id,
            targetUserId,
            reportId,
            notificationId, // Logs the primary one triggered
            reason: actionMode,
            meta: {
                actionMode,
                deletedCount,
                mutedUntil: mutedUntil ? mutedUntil.toISOString() : null,
                bulkResolve: true
            }
        });

        // Emit WebSocket event for specific notification AND broadcast refresh
        const websocketService = require('../services/websocketService');
        websocketService.broadcastToRoom('mods', {
            action: 'mod:notification:bulk_resolved',
            data: { reportId, targetUserId, type: 'spam_detected' }
        });

        res.json({
            success: true,
            message: actionsSummary.length > 0
                ? actionsSummary.join(' + ')
                : 'Spam resuelto',
            data: {
                notificationId,
                actionMode,
                deletedCount,
                mutedUntil,
                actionsSummary
            }
        });
    } catch (error) {
        console.error('Error cleaning up spam:', error);
        next(error);
    }
};
