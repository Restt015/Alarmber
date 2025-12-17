const mongoose = require('mongoose');

const moderationLogSchema = new mongoose.Schema({
    // Action type
    action: {
        type: String,
        enum: ['warn', 'mute', 'ban', 'delete_messages', 'slowmode', 'resolve'],
        required: true
    },

    // Moderator who performed the action
    moderatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Target user (if applicable)
    targetUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Related report
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report'
    },

    // Related mod notification
    notificationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ModNotification'
    },

    // Reason for action
    reason: {
        type: String,
        required: true,
        maxlength: 500
    },

    // Duration for temporary actions (in seconds)
    durationSeconds: {
        type: Number,
        default: 0
    },

    // Flexible metadata for action-specific data
    meta: {
        messageIds: [mongoose.Schema.Types.ObjectId],
        count: Number,
        rule: String,
        warningTemplate: String,
        slowmodeSeconds: Number,
        previousValue: String,
        additionalInfo: String
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for querying
moderationLogSchema.index({ moderatorId: 1, createdAt: -1 });
moderationLogSchema.index({ targetUserId: 1, createdAt: -1 });
moderationLogSchema.index({ reportId: 1, createdAt: -1 });
moderationLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model('ModerationLog', moderationLogSchema);
