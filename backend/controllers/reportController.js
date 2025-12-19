const Report = require('../models/Report');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { getPhotoUrl } = require('../utils/helpers');
const { sendPushNotification } = require('../services/pushService');

// Constants
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Helper function to transform a report object with all necessary data
const transformReport = (report) => {
    const reportObj = report.toObject ? report.toObject() : { ...report };

    // Transform report photo URL
    if (reportObj.photo) {
        reportObj.photo = getPhotoUrl(reportObj.photo);
    }

    // Transform reportedBy data if present
    if (reportObj.reportedBy) {
        // Transform profileImage URL
        if (reportObj.reportedBy.profileImage) {
            reportObj.reportedBy.profileImage = getPhotoUrl(reportObj.reportedBy.profileImage);
        }
        // Add activity status calculated by backend
        if (reportObj.reportedBy.lastActive) {
            reportObj.reportedBy.activityStatus = User.getActivityStatus(reportObj.reportedBy.lastActive);
        }
    }

    return reportObj;
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res, next) => {
    try {
        const {
            name,
            age,
            lastLocation,
            description,
            clothing,
            circumstances,
            contactPhone,
            contactEmail,
            relationship
        } = req.body;

        const report = await Report.create({
            name,
            age,
            lastLocation,
            description,
            clothing,
            circumstances,
            contactPhone,
            contactEmail,
            relationship,
            photo: req.file ? req.file.path : null,
            reportedBy: req.user._id
        });

        // Update user's lastActive timestamp
        await User.findByIdAndUpdate(req.user._id, { lastActive: new Date() });

        // Transform photo path to full URL
        if (report.photo) {
            report.photo = getPhotoUrl(report.photo);
        }

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all reports with filters and pagination
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res, next) => {
    try {
        const {
            status,
            priority,
            search,
            page = 1,
            limit = DEFAULT_PAGE_SIZE
        } = req.query;

        // Build query - ONLY SHOW VALIDATED AND ACTIVE REPORTS TO PUBLIC
        const query = {
            validated: true,
            status: { $in: ['active', 'investigating'] } // Only active/investigating reports
        };

        // Note: Public cannot override status to see non-active reports
        if (status && ['active', 'investigating'].includes(status)) {
            query.status = status;
        }

        if (priority) {
            query.priority = priority;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), MAX_PAGE_SIZE);
        const skip = (pageNum - 1) * limitNum;

        // Execute query
        const [reports, total] = await Promise.all([
            Report.find(query)
                .populate('reportedBy', 'name email phone profileImage lastActive')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Report.countDocuments(query)
        ]);

        // Transform reports with full URLs and activity status
        const transformedReports = reports.map(transformReport);

        res.json({
            success: true,
            data: transformedReports,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReports: total,
                limit: limitNum
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get recent reports (last N reports)
// @route   GET /api/reports/recent
// @access  Public
const getRecentReports = async (req, res, next) => {
    try {
        const { limit = 5 } = req.query;
        const limitNum = Math.min(parseInt(limit, 10), 20);

        // Only validated and active/investigating reports
        const reports = await Report.find({
            validated: true,
            status: { $in: ['active', 'investigating'] }
        })
            .populate('reportedBy', 'name email phone profileImage lastActive')
            .sort({ createdAt: -1 })
            .limit(limitNum);

        // Transform reports with full URLs and activity status
        const transformedReports = reports.map(transformReport);

        res.json({
            success: true,
            data: transformedReports
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get finished reports
// @route   GET /api/reports/finished
// @access  Public
const getFinishedReports = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = DEFAULT_PAGE_SIZE
        } = req.query;

        // Only validated and closed/resolved reports
        const query = {
            validated: true,
            status: { $in: ['closed', 'resolved'] }
        };

        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), MAX_PAGE_SIZE);
        const skip = (pageNum - 1) * limitNum;

        const reports = await Report.find(query)
            .populate('reportedBy', 'name email phone profileImage lastActive')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Report.countDocuments(query);

        // Transform reports with full URLs and activity status
        const transformedReports = reports.map(transformReport);

        res.json({
            success: true,
            data: transformedReports,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReports: total,
                limit: limitNum
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'ID de reporte inválido'
            });
        }

        const report = await Report.findById(id)
            .populate('reportedBy', 'name email phone profileImage lastActive');

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Increment view count only if:
        // 1. User is not logged in (public view), OR
        // 2. Logged in user is different from the report creator
        const currentUserId = req.user?._id?.toString();
        const reportOwnerId = report.reportedBy?._id?.toString();

        // Only increment if it's not the owner viewing their own report
        if (!currentUserId || currentUserId !== reportOwnerId) {
            report.views += 1;
            await report.save();
        }

        // Transform report with full URLs and activity status
        const transformedReport = transformReport(report);

        res.json({
            success: true,
            data: transformedReport
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private (Owner or Admin)
const updateReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Check ownership or admin
        if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this report'
            });
        }

        // Update allowed fields
        const allowedUpdates = [
            'name', 'age', 'lastLocation', 'description',
            'clothing', 'circumstances', 'contactPhone', 'contactEmail'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                report[field] = req.body[field];
            }
        });

        if (req.file) {
            report.photo = req.file.path;
        }

        await report.save();

        res.json({
            success: true,
            message: 'Report updated successfully',
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Owner or Admin)
const deleteReport = async (req, res, next) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found'
            });
        }

        // Check ownership or admin
        if (report.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this report'
            });
        }

        await report.deleteOne();

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update report status
// @route   PATCH /api/reports/:id/status
// @access  Private/Admin
const updateReportStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
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

        // Notify user about status change if it wasn't the user themselves (rare case for admins)
        if (report.reportedBy && report.reportedBy.toString() !== req.user._id.toString()) {
            const notificationTitle = 'Actualización de Reporte';
            const notificationMessage = `El estado de tu reporte ha cambiado a: ${status}`;

            // 1. Create Notification in DB (Persistence)
            await Notification.create({
                userId: report.reportedBy,
                reportId: report._id,
                type: 'status_update',
                title: notificationTitle,
                message: notificationMessage,
                priority: 'normal',
                data: {
                    reportId: report._id,
                    newStatus: status
                }
            });

            // 2. Send Push Notification
            sendPushNotification(
                [report.reportedBy],
                notificationTitle,
                notificationMessage,
                { type: 'status_update', reportId: report._id, newStatus: status }
            );
        }

        res.json({
            success: true,
            message: 'Report status updated',
            data: report
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's own reports
// @route   GET /api/reports/user/my-reports
// @access  Private
const getMyReports = async (req, res, next) => {
    try {
        const { page = 1, limit = DEFAULT_PAGE_SIZE } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), MAX_PAGE_SIZE);
        const skip = (pageNum - 1) * limitNum;

        const query = { reportedBy: req.user._id };

        const reports = await Report.find(query)
            .populate('reportedBy', 'name email phone profileImage lastActive')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Report.countDocuments(query);

        // Transform reports with full URLs and activity status
        const transformedReports = reports.map(transformReport);

        res.json({
            success: true,
            data: transformedReports,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReports: total,
                limit: limitNum
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    updateReportStatus,
    getMyReports,
    getRecentReports,
    getFinishedReports
};
