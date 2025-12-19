import api from './api';

export const getModReports = async (filters = {}) => {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });

    const response = await api.get(`/mod/reports?${params.toString()}`);
    return response;
};

export default { getModReports };
