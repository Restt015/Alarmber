const express = require('express');
const router = express.Router();
const { protect, moderator } = require('../middleware/auth');
const modInboxController = require('../controllers/modInboxController');

// All routes require moderator access
router.use(protect, moderator);

// GET /api/mod/inbox - Get notifications with filters
router.get('/', modInboxController.getInbox);

// GET /api/mod/inbox/stats - Get stats for badges
router.get('/stats', modInboxController.getStats);

// PATCH /api/mod/inbox/:id/read - Mark as read
router.patch('/:id/read', modInboxController.markRead);

// PATCH /api/mod/inbox/:id/resolve - Mark as resolved
router.patch('/:id/resolve', modInboxController.markResolved);

// PATCH /api/mod/inbox/bulk - Bulk update
router.patch('/bulk', modInboxController.bulkUpdate);

module.exports = router;
