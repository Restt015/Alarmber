const mongoose = require('mongoose');

const modNotificationSchema = new mongoose.Schema({
    // Event type
    type: {
        type: String,
        enum: [
            'message_reported',
            'spam_detected',
            'urgent_report',
            'chat_status_changed',
            'user_flagged',
            'system_event'
        ],
        required: true
    },

    // References
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    },
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    actionBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Priority & Status
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'resolved'],
        default: 'unread'
    },

    // Content
    title: {
        type: String,
        required: true
    },
    preview: {
        type: String,
        default: ''
    },

    // Flexible metadata
    meta: {
        reason: String,
        count: Number,
        reporterIds: [mongoose.Schema.Types.ObjectId],
        suggestedAction: String,
        slowmodeSeconds: Number,
        originalStatus: String,
        description: String
    }
}, {
    timestamps: true
});

// Indexes for performance
modNotificationSchema.index({ status: 1, priority: -1, createdAt: -1 });
modNotificationSchema.index({ type: 1, createdAt: -1 });
modNotificationSchema.index({ reportId: 1, status: 1 });

module.exports = mongoose.model('ModNotification', modNotificationSchema);
