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
    }
};

export default reportService;
