import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader({
    title,
    showLocation = false,
    showBack = false,
    showAction = false,
    actionIcon = "ellipsis-horizontal",
    onActionPress
}) {
    const insets = useSafeAreaInsets();

    // Hide on web if requested (preserving previous logic if needed, but usually headers are good on web too)
    // For now, we'll keep it visible as it's a core nav element.

    return (
        <View
            className="flex-row justify-between items-center px-4 py-2 bg-white border-b border-gray-100"
            style={{ paddingTop: insets.top, paddingBottom: 12 }}
        >
            {/* LEFT SECTION */}
            <View className="flex-row items-center flex-1">
                {showBack && (
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                )}

                {showLocation ? (
                    <View className="flex-row items-center">
                        <Text className="text-[28px] font-black text-gray-900 tracking-tighter">
                            Amber<Text className="text-red-600">.</Text>
                        </Text>
                    </View>
                ) : (
                    <Text className="text-[20px] font-bold text-gray-900">{title}</Text>
                )}
            </View>

            {/* RIGHT SECTION */}
            <View className="flex-row items-center">
                {showAction && (
                    <TouchableOpacity onPress={onActionPress} className="mr-4">
                        <Ionicons name={actionIcon} size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                )}

                {/* Profile Icon (Always visible on Home/Location mode, or configurable) */}
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                    <View className="w-9 h-9 bg-gray-200 rounded-full items-center justify-center overflow-hidden">
                        <Ionicons name="person" size={20} color="#757575" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
