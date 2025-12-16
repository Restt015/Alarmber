import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Loader from '../../components/shared/Loader';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { user, isAuthenticated, loading } = useAuth();

    // Guard: redirect non-admin users
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !user) {
                router.replace('/auth/login');
            } else if (user.role !== 'admin') {
                router.replace('/');
            }
        }
    }, [loading, isAuthenticated, user]);

    // Show loading while checking auth
    if (loading) {
        return (
            <View className="flex-1 bg-white">
                <Loader fullScreen message="Verificando permisos..." />
            </View>
        );
    }

    // Don't render if not authenticated or not admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F5F5F5' },
                gestureEnabled: true, // Allow gestures by default for subpages
                animation: 'slide_from_right',
            }}
        >
            {/* Dashboard - NO swipe back (prevents going to login) */}
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    gestureEnabled: false // Dashboard cannot swipe back
                }}
            />

            {/* Validation Queue - Can swipe back to dashboard */}
            <Stack.Screen
                name="validation"
                options={{ headerShown: false, gestureEnabled: true }}
            />

            {/* Reports - Parent screens can swipe back to dashboard */}
            <Stack.Screen
                name="reports/index"
                options={{ headerShown: false, gestureEnabled: true }}
            />
            <Stack.Screen
                name="reports/finished"
                options={{ headerShown: false, gestureEnabled: true }}
            />
            <Stack.Screen
                name="reports/[id]"
                options={{ headerShown: false, gestureEnabled: true }}
            />

            {/* Users - Can swipe back */}
            <Stack.Screen
                name="users/index"
                options={{ headerShown: false, gestureEnabled: true }}
            />
            <Stack.Screen
                name="users/[id]"
                options={{ headerShown: false, gestureEnabled: true }}
            />

            {/* News - Can swipe back */}
            <Stack.Screen
                name="news/index"
                options={{ headerShown: false, gestureEnabled: true }}
            />
            <Stack.Screen
                name="news/create"
                options={{ headerShown: false, gestureEnabled: true }}
            />
            <Stack.Screen
                name="news/[id]"
                options={{ headerShown: false, gestureEnabled: true }}
            />
        </Stack>
    );
}
