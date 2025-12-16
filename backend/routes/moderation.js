const express = require('express');
const router = express.Router();
const { protect, moderator, admin } = require('../middleware/auth');
const moderationController = require('../controllers/moderationController');

// All routes require authentication
router.use(protect);

// Moderator+ routes
router.post('/messages/:messageId/delete', moderator, moderationController.deleteMessage);
router.post('/users/:userId/mute', moderator, moderationController.muteUser);
router.patch('/reports/:reportId/chat-status', moderator, moderationController.updateChatStatus);

// User routes (authenticated only)
router.post('/messages/:messageId/report', moderationController.reportMessage);

// Admin only routes
router.post('/users/:userId/ban', admin, moderationController.banUser);

module.exports = router;
