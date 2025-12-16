const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword,
    getUserById,
    updateRole,
    updateStatus
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Profile routes (any authenticated user)
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);

// Admin only routes
router.get('/:id', admin, getUserById);
router.patch('/:id/role', admin, updateRole);
router.patch('/:id/status', admin, updateStatus);

module.exports = router;
