const Alert = require('../models/Alert');

// @desc    Get all active alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res, next) => {
    try {
        const { type, priority } = req.query;

        const query = { isActive: true };

        if (type) {
            query.type = type;
        }

        if (priority) {
            query.priority = priority;
        }

        const alerts = await Alert.find(query)
            .populate('relatedReport', 'name age lastLocation')
            .populate('createdBy', 'name')
            .sort({ priority: -1, createdAt: -1 })
            .limit(50);

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single alert by ID
// @route   GET /api/alerts/:id
// @access  Public
const getAlertById = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id)
            .populate('relatedReport')
            .populate('createdBy', 'name');

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private (Admin only)
const createAlert = async (req, res, next) => {
    try {
        const {
            title,
            message,
            type,
            priority,
            relatedReport,
            expiresAt
        } = req.body;

        const alert = await Alert.create({
            title,
            message,
            type,
            priority,
            relatedReport,
            expiresAt,
            image: req.file ? req.file.path : null,
            createdBy: req.user._id
        });

        await alert.populate('relatedReport', 'name age lastLocation');

        res.status(201).json({
            success: true,
            message: 'Alert created successfully',
            data: alert
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private (Admin only)
const updateAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        const allowedUpdates = ['title', 'message', 'type', 'priority', 'isActive', 'expiresAt'];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                alert[field] = req.body[field];
            }
        });

        if (req.file) {
            alert.image = req.file.path;
        }

        await alert.save();

        res.json({
            success: true,
            message: 'Alert updated successfully',
            data: alert
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (Admin only)
const deleteAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        await alert.deleteOne();

        res.json({
            success: true,
            message: 'Alert deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deactivate alert
// @route   PATCH /api/alerts/:id/deactivate
// @access  Private (Admin only)
const deactivateAlert = async (req, res, next) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'Alert not found'
            });
        }

        alert.isActive = false;
        await alert.save();

        res.json({
            success: true,
            message: 'Alert deactivated successfully',
            data: alert
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    deleteAlert,
    deactivateAlert
};
