const Message = require('../models/Message');
const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Get messages for a report
// @route   GET /api/reports/:reportId/messages
// @access  Private
exports.getMessagesByReportId = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { limit = 50, before } = req.query;

        // Verify report exists
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Build query
        const query = { reportId };

        // Filter deleted messages for regular users
        // Moderators and admins can see all messages explanation: We now return deleted messages sanitized
        // const isModerator = req.user && ['moderator', 'admin'].includes(req.user.role);
        // if (!isModerator) {
        //     query.status = 'active';
        // }
        // Keeping isModerator check for later use in sanitization
        const isModerator = req.user && ['moderator', 'admin'].includes(req.user.role);

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Execute query
        const messages = await Message.find(query)
            .sort({ createdAt: -1 }) // Get newest first for pagination efficiency
            .limit(parseInt(limit))
            .populate('sender', 'name profileImage')
            .lean();

        // Sanitize messages for non-moderators
        const sanitizedMessages = messages.map(msg => {
            if (!isModerator && msg.status === 'deleted') {
                return {
                    ...msg,
                    content: '', // Clear content
                    metadata: {}, // Clear metadata
                    sanitized: true // Flag for frontend
                };
            }
            return msg;
        });

        // Return messages in chronological order (oldest -> newest) for UI
        res.status(200).json({
            success: true,
            count: sanitizedMessages.length,
            data: sanitizedMessages.reverse()
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new message
// @route   POST /api/reports/:reportId/messages
// @access  Private
exports.createMessage = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const { content, type = 'text', metadata = {} } = req.body;

        // Verify report exists
        const report = await Report.findById(reportId);
        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Get full user info for moderation checks
        const sender = await User.findById(req.user._id);

        // Skip moderation checks for moderators and admins
        const isModerator = ['moderator', 'admin'].includes(sender.role);

        if (!isModerator) {
            // Check if user is permanently banned
            if (sender.banPermanent) {
                return res.status(403).json({
                    success: false,
                    message: `Tu cuenta está suspendida permanentemente. Razón: ${sender.banReason || 'Violación de normas'}`
                });
            }

            // Check if user is temporarily banned
            if (sender.bannedUntil && sender.bannedUntil > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: `Tu cuenta está suspendida hasta: ${sender.bannedUntil.toLocaleString('es-ES')}. Razón: ${sender.banReason || 'Violación de normas'}`
                });
            }

            // Check if user is muted in chat
            if (sender.chatMuteUntil && sender.chatMuteUntil > new Date()) {
                return res.status(403).json({
                    success: false,
                    message: `No puedes enviar mensajes. Silenciado hasta: ${sender.chatMuteUntil.toLocaleString('es-ES')}. Razón: ${sender.chatMuteReason || 'Violación de normas del chat'}`
                });
            }
        }

        // Create message
        const message = await Message.create({
            reportId,
            sender: req.user._id,
            senderRole: sender.role,
            senderName: sender.name,
            content,
            type,
            metadata
        });

        // Populate sender info for immediate return
        await message.populate('sender', 'name profileImage');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};
