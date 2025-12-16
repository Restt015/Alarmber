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
        // Moderators and admins can see all messages
        const isModerator = req.user && ['moderator', 'admin'].includes(req.user.role);
        if (!isModerator) {
            query.status = 'active';
        }

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        // Execute query
        const messages = await Message.find(query)
            .sort({ createdAt: -1 }) // Get newest first for pagination efficiency
            .limit(parseInt(limit))
            .populate('sender', 'name profileImage')
            .lean();

        // Return messages in chronological order (oldest -> newest) for UI
        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages.reverse()
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

        // Create message
        const message = await Message.create({
            reportId,
            sender: req.user._id,
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
