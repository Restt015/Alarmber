import api from '../services/api';

/**
 * Resolves asset URLs (images, files) to full URLs accessible from the device
 * Uses the same baseURL as the axios api instance to ensure consistency
 * 
 * @param {string|null} path - Relative path from backend (e.g., "uploads/image.jpg")
 * @returns {string|null} - Full URL or null if no path provided
 * 
 * @example
 * resolveAssetUrl("uploads/image-123.jpg") 
 * // → "http://192.168.1.100:5000/uploads/image-123.jpg"
 * 
 * resolveAssetUrl("uploads\\image-123.jpg") // Windows path
 * // → "http://192.168.1.100:5000/uploads/image-123.jpg"
 * 
 * resolveAssetUrl("https://example.com/image.jpg") // External URL
 * // → "https://example.com/image.jpg"
 * 
 * resolveAssetUrl(null) // No image
 * // → null
 */
export const resolveAssetUrl = (path) => {
    // No path provided
    if (!path) {
        console.log('🖼️ [resolveAssetUrl] No path provided → null');
        return null;
    }

    // Already a full URL (external image)
    if (path.startsWith('http://') || path.startsWith('https://')) {
        console.log('🖼️ [resolveAssetUrl] External URL:', path);
        return path;
    }

    // Get baseURL from axios instance (e.g., "http://192.168.1.100:5000/api")
    const apiBaseUrl = api.defaults.baseURL;

    // Remove /api suffix since uploads are served at root
    const baseUrl = apiBaseUrl.replace(/\/api$/, '');

    // Normalize path: replace backslashes with forward slashes
    const normalizedPath = path.replace(/\\/g, '/');

    // Construct full URL
    const fullUrl = `${baseUrl}/${normalizedPath}`;

    console.log('🖼️ [resolveAssetUrl]');
    console.log('  Input path:', path);
    console.log('  API baseURL:', apiBaseUrl);
    console.log('  Base URL (no /api):', baseUrl);
    console.log('  Normalized path:', normalizedPath);
    console.log('  Final URL:', fullUrl);

    return fullUrl;
};

/**
 * Gets the base URL for the API (with /api)
 * @returns {string} Base URL
 */
export const getApiBaseUrl = () => {
    return api.defaults.baseURL;
};

/**
 * Gets the server base URL (without /api) for static assets
 * @returns {string} Server base URL
 */
export const getServerBaseUrl = () => {
    const apiBaseUrl = api.defaults.baseURL;
    return apiBaseUrl.replace(/\/api$/, '');
};
