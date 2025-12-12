const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllReports,
    validateReport,
    assignReport,
    updateReportStatus,
    getUserStats,
    getAllUsers
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard/stats', protect, admin, getDashboardStats);

// Reports management
router.get('/reports', protect, admin, getAllReports);
router.patch('/reports/:id/validate', protect, admin, validateReport);
router.patch('/reports/:id/assign', protect, admin, assignReport);
router.patch('/reports/:id/status', protect, admin, updateReportStatus);

// User management
router.get('/users/stats', protect, admin, getUserStats);
router.get('/users', protect, admin, getAllUsers);

module.exports = router;
