const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Register validation
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

    validate
];

// Login validation
const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    validate
];

// Report validation
const validateReport = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

    body('age')
        .trim()
        .notEmpty().withMessage('Age is required'),

    body('lastLocation')
        .trim()
        .notEmpty().withMessage('Last location is required'),

    body('description')
        .trim()
        .notEmpty().withMessage('Physical description is required')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),

    body('clothing')
        .trim()
        .notEmpty().withMessage('Clothing description is required')
        .isLength({ max: 500 }).withMessage('Clothing description cannot exceed 500 characters'),

    body('circumstances')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Circumstances cannot exceed 1000 characters'),

    validate
];

// Alert validation
const validateAlert = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

    body('message')
        .trim()
        .notEmpty().withMessage('Message is required')
        .isLength({ max: 1000 }).withMessage('Message cannot exceed 1000 characters'),

    body('type')
        .optional()
        .isIn(['missing_person', 'found', 'update', 'urgent', 'info'])
        .withMessage('Invalid alert type'),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical'])
        .withMessage('Invalid priority level'),

    validate
];

// News validation
const validateNews = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

    body('content')
        .trim()
        .notEmpty().withMessage('Content is required')
        .isLength({ max: 5000 }).withMessage('Content cannot exceed 5000 characters'),

    body('summary')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Summary cannot exceed 500 characters'),

    body('category')
        .optional()
        .isIn(['alert', 'update', 'success', 'prevention', 'general'])
        .withMessage('Invalid category'),

    validate
];

module.exports = {
    validateRegister,
    validateLogin,
    validateReport,
    validateAlert,
    validateNews
};
