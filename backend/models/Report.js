const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // Basic Information (from ReportForm.jsx)
    name: {
        type: String,
        required: [true, 'Please provide the name of the missing person'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    age: {
        type: String,
        required: [true, 'Please provide the age'],
        trim: true
    },
    lastLocation: {
        type: String,
        required: [true, 'Please provide the last known location'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a physical description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    clothing: {
        type: String,
        required: [true, 'Please provide clothing description'],
        maxlength: [500, 'Clothing description cannot be more than 500 characters']
    },
    circumstances: {
        type: String,
        default: '',
        maxlength: [1000, 'Circumstances cannot be more than 1000 characters']
    },

    // Additional Information
    photo: {
        type: String,
        default: null
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'investigating', 'resolved', 'closed'],
        default: 'active'
    },

    // Location coordinates (for map features)
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },

    // Contact Information
    contactPhone: {
        type: String,
        default: null
    },
    contactEmail: {
        type: String,
        default: null
    },

    // Metadata
    views: {
        type: Number,
        default: 0
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    }
}, {
    timestamps: true
});

// Index for geospatial queries
reportSchema.index({ location: '2dsphere' });

// Index for text search
reportSchema.index({ name: 'text', description: 'text', lastLocation: 'text' });

// Index for filtering by status
reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
