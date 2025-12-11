const News = require('../models/News');
const { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } = require('../config/constants');

// @desc    Get all published news with pagination
// @route   GET /api/news
// @access  Public
const getNews = async (req, res, next) => {
    try {
        const {
            category,
            search,
            page = 1,
            limit = DEFAULT_PAGE_SIZE
        } = req.query;

        const query = { isPublished: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), MAX_PAGE_SIZE);
        const skip = (pageNum - 1) * limitNum;

        const news = await News.find(query)
            .populate('author', 'name')
            .populate('relatedReport', 'name age')
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const total = await News.countDocuments(query);

        res.json({
            success: true,
            data: news,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(total / limitNum),
                totalNews: total,
                limit: limitNum
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id)
            .populate('author', 'name email')
            .populate('relatedReport');

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Only show if published (unless user is admin)
        if (!news.isPublished && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        // Increment view count
        news.views += 1;
        await news.save();

        res.json({
            success: true,
            data: news
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create news
// @route   POST /api/news
// @access  Private (Admin only)
const createNews = async (req, res, next) => {
    try {
        const {
            title,
            content,
            summary,
            category,
            tags,
            relatedReport,
            isPublished
        } = req.body;

        const news = await News.create({
            title,
            content,
            summary,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            relatedReport,
            isPublished,
            image: req.file ? req.file.path : null,
            author: req.user._id
        });

        await news.populate('author', 'name');

        res.status(201).json({
            success: true,
            message: 'News created successfully',
            data: news
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update news
// @route   PUT /api/news/:id
// @access  Private (Admin only)
const updateNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        const allowedUpdates = [
            'title', 'content', 'summary', 'category',
            'tags', 'relatedReport', 'isPublished'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                if (field === 'tags' && typeof req.body[field] === 'string') {
                    news[field] = req.body[field].split(',').map(tag => tag.trim());
                } else {
                    news[field] = req.body[field];
                }
            }
        });

        if (req.file) {
            news.image = req.file.path;
        }

        await news.save();

        res.json({
            success: true,
            message: 'News updated successfully',
            data: news
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete news
// @route   DELETE /api/news/:id
// @access  Private (Admin only)
const deleteNews = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id);

        if (!news) {
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        await news.deleteOne();

        res.json({
            success: true,
            message: 'News deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
