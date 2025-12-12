import api from './api';

const notificationService = {
    /**
     * Get user's notifications
     * @param {object} params - Query parameters (page, limit)
     */
    async getNotifications(params = {}) {
        const response = await api.get('/notifications', { params });
        return response;
    },

    /**
     * Get unread notifications count
     */
    async getUnreadCount() {
        const response = await api.get('/notifications/unread-count');
        return response.data?.count || 0;
    },

    /**
     * Mark a notification as read
     * @param {string} notificationId - Notification ID
     */
    async markAsRead(notificationId) {
        const response = await api.put(`/notifications/${notificationId}/read`);
        return response;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        const response = await api.put('/notifications/read-all');
        return response;
    },

    /**
     * Delete a notification
     * @param {string} notificationId - Notification ID
     */
    async deleteNotification(notificationId) {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response;
    },

    /**
     * Delete all notifications
     */
    async deleteAllNotifications() {
        const response = await api.delete('/notifications');
        return response;
    },

    /**
     * Update push notification token
     * @param {string} token - Expo push token
     */
    async updatePushToken(token) {
        const response = await api.put('/auth/push-token', { token });
        return response;
    }
};

export default notificationService;
