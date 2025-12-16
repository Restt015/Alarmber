import api from './api';

/**
 * News Service - Admin CRUD operations for news/articles
 */
const newsService = {
    /**
     * Get all news (admin - includes unpublished)
     */
    getAllNews: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.page) queryParams.append('page', params.page);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.search) queryParams.append('search', params.search);

        const response = await api.get(`/news?${queryParams.toString()}`);
        return response.data;
    },

    /**
     * Get single news by ID
     */
    getNewsById: async (id) => {
        const response = await api.get(`/news/${id}`);
        return response.data;
    },

    /**
     * Create news (admin only)
     */
    createNews: async (formData) => {
        const response = await api.post('/news', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Update news (admin only)
     */
    updateNews: async (id, formData) => {
        const response = await api.put(`/news/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
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
