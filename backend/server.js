require('dotenv').config();
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
const notificationRoutes = require('./routes/notifications');

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
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

// Routes
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Alarmber API v1.0',
        endpoints: {
            auth: '/api/auth',
            reports: '/api/reports',
            alerts: '/api/alerts',
            news: '/api/news',
            notifications: '/api/notifications',
            admin: '/api/admin'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', require('./routes/admin'));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    logger.info(`📡 API available at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection:', { error: err.message });
    // Close server & exit process
    process.exit(1);
});
