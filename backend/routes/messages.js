const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/auth');
const { getMessagesByReportId, createMessage } = require('../controllers/messageController');

// All routes require authentication
router.use(protect);

router.route('/reports/:reportId/messages')
    .get(getMessagesByReportId)
    .post(createMessage);

module.exports = router;
