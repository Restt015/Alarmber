const express = require('express');
const router = express.Router();
const { protect, moderator } = require('../middleware/auth');
const modChatsController = require('../controllers/modChatsController');

// All routes require moderator access
router.use(protect, moderator);

// GET /api/mod/chats/active - Get active chats
router.get('/active', modChatsController.getActiveChats);

// PATCH /api/mod/chats/:reportId/read - Mark chat as read
router.patch('/:reportId/read', modChatsController.markChatRead);

module.exports = router;
