import api from './api';

const moderationService = {
    // Delete message (soft delete)
    deleteMessage: async (messageId, reason) => {
        const response = await api.post(`/moderation/messages/${messageId}/delete`, { reason });
        return response;
    },

    // Mute user
    muteUser: async (userId, durationSeconds, reason) => {
        const response = await api.post(`/moderation/users/${userId}/mute`, {
            durationSeconds,
            reason
        });
        return response;
    },

    // Ban user
    banUser: async (userId, reason) => {
        const response = await api.post(`/moderation/users/${userId}/ban`, { reason });
        return response;
    },

    // Report message (for regular users)
    reportMessage: async (messageId, reportId, reason, description = '') => {
        const response = await api.post(`/moderation/messages/${messageId}/report`, {
            reportId,
            reason,
            description
        });
        return response;
    },

    // Update chat status
    updateChatStatus: async (reportId, chatStatus, slowmodeSeconds = 0) => {
        const response = await api.patch(`/moderation/reports/${reportId}/chat-status`, {
            chatStatus,
            slowmodeSeconds
        });
        return response;
    }
};

export default moderationService;
