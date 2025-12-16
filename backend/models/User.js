const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['user', 'moderator', 'admin'],
        default: 'user'
    },
    profileImage: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Expo Push Notification token
    expoPushToken: {
        type: String,
        default: null
    },
    // Last activity timestamp (updated on report actions)
    lastActive: {
        type: Date,
        default: Date.now
    },
    // Moderation fields
    mutedUntil: {
        type: Date,
        default: null
    },
    banned: {
        type: Boolean,
        default: false
    },
    strikeCount: {
        type: Number,
        default: 0
    },
    lastMessageAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Activity status thresholds (in minutes)
const ACTIVITY_THRESHOLDS = {
    ONLINE: 5,      // Active in last 5 minutes = "online"
    RECENT: 30,     // Active in last 30 minutes = "recent"
    TODAY: 1440     // Active in last 24 hours = "today"
};

// Static method to calculate activity status from lastActive timestamp
userSchema.statics.getActivityStatus = function (lastActive) {
    if (!lastActive) return { status: 'unknown', label: 'Sin actividad' };

    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now - lastActiveDate;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    console.log('📊 Activity Status Calculation:', {
        now: now.toISOString(),
        lastActive: lastActiveDate.toISOString(),
        diffMinutes,
        thresholdOnline: ACTIVITY_THRESHOLDS.ONLINE
    });

    // Online now (within 5 minutes)
    if (diffMinutes < ACTIVITY_THRESHOLDS.ONLINE) {
        return { status: 'online', label: 'En línea', isOnline: true };
    }

    // Recently active (within 30 minutes)
    if (diffMinutes < ACTIVITY_THRESHOLDS.RECENT) {
        return { status: 'recent', label: `Activo hace ${diffMinutes} min`, isOnline: false };
    }

    // Active today (within 24 hours)
    if (diffMinutes < ACTIVITY_THRESHOLDS.TODAY) {
        if (diffHours < 1) {
            return { status: 'today', label: `Activo hace ${diffMinutes} min`, isOnline: false };
        }
        return { status: 'today', label: `Activo hace ${diffHours}h`, isOnline: false };
    }

    // Yesterday
    if (diffDays === 1) {
        return { status: 'yesterday', label: 'Activo ayer', isOnline: false };
    }

    // Days ago
    if (diffDays < 7) {
        return { status: 'days', label: `Activo hace ${diffDays} días`, isOnline: false };
    }

    // Weeks ago
    if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return { status: 'weeks', label: `Activo hace ${weeks} sem`, isOnline: false };
    }

    // Months ago
    const months = Math.floor(diffDays / 30);
    return { status: 'months', label: `Activo hace ${months} ${months === 1 ? 'mes' : 'meses'}`, isOnline: false };
};

// Hash password before saving
userSchema.pre('save', async function () {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without sensitive data + with activity status
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;

    // Add computed activity status
    if (user.lastActive) {
        const User = mongoose.model('User');
        user.activityStatus = User.getActivityStatus(user.lastActive);
    }

    return user;
};

module.exports = mongoose.model('User', userSchema);
