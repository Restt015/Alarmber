const Report = require('../models/Report');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Run all queries in parallel
        const [
            activeReports,
            needFollowUp,
            pendingValidation,
            recentlyClosed,
            totalUsers,
            activeUsers
        ] = await Promise.all([
            // Active Reports (validated and active)
            Report.countDocuments({ status: 'active', validated: true }),

            // Need Follow-up (>7 days old, still active AND validated)
            Report.countDocuments({
                status: 'active',
                validated: true,
                createdAt: { $lt: sevenDaysAgo }
            }),

            // Pending Validation (NOT VALIDATED YET - any status)
            Report.countDocuments({
                validated: false
            }),

            // Recently Closed
            Report.countDocuments({
                status: { $in: ['closed', 'resolved'] },
                updatedAt: { $gte: sevenDaysAgo }
            }),

            // Total Users
            User.countDocuments(),

            // Active Users (created report in last 30 days)
            User.countDocuments({
                _id: {
                    $in: await Report.distinct('reportedBy', {
                        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    })
                }
            })
        ]);

        res.status(200).json({
            success: true,
            data: {
                activeReports,
                needFollowUp,
                pendingValidation,
                recentlyClosed,
                totalUsers,
                activeUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// @desc    Get all reports with filters and pagination
// @route   GET /api/admin/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            validated,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (status) query.status = status;
        if (validated !== undefined) query.validated = validated === 'true';
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { lastLocation: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        // Execute query
        const [reports, total] = await Promise.all([
            Report.find(query)
                .populate('reportedBy', 'name email')
                .populate('validatedBy', 'name')
                .populate('assignedTo', 'name')
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Report.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: reports,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalReports: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reports',
            error: error.message
        });
    }
};

// @desc    Validate a report
// @route   PATCH /api/admin/reports/:id/validate
// @access  Private/Admin
exports.validateReport = async (req, res) => {
    try {
        const { notes } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Validate and set to active status
        report.validated = true;
        report.validatedBy = req.user._id;
        report.validatedAt = new Date();
        report.status = 'active'; // Always set to active when validating
        if (notes) report.notes = notes;

        await report.save();

        console.log('✅ Report validated and set to active:', report._id);

        res.status(200).json({
            success: true,
            data: report,
            message: 'Report validated successfully'
        });
    } catch (error) {
        console.error('❌ Error validating report:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating report',
            error: error.message
        });
    }
};

// @desc    Assign a report to a user
// @route   PATCH /api/admin/reports/:id/assign
// @access  Private/Admin
exports.assignReport = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a user ID'
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.assignedTo = userId;
        report.assignedAt = new Date();

        await report.save();

        res.status(200).json({
            success: true,
            data: report,
            message: 'Report assigned successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning report',
            error: error.message
        });
    }
};

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
    try {
        // Get top reporters (users with most reports)
        const topReporters = await Report.aggregate([
            {
                $group: {
                    _id: '$reportedBy',
                    reportCount: { $sum: 1 },
                    lastReport: { $max: '$createdAt' }
                }
            },
            { $sort: { reportCount: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: '$user._id',
                    name: '$user.name',
                    email: '$user.email',
                    reportCount: 1,
                    lastReport: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                topReporters
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user stats',
            error: error.message
        });
    }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        const validStatuses = ['active', 'investigating', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: active, investigating, resolved, closed'
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        report.status = status;
        await report.save();

        res.status(200).json({
            success: true,
            data: report,
            message: 'Report status updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating report status',
            error: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            role
        } = req.query;

        // Build query
        const query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalUsers: total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};
