const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Please provide content'],
        maxlength: [5000, 'Content cannot be more than 5000 characters']
    },
    summary: {
        type: String,
        maxlength: [500, 'Summary cannot be more than 500 characters'],
        default: ''
    },
    image: {
        type: String,
        default: null
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    category: {
        type: String,
        enum: ['alert', 'update', 'success', 'prevention', 'general'],
        default: 'general'
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    },
    relatedReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Report',
        default: null
    }
}, {
    timestamps: true
});

// Index for published news
newsSchema.index({ isPublished: 1, publishedAt: -1 });

// Index for text search
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });

module.exports = mongoose.model('News', newsSchema);
