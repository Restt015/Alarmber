const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const alertRoutes = require('./routes/alerts');
const newsRoutes = require('./routes/news');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');

/**
 * Validate required environment variables before starting
 */
const validateEnv = () => {
    // Check JWT_SECRET
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
        logger.error('⚠️  SECURITY WARNING: JWT_SECRET must be at least 32 characters long');
        logger.error('Please set a strong JWT_SECRET in your .env file');
        logger.error('Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
        process.exit(1);
    }

    // Check MONGODB_URI
    if (!process.env.MONGODB_URI) {
        logger.error('❌ MONGODB_URI is missing from environment variables');
        logger.error('Please check your .env file');
        process.exit(1);
    }

    logger.info('✅ Environment variables validated');
};

/**
 * Initialize Express application with middleware
 */
const initializeApp = () => {
    const app = express();

    // SECURITY: Configure CORS restrictively
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:19000', 'http://localhost:19002']; // Expo dev defaults

    const corsOptions = {
        origin: function (origin, callback) {
            // Allow requests with no origin (mobile apps, Postman)
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                logger.warn(`CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        optionsSuccessStatus: 200
    };

    app.use(cors(corsOptions));

    // Body parsing middleware
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Logging middleware (only in development)
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Create uploads directory if it doesn't exist
    const fs = require('fs');
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
        logger.info(`Created uploads directory: ${uploadPath}`);
    }

    // Serve static files (uploads)
    app.use('/uploads', express.static(uploadPath));

    // API Routes
    app.get('/', (req, res) => {
        res.json({
            success: true,
            message: 'Alarmber API v1.0',
            endpoints: {
                auth: '/api/auth',
                users: '/api/users',
                reports: '/api/reports',
                alerts: '/api/alerts',
                news: '/api/news',
                notifications: '/api/notifications',
                admin: '/api/admin',
                messages: '/api/reports/:reportId/messages',
                moderation: '/api/moderation',
                modInbox: '/api/mod/inbox',
                modReports: '/api/mod/reports',
                modChats: '/api/mod/chats'
            }
        });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api', require('./routes/messages')); // Messages routes (mounted at /api to support full path)
    app.use('/api/alerts', alertRoutes);
    app.use('/api/news', newsRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/moderation', require('./routes/moderation'));
    app.use('/api/mod/inbox', require('./routes/modInbox'));
    app.use('/api/mod/reports', require('./routes/modReports'));
    app.use('/api/mod/chats', require('./routes/modChats'));
    app.use('/api/mod/actions', require('./routes/modActions'));

    // Error handling
    app.use(notFound);
    app.use(errorHandler);

    return app;
};

/**
 * Start the server
 */
const startServer = async () => {
    try {
        // Step 1: Validate environment variables
        logger.info('🔍 Validating environment variables...');
        validateEnv();

        // Step 2: Connect to database (fail-fast if connection fails)
        logger.info('🔌 Connecting to MongoDB...');
        await connectDB();

        // Step 3: Initialize Express app
        logger.info('🚀 Initializing Express application...');
        const app = initializeApp();

        // Step 4: Initialize WebSocket Service
        logger.info('🌐 Initializing WebSocket service...');
        const websocketService = require('./services/websocketService');
        const WS_PORT = process.env.WS_PORT || 5001;
        websocketService.initialize(WS_PORT);

        // Step 5: Start HTTP server
        const PORT = process.env.PORT || 5000;
        const HOST = '0.0.0.0'; // Listen on all network interfaces (allows access from phone)

        app.listen(PORT, HOST, () => {
            logger.info('═══════════════════════════════════════');
            logger.info('🚀 Server running successfully');
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`📡 HTTP Server: http://localhost:${PORT}`);
            logger.info(`📱 Mobile access: http://192.168.0.3:${PORT}`);
            logger.info(`🔌 WebSocket: ws://localhost:${WS_PORT}`);
            logger.info('═══════════════════════════════════════');
        });

    } catch (error) {
        logger.error('💀 Failed to start server');
        logger.error(error.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('💥 Unhandled Promise Rejection:', { error: err.message });
    logger.error('Shutting down...');
    process.exit(1);
});

// Start the server
startServer();
