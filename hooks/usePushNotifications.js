import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import notificationService from '../services/notificationService';

// Configure notification handler for foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function usePushNotifications() {
    const { isAuthenticated, user } = useAuth();
    const { addNotification, fetchUnreadCount } = useNotifications();
    const [expoPushToken, setExpoPushToken] = useState(null);
    const [notification, setNotification] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        // Register for push notifications when authenticated
        if (isAuthenticated) {
            registerForPushNotifications();
        }

        // Listen for incoming notifications (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('📬 Notification received in foreground:', notification);
                setNotification(notification);

                // Add to local state and refresh count
                const data = notification.request.content.data;
                if (data) {
                    addNotification({
                        _id: data.notificationId,
                        type: data.type,
                        title: notification.request.content.title,
                        message: notification.request.content.body,
                        reportId: data.reportId ? { _id: data.reportId } : null,
                        isRead: false,
                        createdAt: new Date().toISOString()
                    });
                }
            }
        );

        // Listen for notification taps (background/killed)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('👆 Notification tapped:', response);
                handleNotificationTap(response.notification);
            }
        );

        return () => {
            notificationListener.current && notificationListener.current.remove();
            responseListener.current && responseListener.current.remove();
        };
    }, [isAuthenticated]);

    const registerForPushNotifications = async () => {
        try {
            // Check if it's a physical device
            if (!Device.isDevice) {
                console.log('⚠️ Push notifications require a physical device');
                return null;
            }

            // Check existing permissions
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not granted
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('❌ Push notification permission denied');
                return null;
            }

            // Get project ID from Constants or environment
            const projectId = Constants.expoConfig?.extra?.eas?.projectId
                || Constants.easConfig?.projectId
                || process.env.EXPO_PUBLIC_PROJECT_ID;

            // If no projectId, push notifications won't work in bare workflow
            // but in-app notifications will still work
            if (!projectId) {
                console.log('⚠️ No Expo projectId found - Push notifications disabled');
                console.log('   In-app notifications will still work normally');
                return null;
            }

            // Get Expo push token
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId
            });

            const token = tokenData.data;
            console.log('📱 Expo push token:', token);
            setExpoPushToken(token);

            // Send token to backend
            if (token) {
                await notificationService.updatePushToken(token);
                console.log('✅ Push token saved to backend');
            }

            // Configure Android notification channel
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#D32F2F',
                });
            }

            return token;
        } catch (error) {
            console.log('⚠️ Push notifications not available:', error.message);
            console.log('   In-app notifications will still work normally');
            return null;
        }
    };

    const handleNotificationTap = (notification) => {
        const data = notification.request.content.data;

        // Navigate to report detail if reportId is present
        if (data?.reportId) {
            router.push(`/alert/${data.reportId}`);
        } else {
            // Navigate to notifications tab
            router.push('/(tabs)/notifications');
        }

        // Refresh unread count
        fetchUnreadCount();
    };

    // Clear the current notification after it's been displayed
    const clearNotification = () => {
        setNotification(null);
    };

    return {
        expoPushToken,
        notification,
        clearNotification,
        registerForPushNotifications
    };
}
