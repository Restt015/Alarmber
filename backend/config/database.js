const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB connection configuration with retry logic
 * Connects to MongoDB Atlas using URI from environment variables
 */
const connectDB = async (retries = 3, delay = 5000) => {
    const uri = process.env.MONGODB_URI;

    // Validate URI exists
    if (!uri) {
        logger.error('❌ MONGODB_URI is not defined in environment variables');
        logger.error('Please set MONGODB_URI in your .env file');
        process.exit(1);
    }

    // Validate URI format
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
        logger.error('❌ Invalid MONGODB_URI format');
        logger.error('Expected: mongodb:// or mongodb+srv://');
        process.exit(1);
    }

    let attempt = 0;

    while (attempt < retries) {
        try {
            attempt++;

            if (attempt > 1) {
                logger.info(`🔄 Retry attempt ${attempt}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }

            // Connect to MongoDB
            const conn = await mongoose.connect(uri, {
                // Modern Mongoose options (v6+)
                serverSelectionTimeoutMS: 10000, // 10 seconds
                socketTimeoutMS: 45000, // 45 seconds
            });

            // Log success (hide sensitive parts of URI)
            const host = conn.connection.host;
            const dbName = conn.connection.name;

            logger.info(`✅ MongoDB Connected Successfully`);
            logger.info(`📡 Host: ${host}`);
            logger.info(`📊 Database: ${dbName}`);
            logger.info(`🌿 Mongoose v${mongoose.version}`);

            return conn;

        } catch (error) {
            logger.error(`❌ MongoDB Connection Error (Attempt ${attempt}/${retries})`);
            logger.error(`   Message: ${error.message}`);

            if (attempt >= retries) {
                logger.error('💀 Failed to connect to MongoDB after maximum retries');
                logger.error('   Please check:');
                logger.error('   1. MongoDB Atlas is accessible');
                logger.error('   2. IP is whitelisted in Atlas Network Access');
                logger.error('   3. Database user credentials are correct');
                logger.error('   4. Connection string format is valid');
                process.exit(1);
            }
        }
    }
};

// Connection event handlers
mongoose.connection.on('connected', () => {
    logger.info('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    logger.error(`❌ Mongoose connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        logger.info('🛑 MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        logger.error(`Error during shutdown: ${err.message}`);
        process.exit(1);
    }
});

module.exports = connectDB;
