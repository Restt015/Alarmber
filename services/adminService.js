import api from './api';

const adminService = {
    // Get dashboard statistics
    async getDashboardStats() {
        try {
            const response = await api.get('/admin/dashboard/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all reports with filters
    async getAllReports(params = {}) {
        try {
            const response = await api.get('/admin/reports', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Validate a report
    async validateReport(reportId, notes = '') {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/validate`, { notes });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Assign report to user
    async assignReport(reportId, userId) {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/assign`, { userId });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get user statistics
    async getUserStats() {
        try {
            const response = await api.get('/admin/users/stats');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all users
    async getAllUsers(params = {}) {
        try {
            const response = await api.get('/admin/users', { params });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Get finished reports (closed/resolved)
    async getFinishedReports(params = {}) {
        try {
            const response = await api.get('/admin/reports', {
                params: { ...params, status: 'closed,resolved' }
            });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Update report status
    async updateReportStatus(reportId, status) {
        try {
            const response = await api.patch(`/admin/reports/${reportId}/status`, { status });
            return response;
        } catch (error) {
            throw error;
        }
    },

    // Delete report (admin)
    async deleteReport(reportId) {
        try {
            const response = await api.delete(`/reports/${reportId}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
};

export default adminService;
