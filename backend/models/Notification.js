const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    // User who receives the notification
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Related report (optional)
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        default: null
    },

    // Notification type
    type: {
        type: String,
        enum: ['accepted', 'review', 'rejected', 'updated', 'comment', 'system'],
        required: true
    },

    // Notification content
    title: {
        type: String,
        required: true,
        maxlength: 100
    },
    message: {
        type: String,
        required: true,
        maxlength: 500
    },

    // Read status
    isRead: {
        type: Boolean,
        default: false
    },

    // Additional data for deep linking or context
    data: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function (userId) {
    return this.countDocuments({ userId, isRead: false });
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function (userId) {
    return this.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
    );
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
