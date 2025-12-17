import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function EmptyState({ icon = "document-text-outline", message, size = 64 }) {
    return (
        <View className="flex-1 items-center justify-center py-20">
            <Ionicons name={icon} size={size} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center px-4">
                {message}
            </Text>
        </View>
    );
}
