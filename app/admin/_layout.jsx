import { Stack } from 'expo-router';

export default function AdminLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#FFFFFF' },
                gestureEnabled: false, // Disable swipe gestures
                animation: 'none' // No animation for better isolation
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
