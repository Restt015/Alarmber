import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PageHeader({
    title,
    showBack = false,
    rightIcon,
    onRightPress,
    subtitle
}) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white border-b border-gray-100 px-5 pb-4"
            style={{ paddingTop: insets.top }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3 w-8 h-8 items-center justify-center rounded-full bg-gray-50"
                        >
                            <Ionicons name="arrow-back" size={20} color="#1A1A1A" />
                        </TouchableOpacity>
                    )}
                    <View>
                        <Text className="text-[22px] font-bold text-gray-900 tracking-tight">
                            {title}
                        </Text>
                        {subtitle && (
                            <Text className="text-[13px] text-gray-500 font-medium mt-0.5">
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightPress}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                    >
                        <Ionicons name={rightIcon} size={20} color="#1A1A1A" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
