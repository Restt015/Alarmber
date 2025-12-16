const express = require('express');
const router = express.Router();
const { protect, moderator } = require('../middleware/auth');
const modReportsController = require('../controllers/modReportsController');

// All routes require moderator access
router.use(protect, moderator);

// GET /api/mod/reports - Get reports with filters
router.get('/', modReportsController.getReports);

module.exports = router;
