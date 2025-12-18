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

// @desc    Get all news (including drafts) for admin
// @route   GET /api/news/admin/list
// @access  Private (Admin only)
const getAdminNews = async (req, res, next) => {
    try {
        const {
            category,
            search,
            page = 1,
            limit = DEFAULT_PAGE_SIZE
        } = req.query;

        // No 'isPublished' filter here - allow seeing everything
        const query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        const pageNum = parseInt(page, 10);
        const limitNum = Math.min(parseInt(limit, 10), MAX_PAGE_SIZE);
        const skip = (pageNum - 1) * limitNum;

        // Sort by updatedAt for admins to see recent changes/drafts first
        const news = await News.find(query)
            .populate('author', 'name')
            .populate('relatedReport', 'name age')
            .sort({ updatedAt: -1 })
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
// @desc    Get single news by ID
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res, next) => {
    try {
        console.log('📰 [getNewsById] ID:', req.params.id);

        const news = await News.findById(req.params.id)
            .populate('author', 'name email')
            .populate('relatedReport');

        if (!news) {
            console.log('❌ [getNewsById] Not found in DB');
            return res.status(404).json({
                success: false,
                message: 'News not found'
            });
        }

        console.log(`📰 [getNewsById] Found: "${news.title}" | Published: ${news.isPublished}`);
        console.log(`📰 [getNewsById] User role: ${req.user ? req.user.role : 'GUEST'}`);

        // Only show if published (unless user is admin)
        if (!news.isPublished && (!req.user || req.user.role !== 'admin')) {
            console.log('❌ [getNewsById] Hidden (Draft & Not Admin)');
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
        // Debug logging
        console.log('📰 [Backend createNews] === REQUEST RECEIVED ===');
        console.log('📰 [Backend] req.body:', req.body);
        console.log('📰 [Backend] req.file:', req.file);
        console.log('📰 [Backend] Has file?:', !!req.file);
        if (req.file) {
            console.log('📰 [Backend] File details:', {
                fieldname: req.file.fieldname,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                destination: req.file.destination,
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            });
        } else {
            console.log('❌ [Backend] No file received - req.file is undefined');
        }

        const {
            title,
            content,
            summary,
            category,
            tags,
            relatedReport,
            isPublished
        } = req.body;

        const imagePath = req.file ? req.file.path : null;
        console.log('📰 [Backend] Image path to save:', imagePath);

        const news = await News.create({
            title,
            content,
            summary,
            category,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            relatedReport,
            isPublished,
            image: imagePath,
            author: req.user._id
        });

        await news.populate('author', 'name');

        console.log('✅ [Backend] News created:', {
            _id: news._id,
            title: news.title,
            image: news.image,
            hasImage: !!news.image
        });

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
        console.log('📝 [Backend updateNews] === REQUEST RECEIVED ===');
        console.log('📝 [Backend] News ID:', req.params.id);
        console.log('📝 [Backend] Content-Type:', req.headers['content-type']);
        console.log('📝 [Backend] req.body keys:', Object.keys(req.body));
        console.log('📝 [Backend] req.file:', req.file ? 'YES' : 'NO');

        if (req.file) {
            console.log('📝 [Backend] New file details:', req.file.path);
        }

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
                    // Handle tags sent as string in FormData (e.g. "tag1, tag2")
                    news[field] = req.body[field].split(',').map(tag => tag.trim()).filter(t => t);
                } else if (field === 'isPublished') {
                    // Handle boolean sent as string in FormData
                    if (req.body[field] === 'true') news[field] = true;
                    if (req.body[field] === 'false') news[field] = false;
                    // If sent as actual boolean (JSON request), use as is
                    if (typeof req.body[field] === 'boolean') news[field] = req.body[field];
                } else {
                    news[field] = req.body[field];
                }
            }
        });

        // Only update image if a new file is provided
        if (req.file) {
            console.log('📝 [Backend] Updating image from', news.image, 'to', req.file.path);

            // Optional: Here you could delete the old image file using fs.unlink
            // if (news.image && fs.existsSync(news.image)) fs.unlinkSync(news.image);

            news.image = req.file.path;
        } else {
            console.log('📝 [Backend] No new image file provided. Keeping existing image:', news.image);
        }

        await news.save();

        console.log('✅ [Backend] Update saved successfully');

        res.json({
            success: true,
            message: 'News updated successfully',
            data: news
        });
    } catch (error) {
        console.error('❌ [Backend] Update failed:', error);
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
    getAdminNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews
};
