const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Helper function to convert photo path to full URL
const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }
    const normalizedPath = photoPath.replace(/\\/g, '/');
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    return `${baseUrl}/${cleanPath}`;
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toJSON(),
                profileImage: getPhotoUrl(user.profileImage)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const { name, phone } = req.body;

        // Build update object
        const updateData = {};
        if (name) updateData.name = name.trim();
        if (phone !== undefined) updateData.phone = phone.trim() || null;

        // Handle profile image upload
        if (req.file) {
            updateData.profileImage = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('✅ Profile updated for user:', user.email);

        res.status(200).json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                ...user.toJSON(),
                profileImage: getPhotoUrl(user.profileImage)
            }
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        next(error);
    }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Validate required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'La contraseña actual y la nueva son requeridas'
            });
        }

        // Validate new password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        // Get user with password
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña actual es incorrecta'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = newPassword;
        await user.save();

        console.log('✅ Password changed for user:', user.email);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('❌ Error changing password:', error);
        next(error);
    }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...user.toJSON(),
                profileImage: getPhotoUrl(user.profileImage)
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('✅ Role updated for user:', user.email, '→', role);

        res.status(200).json({
            success: true,
            message: 'Rol actualizado exitosamente',
            data: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user status (Admin only)
// @route   PATCH /api/users/:id/status
// @access  Private/Admin
const updateStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive debe ser un booleano'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        console.log('✅ Status updated for user:', user.email, '→', isActive ? 'active' : 'inactive');

        res.status(200).json({
            success: true,
            message: isActive ? 'Cuenta reactivada' : 'Cuenta desactivada',
            data: user.toJSON()
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getUserById,
    updateRole,
    updateStatus
};

