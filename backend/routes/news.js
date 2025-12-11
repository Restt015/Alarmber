const express = require('express');
const router = express.Router();
const {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
} = require('../controllers/newsController');
const { protect, admin } = require('../middleware/auth');
const { validateNews } = require('../middleware/validation');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);

// Admin only routes
router.post('/', protect, admin, upload.single('image'), validateNews, createNews);
router.put('/:id', protect, admin, upload.single('image'), updateNews);
router.delete('/:id', protect, admin, deleteNews);

module.exports = router;
