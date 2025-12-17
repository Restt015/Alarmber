const express = require('express');
const router = express.Router();
const { protect, moderator } = require('../middleware/auth');
const modActionsController = require('../controllers/modActionsController');
const spamCleanupController = require('../controllers/spamCleanupController');

// All routes require moderator access
router.use(protect, moderator);

// POST /api/mod/actions/warn - Warn a user
router.post('/warn', modActionsController.warnUser);

// POST /api/mod/actions/mute - Mute a user
router.post('/mute', modActionsController.muteUser);

// POST /api/mod/actions/ban - Ban a user (temporal or permanent)
router.post('/ban', modActionsController.banUser);

// POST /api/mod/actions/delete-messages - Delete spam messages
router.post('/delete-messages', modActionsController.deleteMessages);

// POST /api/mod/actions/slowmode - Enable slowmode
router.post('/slowmode', modActionsController.setSlowmode);

// POST /api/mod/actions/spam/cleanup - Cleanup spam with multiple action modes
router.post('/spam/cleanup', spamCleanupController.spamCleanup);

module.exports = router;
