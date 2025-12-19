import api from './api';

/**
 * News Service - Admin CRUD operations for news/articles
 */
const newsService = {
    /**
     * Get published news (public - only published news)
     * @param {Object} params - Query parameters
     * @param {string} params.category - Filter by category
     * @param {string} params.search - Search term
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     */
    getPublishedNews: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        const url = `/news?${queryParams.toString()}`;
        console.log('📰 [getPublishedNews] URL:', url);

        const response = await api.get(url);
        console.log('📰 [getPublishedNews] Full response:', response);
        console.log('📰 [getPublishedNews] response.data length:', response.data?.length);
        console.log('📰 [getPublishedNews] First item:', response.data?.[0]);

        return response;
    },

    /**
     * Get all news (admin - includes unpublished)
     */
    getAllNews: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        if (params.search) queryParams.append('search', params.search);

        // Use new admin-specific endpoint that includes drafts
        const url = `/news/admin/list?${queryParams.toString()}`;
        console.log('📰 [getAllNews] URL:', url);

        const response = await api.get(url);
        console.log('📰 [getAllNews] Full response:', response);
        console.log('📰 [getAllNews] response.data length:', response.data?.length);
        console.log('📰 [getAllNews] First item:', response.data?.[0]);

        return response;
    },

    /**
     * Get single news by ID
     */
    getNewsById: async (id) => {
        const response = await api.get(`/news/${id}`);
        return response;
    },

    /**
     * Create news (admin only)
     * NOTE: Do NOT set Content-Type header manually - React Native FormData requires
     * axios to auto-generate the multipart boundary
     */
    createNews: async (formData) => {
        const response = await api.post('/news', formData);
        return response.data;
    },

    /**
     * Update news (admin only)
     * NOTE: Do NOT set Content-Type header manually - React Native FormData requires
     * axios to auto-generate the multipart boundary
     */
    updateNews: async (id, formData) => {
        const response = await api.put(`/news/${id}`, formData);
        return response.data;
    },

    /**
     * Delete news (admin only)
     */
    deleteNews: async (id) => {
        const response = await api.delete(`/news/${id}`);
        return response.data;
    },

    /**
     * Toggle publish status
     */
    togglePublish: async (id, isPublished) => {
        const formData = new FormData();
        formData.append('isPublished', isPublished);
        const response = await api.put(`/news/${id}`, formData);
        return response.data;
    },
};

export default newsService;
