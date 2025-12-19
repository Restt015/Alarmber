import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function StatCard({ icon, label, count, color, onPress, badge }) {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="flex-1 bg-white rounded-2xl border border-gray-100 p-5 mx-1 shadow-sm"
        >
            {/* Icon */}
            <View className="flex-row items-center justify-between mb-3">
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${color}15` }}
                >
                    <Ionicons name={icon} size={24} color={color} />
                </View>

                {badge && (
                    <View className="bg-red-100 px-2 py-1 rounded-full">
                        <Text className="text-red-600 text-[10px] font-bold">{badge}</Text>
                    </View>
                )}
            </View>

            {/* Count */}
            <Text className="text-[32px] font-black text-gray-900 leading-none mb-1">
                {count}
            </Text>

            {/* Label */}
            <Text className="text-[13px] font-medium text-gray-600">
                {label}
            </Text>
        </TouchableOpacity>
    );
}
