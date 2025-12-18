const express = require('express');
const router = express.Router();
const {
    getNews,
    getAdminNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');
const { protect, admin, optionalAuth } = require('../middleware/auth');
const { validateNews } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Debug middleware to log multipart requests
const debugMultipart = (req, res, next) => {
    console.log('🔍 [Debug Multipart] === REQUEST START ===');
    console.log('🔍 [Debug] Method:', req.method);
    console.log('🔍 [Debug] URL:', req.url);
    console.log('🔍 [Debug] Content-Type:', req.headers['content-type']);
    console.log('🔍 [Debug] Headers:', Object.keys(req.headers));
    next();
};

// Public routes (with optional auth to check if admin)
router.get('/', getNews);
router.get('/:id', optionalAuth, getNewsById);

// Admin only routes
router.get('/admin/list', protect, admin, getAdminNews);
router.post('/', protect, admin, debugMultipart, upload.single('image'), validateNews, createNews);
router.put('/:id', protect, admin, debugMultipart, upload.single('image'), updateNews);
router.delete('/:id', protect, admin, deleteNews);

module.exports = router;
