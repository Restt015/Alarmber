const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    type: {
        type: String,
        enum: ['text', 'image', 'system'],
        default: 'text'
    },
    metadata: {
        type: Object,
        default: {}
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Moderation fields
    senderRole: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    senderName: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['active', 'deleted', 'hidden'],
        default: 'active'
    },
    moderation: {
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            maxlength: 200
        },
        actionAt: Date
    }
}, {
    timestamps: true
});

// Index for fetching chat history for a report efficiently
messageSchema.index({ reportId: 1, createdAt: -1 });

// Index for user message history
messageSchema.index({ sender: 1, createdAt: -1 });

// Index for filtering by status
messageSchema.index({ status: 1, reportId: 1 });

module.exports = mongoose.model('Message', messageSchema);
