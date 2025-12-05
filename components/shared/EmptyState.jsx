import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function EmptyState({
    icon = "search-outline",
    title = "No hay resultados",
    message = "Intenta ajustar tu búsqueda o filtros.",
    action
}) {
    return (
        <View className="flex-1 items-center justify-center py-12 px-6">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name={icon} size={32} color="#9E9E9E" />
            </View>
            <Text className="text-[18px] font-bold text-gray-900 text-center mb-2">
                {title}
            </Text>
            <Text className="text-[15px] text-gray-500 text-center leading-5 max-w-[250px]">
                {message}
            </Text>
            {action && (
                <View className="mt-6">
                    {action}
                </View>
            )}
        </View>
    );
}
