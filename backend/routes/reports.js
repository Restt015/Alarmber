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
    getRecentReports
} = require('../controllers/reportController');
const { protect, admin } = require('../middleware/auth');
const { validateReport } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getReports);
router.get('/recent', getRecentReports);

// Protected routes - specific routes BEFORE parameterized routes
router.get('/user/my-reports', protect, getMyReports);
router.post('/', protect, upload.single('photo'), validateReport, createReport);

// Parameterized routes (must come after specific routes)
router.get('/:id', getReportById);
router.put('/:id', protect, upload.single('photo'), updateReport);
router.delete('/:id', protect, deleteReport);

// Admin only routes
router.patch('/:id/status', protect, admin, updateReportStatus);

module.exports = router;
