const Report = require('../models/Report');
const Message = require('../models/Message');

// Get reports for moderators with chat metadata
exports.getReports = async (req, res) => {
    try {
        const {
            status,
            urgent,
            dateFrom,
            dateTo,
            q,
            sortBy = 'createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Build match query
        const matchQuery = {};

        if (status) matchQuery.status = status;
        if (urgent === 'true') matchQuery.priority = 'Alta';

        if (dateFrom || dateTo) {
            matchQuery.createdAt = {};
            if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
            if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo);
        }

        if (q) {
            matchQuery.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ];
        }

        // Aggregation to include chat metadata
        const reports = await Report.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'messages',
                    let: { reportId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$reportId', '$$reportId'] },
                                status: 'active'
                            }
                        }
                    ],
                    as: 'messages'
                }
            },
            {
                $addFields: {
                    lastMessageAt: { $max: '$messages.createdAt' },
                    activeChatCount: { $size: '$messages' },
                    unreadCountForMods: { $size: '$messages' }
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    chatStatus: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    lastMessageAt: 1,
                    activeChatCount: 1,
                    unreadCountForMods: 1,
                    location: 1,
                    category: 1
                }
            },
            { $sort: { [sortBy]: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]);

        const total = await Report.countDocuments(matchQuery);

        res.json({
            success: true,
            data: reports,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error getting mod reports:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reportes'
        });
    }
};
