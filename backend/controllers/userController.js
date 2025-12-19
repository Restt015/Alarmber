const User = require('../models/User');
const NotificationToken = require('../models/NotificationToken');
const bcrypt = require('bcryptjs');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name } = req.body;
        const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

        // Build profile object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (profileImage) profileFields.profileImage = profileImage;

        let user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
exports.updateRole = async (req, res) => {
    try {
        const { role } = req.body;

        // Basic validation for roles
        // Assuming roles are 'user', 'moderator', 'admin'
        if (!['user', 'moderator', 'admin'].includes(role)) {
            return res.status(400).json({ msg: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
exports.updateStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true } // Return updated document
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Register or update push notification token
// @route   POST /api/users/push-token
// @access  Private
exports.registerPushToken = async (req, res) => {
    const { token, platform } = req.body;

    if (!token) {
        return res.status(400).json({ msg: 'Token is required' });
    }

    try {
        // Upsert token
        const notificationToken = await NotificationToken.findOneAndUpdate(
            { token: token },
            {
                userId: req.user.id,
                token: token,
                platform: platform || 'unknown',
                isActive: true,
                lastUsed: Date.now()
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json(notificationToken);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
