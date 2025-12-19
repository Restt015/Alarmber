const express = require('express');
const router = express.Router();
const {
    createReport,
    getReports,
    getReportById,
    updateReport,
    deleteReport,
    updateReportStatus,
    getMyReports,
    getRecentReports,
    getFinishedReports
} = require('../controllers/reportController');
const { protect, optionalAuth, admin } = require('../middleware/auth');
const { validateReport } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getReports);
router.get('/recent', getRecentReports);
router.get('/finished', getFinishedReports);

// Protected routes - specific routes BEFORE parameterized routes
router.get('/user/my-reports', protect, getMyReports);
router.post('/', protect, upload.single('photo'), validateReport, createReport);

// Parameterized routes (must come after specific routes)
// Uses optionalAuth to identify user for views tracking (owner doesn't increment views)
router.get('/:id', optionalAuth, getReportById);
router.put('/:id', protect, upload.single('photo'), updateReport);
router.delete('/:id', protect, deleteReport);

// Admin only routes
router.patch('/:id/status', protect, admin, updateReportStatus);

module.exports = router;
