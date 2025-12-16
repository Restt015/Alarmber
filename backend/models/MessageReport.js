const mongoose = require('mongoose');

const messageReportSchema = new mongoose.Schema({
    messageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        required: true
    },
    reportId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        enum: ['spam', 'harassment', 'offensive', 'misinformation', 'other'],
        required: true
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date
}, {
    timestamps: true
});

// Indexes
messageReportSchema.index({ status: 1, createdAt: -1 });
messageReportSchema.index({ messageId: 1, reportedBy: 1 }, { unique: true });
messageReportSchema.index({ reportId: 1, status: 1 });

module.exports = mongoose.model('MessageReport', messageReportSchema);
