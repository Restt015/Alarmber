import { Redirect, Stack } from 'expo-router';
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
        <Stack>
            <Stack.Screen
                name="inbox"
                options={{
                    title: 'Moderación',
                    headerShown: true
                }}
            />
        </Stack>
    );
}
