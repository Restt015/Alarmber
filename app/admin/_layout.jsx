import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Loader from '../../components/shared/Loader';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
    const { user, isAuthenticated, loading } = useAuth();

    // Guard: redirect non-admin users to login
    useEffect(() => {
        if (!loading) {
            if (!isAuthenticated || !user) {
                // Not authenticated - go to login
                router.replace('/auth/login');
            } else if (user.role !== 'admin') {
                // Authenticated but not admin - go to home
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

    // Don't render admin content if not authenticated or not admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
        return null;
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                gestureEnabled: false,
                animation: 'none'
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                    gestureEnabled: false
                }}
            />
        </Stack>
    );
}

