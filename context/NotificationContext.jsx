import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
    const { isAuthenticated, user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Fetch notifications when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications(1, true);
            fetchUnreadCount();
        } else {
            // Clear notifications when logged out
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated]);

    const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
        if (!isAuthenticated) return;

        try {
            if (reset) {
                setLoading(true);
            }

            const response = await notificationService.getNotifications({
                page: pageNum,
                limit: 20
            });

            const newNotifications = response.data || [];
            const pagination = response.pagination || { pages: 1 };

            if (reset) {
                setNotifications(newNotifications);
            } else {
                setNotifications(prev => [...prev, ...newNotifications]);
            }

            setHasMore(pageNum < pagination.pages);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = useCallback(async () => {
        if (!isAuthenticated) return;

        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, [isAuthenticated]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications(prev =>
                prev.map(n =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                )
            );

            // Decrease unread count
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);

            // Remove from local state
            setNotifications(prev =>
                prev.filter(n => n._id !== notificationId)
            );

            // Update unread count if it was unread
            const notification = notifications.find(n => n._id === notificationId);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }, [notifications]);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchNotifications(1, true),
            fetchUnreadCount()
        ]);
    }, [fetchNotifications, fetchUnreadCount]);

    const loadMore = useCallback(async () => {
        if (!loading && hasMore) {
            await fetchNotifications(page + 1, false);
        }
    }, [loading, hasMore, page, fetchNotifications]);

    // Add a new notification to the list (for internal use)
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    }, []);

    const value = {
        notifications,
        unreadCount,
        loading,
        refreshing,
        hasMore,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
        loadMore,
        addNotification
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export default NotificationContext;
