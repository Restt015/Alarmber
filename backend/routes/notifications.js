const express = require('express');
const router = express.Router();
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Get notifications and count
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);

// Mark as read
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Delete
router.delete('/', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;
