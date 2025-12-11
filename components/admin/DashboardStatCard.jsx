import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function DashboardStatCard({ icon, title, count, subtitle, color, onPress, badge }) {
    const getBackgroundColor = () => {
        // Convert hex to rgba with 10% opacity
        return `${color}15`;
    };

    const getBadgeColor = () => {
        switch (badge?.type) {
            case 'success':
                return { bg: '#4CAF5015', text: '#4CAF50' };
            case 'warning':
                return { bg: '#FBC02D15', text: '#FBC02D' };
            case 'error':
                return { bg: '#D32F2F15', text: '#D32F2F' };
            default:
                return { bg: `${color}15`, text: color };
        }
    };

    const badgeColors = getBadgeColor();

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 shadow-sm"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4
            }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: getBackgroundColor() }}
                >
                    <Ionicons name={icon} size={24} color={color} />
                </View>

                <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
            </View>

            {/* Title */}
            <Text className="text-[16px] font-bold text-gray-900 mb-1">
                {title}
            </Text>

            {/* Count */}
            <Text
                className="text-[36px] font-black leading-none mb-2"
                style={{ color }}
            >
                {count}
            </Text>

            {/* Subtitle or Badge */}
            {badge ? (
                <View
                    className="self-start px-2 py-1 rounded-md"
                    style={{ backgroundColor: badgeColors.bg }}
                >
                    <Text
                        className="text-[11px] font-bold"
                        style={{ color: badgeColors.text }}
                    >
                        {badge.text}
                    </Text>
                </View>
            ) : subtitle ? (
                <Text className="text-[13px] text-gray-500">
                    {subtitle}
                </Text>
            ) : null}
        </TouchableOpacity>
    );
}
