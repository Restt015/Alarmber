const express = require('express');
const router = express.Router();
const {
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', upload.single('profileImage'), updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
