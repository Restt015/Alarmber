import api from './api';

class ModInboxService {
    constructor() {
        this.listeners = new Set();
    }

    // Fetch inbox notifications
    async getInbox({ tab = 'pending', status, priority, q, page = 1, limit = 20 }) {
        const params = new URLSearchParams();
        params.append('tab', tab);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (q) params.append('q', q);
        params.append('page', page);
        params.append('limit', limit);

        const response = await api.get(`/mod/inbox?${params.toString()}`);
        return response;
    }

    // Get stats
    async getStats() {
        const response = await api.get('/mod/inbox/stats');
        return response;
    }

    // Mark as read
    async markRead(id) {
        const response = await api.patch(`/mod/inbox/${id}/read`);
        return response;
    }

    // Mark as resolved
    async markResolved(id, resolutionNote = '') {
        const response = await api.post(`/mod/inbox/${id}/resolve`, { resolutionNote });
        return response;
    }

    // Bulk update
    async bulkUpdate(ids, status) {
        const response = await api.patch('/mod/inbox/bulk', { ids, status });
        return response;
    }

    // Moderation actions
    async warnUser(userId, reportId, template, customReason, meta, notificationId) {
        const response = await api.post('/mod/actions/warn', {
            userId,
            reportId,
            template,
            customReason,
            meta,
            notificationId
        });
        return response;
    }

    async muteUser(userId, durationSeconds, reason, reportId, notificationId) {
        const response = await api.post('/mod/actions/mute', {
            userId,
            durationSeconds,
            reason,
            reportId,
            notificationId
        });
        return response;
    }

    async banUser(userId, durationSeconds, reason, reportId, notificationId) {
        const response = await api.post('/mod/actions/ban', {
            userId,
            durationSeconds,
            reason,
            reportId,
            notificationId
        });
        return response;
    }

    async deleteMessages(reportId, messageIds, reason, notificationId) {
        const response = await api.post('/mod/actions/delete-messages', {
            reportId,
            messageIds,
            reason,
            notificationId
        });
        return response;
    }

    async setSlowmode(reportId, seconds, reason, notificationId) {
        const response = await api.post('/mod/actions/slowmode', {
            reportId,
            seconds,
            reason,
            notificationId
        });
        return response;
    }

    // Spam cleanup with action modes
    async spamCleanup(notificationId, actionMode) {
        const response = await api.post('/mod/actions/spam/cleanup', {
            notificationId,
            actionMode
        });
        return response;
    }

    // Subscribe to realtime updates
    subscribe(callback) {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }

    notifyListeners(event) {
        this.listeners.forEach(callback => callback(event));
    }

    // Called from chatService when mod events are received
    handleModEvent(event) {
        this.notifyListeners(event);
    }
}

export default new ModInboxService();
