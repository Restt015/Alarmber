const mongoose = require('mongoose');

const NotificationTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        enum: ['ios', 'android', 'web'],
        default: 'android'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUsed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for quick lookups by user
NotificationTokenSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('NotificationToken', NotificationTokenSchema);
