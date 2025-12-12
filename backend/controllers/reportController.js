const Report = require('../models/Report');
const User = require('../models/User');

// Constants
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

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
            contactEmail
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
            photo: req.file ? req.file.path : null,
            reportedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('❌ Error creating report:', error);
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
            status: { $in: ['active', 'investigating'] } // Only active reports
        };

        if (status) {
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
        const reports = await Report.find(query)
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Report.countDocuments(query);

        res.json({
            success: true,
            data: reports,
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
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .limit(limitNum);

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        console.error('❌ Error getting recent reports:', error);
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
            .populate('reportedBy', 'name email phone')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Report.countDocuments(query);

        res.json({
            success: true,
            data: reports,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalReports: total,
                limit: limitNum
            }
        });
    } catch (error) {
        console.error('❌ Error getting finished reports:', error);
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
            console.error('❌ Invalid ObjectId format:', id);
            return res.status(400).json({
                success: false,
                message: 'ID de reporte inválido'
            });
        }

        console.log('🔍 Fetching report with ID:', id);

        const report = await Report.findById(id)
            .populate('reportedBy', 'name email phone');

        if (!report) {
            console.error('❌ Report not found with ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Reporte no encontrado'
            });
        }

        // Increment view count
        report.views += 1;
        await report.save();

        console.log('✅ Report found:', report.name);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('❌ Error in getReportById:', error);
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
            .populate('reportedBy', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await Report.countDocuments(query);

        res.json({
            success: true,
            data: reports,
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
