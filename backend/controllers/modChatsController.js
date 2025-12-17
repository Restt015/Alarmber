const Message = require('../models/Message');
const Report = require('../models/Report');
const MessageReport = require('../models/MessageReport');

// Get active chats with aggregations
exports.getActiveChats = async (req, res) => {
    try {
        const chats = await Message.aggregate([
            { $match: { status: 'active' } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: '$reportId',
                    lastMessage: { $first: '$$ROOT' },
                    lastMessageAt: { $first: '$createdAt' },
                    totalMessages: { $sum: 1 },
                    // Count messages where mod hasn't read (readBy doesn't include mod)
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $not: {
                                        $in: [req.user._id, { $ifNull: ['$readBy', []] }]
                                    }
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'reports',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'report'
                }
            },
            { $unwind: '$report' },
            {
                $lookup: {
                    from: 'messagereports',
                    let: { reportId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$reportId', '$$reportId'] },
                                status: 'pending'
                            }
                        }
                    ],
                    as: 'messageReports'
                }
            },
            {
                $project: {
                    reportId: { $toString: '$_id' },
                    reportTitle: '$report.name',
                    reportStatus: '$report.status',
                    chatStatus: '$report.chatStatus',
                    lastMessagePreview: '$lastMessage.content',
                    lastMessageAt: 1,
                    unreadCount: 1,
                    totalMessages: 1,
                    urgent: { $eq: ['$report.priority', 'Alta'] },
                    hasReports: { $gt: [{ $size: '$messageReports' }, 0] }
                }
            },
            { $sort: { lastMessageAt: -1 } },
            { $limit: 50 }
        ]);

        res.json({
            success: true,
            data: chats
        });
    } catch (error) {
        console.error('Error getting active chats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener chats activos'
        });
    }
};

// Mark chat as read for moderator
exports.markChatRead = async (req, res) => {
    try {
        const { reportId } = req.params;

        // Update all active messages in this report to include mod in readBy
        const result = await Message.updateMany(
            {
                reportId,
                status: 'active',
                readBy: { $ne: req.user._id }
            },
            {
                $addToSet: { readBy: req.user._id }
            }
        );

        res.json({
            success: true,
            message: 'Chat marcado como leído',
            data: {
                modified: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Error marking chat as read:', error);
        res.status(500).json({
            success: false,
            message: 'Error al marcar chat como leído'
        });
    }
};
