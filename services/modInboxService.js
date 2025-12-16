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
    async markResolved(id) {
        const response = await api.patch(`/mod/inbox/${id}/resolve`);
        return response;
    }

    // Bulk update
    async bulkUpdate(ids, status) {
        const response = await api.patch('/mod/inbox/bulk', { ids, status });
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
