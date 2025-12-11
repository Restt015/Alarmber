const fs = require('fs');
const path = require('path');

// Simple logger utility
class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../logs');
        this.ensureLogDir();
    }

    ensureLogDir() {
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    getTimestamp() {
        return new Date().toISOString();
    }

    log(level, message, meta = {}) {
        const logMessage = {
            timestamp: this.getTimestamp(),
            level,
            message,
            ...meta
        };

        console.log(`[${logMessage.timestamp}] ${level.toUpperCase()}: ${message}`);

        // Optionally write to file in production
        if (process.env.NODE_ENV === 'production') {
            const logFile = path.join(this.logDir, `${level}.log`);
            fs.appendFileSync(logFile, JSON.stringify(logMessage) + '\n');
        }
    }

    info(message, meta) {
        this.log('info', message, meta);
    }

    error(message, meta) {
        this.log('error', message, meta);
    }

    warn(message, meta) {
        this.log('warn', message, meta);
    }

    debug(message, meta) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', message, meta);
        }
    }
}

module.exports = new Logger();
