import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PageHeader({
    title,
    subtitle,
    showBack = false,
    rightIcon,
    rightIconColor = '#1A1A1A',
    rightIconBg = 'bg-gray-50',
    onRightPress,
    rightActions = [], // Array of { icon, onPress, color, bg, badge }
    compact = false,
}) {
    const insets = useSafeAreaInsets();

    // Combine single rightIcon prop with rightActions for backward compatibility
    const allActions = rightIcon
        ? [{ icon: rightIcon, onPress: onRightPress, color: rightIconColor, bg: rightIconBg }, ...rightActions]
        : rightActions;

    return (
        <View
            className="bg-white border-b border-gray-100"
            style={{ paddingTop: insets.top + 8, paddingBottom: compact ? 12 : 16, paddingHorizontal: 20 }}
        >
            <View className="flex-row items-center justify-between">
                {/* Left side: Back button + Title */}
                <View className="flex-row items-center flex-1">
                    {showBack && (
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="mr-3 w-9 h-9 items-center justify-center rounded-full bg-gray-50"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                        </TouchableOpacity>
                    )}
                    <View className="flex-1">
                        <Text
                            className={`font-bold text-gray-900 tracking-tight ${compact ? 'text-[20px]' : 'text-[26px]'}`}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {subtitle && (
                            <Text className="text-[13px] text-gray-500 font-medium mt-0.5" numberOfLines={1}>
                                {subtitle}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Right side: Action buttons */}
                {allActions.length > 0 && (
                    <View className="flex-row items-center ml-3">
                        {allActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={action.onPress}
                                className={`w-10 h-10 items-center justify-center rounded-full ${action.bg || 'bg-gray-50'} ${index > 0 ? 'ml-2' : ''}`}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={action.icon}
                                    size={20}
                                    color={action.color || '#1A1A1A'}
                                />
                                {/* Badge indicator */}
                                {action.badge && action.badge > 0 && (
                                    <View className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full items-center justify-center px-1">
                                        <Text className="text-white text-[10px] font-bold">
                                            {action.badge > 99 ? '99+' : action.badge}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

