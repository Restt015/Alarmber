import api from './api';

const reportService = {
    // Create a new report
    async createReport(reportData) {
        try {
            const formData = new FormData();

            // Append text fields
            formData.append('name', reportData.name);
            formData.append('age', reportData.age);
            formData.append('lastLocation', reportData.lastLocation);
            formData.append('description', reportData.description);
            formData.append('clothing', reportData.clothing);
            if (reportData.circumstances) {
                formData.append('circumstances', reportData.circumstances);
            }

            // Append photo if exists
            if (reportData.photo) {
                const uriParts = reportData.photo.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('photo', {
                    uri: reportData.photo,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`
                });
            }

            const response = await api.post('/reports', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get all reports (validated only)
    async getReports(params = {}) {
        try {
            const response = await api.get('/reports', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get recent reports for home screen
    async getRecentReports(limit = 5) {
        try {
            const response = await api.get('/reports/recent', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get single report by ID
    async getReportById(id) {
        try {
            const response = await api.get(`/reports/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get user's own reports
    async getMyReports() {
        try {
            const response = await api.get('/reports/user/my-reports');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get finished reports (closed/resolved)
    async getFinishedReports(params = {}) {
        try {
            const response = await api.get('/reports/finished', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update a report
    async updateReport(id, reportData) {
        try {
            const formData = new FormData();

            // Append text fields
            if (reportData.name) formData.append('name', reportData.name);
            if (reportData.age) formData.append('age', reportData.age);
            if (reportData.lastLocation) formData.append('lastLocation', reportData.lastLocation);
            if (reportData.description) formData.append('description', reportData.description);
            if (reportData.clothing) formData.append('clothing', reportData.clothing);
            if (reportData.circumstances) formData.append('circumstances', reportData.circumstances);
            if (reportData.contactPhone) formData.append('contactPhone', reportData.contactPhone);
            if (reportData.contactEmail) formData.append('contactEmail', reportData.contactEmail);

            // Append photo if exists
            if (reportData.photo && typeof reportData.photo === 'object') {
                const uriParts = reportData.photo.uri.split('.');
                const fileType = uriParts[uriParts.length - 1];

                formData.append('photo', {
                    uri: reportData.photo.uri,
                    name: `photo.${fileType}`,
                    type: `image/${fileType}`
                });
            }

            const response = await api.put(`/reports/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Delete a report
    async deleteReport(id) {
        try {
            const response = await api.delete(`/reports/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update report status (admin only)
    async updateReportStatus(id, status) {
        try {
            const response = await api.patch(`/reports/${id}/status`, { status });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default reportService;
