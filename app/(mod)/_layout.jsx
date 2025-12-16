import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ModLayout() {
    const { user, role, isLoading } = useAuth();

    // Show loading while checking auth
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    // Only allow moderators and admins
    if (!user || !['moderator', 'admin'].includes(role)) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#D32F2F',
                tabBarInactiveTintColor: '#9CA3AF',
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopColor: '#E5E7EB',
                    borderTopWidth: 1
                }
            }}
        >
            <Tabs.Screen
                name="reports"
                options={{
                    title: 'Reportes',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="document-text" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="chats"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    )
                }}
            />
            <Tabs.Screen
                name="inbox"
                options={{
                    title: 'Inbox',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    )
                }}
            />
        </Tabs>
    );
}
