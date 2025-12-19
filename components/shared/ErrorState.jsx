import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

/**
 * ErrorState - Visual error state component for screens
 * Displays an error message with optional retry button
 * 
 * @param {string} title - Error title
 * @param {string} message - Error description
 * @param {string} icon - Ionicons name (default: 'alert-circle-outline')
 * @param {function} onRetry - Callback for retry button
 * @param {string} retryText - Text for retry button (default: 'Reintentar')
 */
export default function ErrorState({
    title = 'Error',
    message = 'Ocurrió un error inesperado',
    icon = 'alert-circle-outline',
    onRetry,
    retryText = 'Reintentar',
}) {
    return (
        <View className="flex-1 items-center justify-center px-8 py-10">
            <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
                <Ionicons name={icon} size={48} color="#D32F2F" />
            </View>

            <Text className="text-gray-900 text-[20px] font-bold mb-3 text-center">
                {title}
            </Text>

            <Text className="text-gray-600 text-[15px] text-center leading-6 mb-6">
                {message}
            </Text>

            {onRetry && (
                <TouchableOpacity
                    onPress={onRetry}
                    activeOpacity={0.8}
                    className="bg-red-600 px-8 py-3 rounded-xl"
                    style={{
                        shadowColor: '#D32F2F',
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                    }}
                >
                    <Text className="text-white font-bold text-[15px]">
                        {retryText}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
