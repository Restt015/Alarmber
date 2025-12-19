import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Configure notification handler for foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export default function usePushNotifications() {
    const { isAuthenticated } = useAuth();
    const [expoPushToken, setExpoPushToken] = useState(null);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        let isMounted = true;

        const registerAndListen = async () => {
            if (isAuthenticated) {
                const token = await registerForPushNotifications();
                if (isMounted) setExpoPushToken(token);
            }
        };

        registerAndListen();

        // Listen for incoming notifications (foreground)
        notificationListener.current = Notifications.addNotificationReceivedListener(
            (notification) => {
                console.log('📬 Notification received in foreground:', notification);
                // Do nothing - let OS handle it
                // Notification Center will refresh when user navigates to it
            }
        );

        // Listen for notification taps (background/killed -> open app)
        responseListener.current = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                console.log('👆 Notification tapped:', response);
                const notification = response.notification;
                handleNotificationTap(notification);
            }
        );

        return () => {
            isMounted = false;
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isAuthenticated]);

    const registerForPushNotifications = async () => {
        try {
            if (!Device.isDevice) {
                console.log('⚠️ Push notifications require a physical device');
                return null;
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('❌ Push notification permission denied');
                return null;
            }

            // Get project ID
            const projectId = Constants.expoConfig?.extra?.eas?.projectId
                || Constants.easConfig?.projectId
                || process.env.EXPO_PUBLIC_PROJECT_ID;

            if (!projectId) {
                console.log('⚠️ No Expo projectId found');
                return null;
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId
            });

            const token = tokenData.data;
            console.log('📱 Expo push token:', token);

            // Send token to backend
            if (token) {
                await api.post('/users/push-token', {
                    token: token,
                    platform: Platform.OS
                });
                console.log('✅ Push token saved to backend');
            }

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
            console.log('⚠️ Error registering for push notifications:', error);
            return null;
        }
    };

    const handleNotificationTap = (notification) => {
        const data = notification.request.content.data;
        console.log('🎯 Handling notification tap with data:', data);

        // Navigate to report detail if reportId is present
        if (data?.reportId) {
            const reportId = typeof data.reportId === 'object' ? data.reportId._id : data.reportId;
            router.push(`/alert/${reportId}`);
        } else {
            router.push('/(tabs)/notifications');
        }

        // Do NOT sync data - let the screen handle its own data fetching
    };

    return {
        expoPushToken
    };
}
