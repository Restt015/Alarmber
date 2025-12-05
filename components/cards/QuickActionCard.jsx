import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function QuickActionCard({ title, icon, color, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="w-[48%] bg-white rounded-2xl border border-gray-100 px-5 py-6 mb-4 items-center shadow-sm"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8
            }}
        >
            <View
                className="w-14 h-14 rounded-full items-center justify-center mb-3"
                style={{ backgroundColor: `${color}20` }}
            >
                <Ionicons name={icon} size={28} color={color} />
            </View>

            <Text className="text-[15px] font-bold text-gray-900 text-center tracking-tight">
                {title}
            </Text>
        </TouchableOpacity>
    );
}
