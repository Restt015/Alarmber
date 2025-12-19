import api from './api';

export const getActiveChats = async () => {
    const response = await api.get('/mod/chats/active');
    return response;
};

export const markChatRead = async (reportId) => {
    const response = await api.patch(`/mod/chats/${reportId}/read`);
    return response;
};

export default { getActiveChats, markChatRead };
