const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Please provide a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    type: {
        type: String,
        enum: ['missing_person', 'found', 'update', 'urgent', 'info'],
        default: 'info'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    relatedReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        default: null
    },
    image: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for active alerts
alertSchema.index({ isActive: 1, priority: -1, createdAt: -1 });

// Automatically set isActive to false when expired
alertSchema.pre('find', function () {
    const now = new Date();
    this.where({ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] });
});

module.exports = mongoose.model('Alert', alertSchema);
