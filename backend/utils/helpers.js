/**
 * Centralized helper utilities
 */

/**
 * Convert photo path to full URL
 * @param {string} photoPath - File path or URL
 * @returns {string|null} Full URL or null
 */
const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;

    // Already a full URL
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
    }

    // Normalize path (replace backslashes with forward slashes)
    const normalizedPath = photoPath.replace(/\\/g, '/');

    // Remove leading slash if present
    const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.substring(1) : normalizedPath;

    // Get base URL from environment or use default
    const baseUrl = process.env.API_URL || 'http://localhost:5000';

    return `${baseUrl}/${cleanPath}`;
};

module.exports = {
    getPhotoUrl
};
