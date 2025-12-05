import { Ionicons } from '@expo/vector-icons';
import { Linking, Text, TouchableOpacity, View } from 'react-native';

export default function ContactCard({ title, description, phone, icon, color = "#D32F2F" }) {
    const handleCall = () => {
        Linking.openURL(`tel:${phone}`);
    };

    return (
        <TouchableOpacity
            onPress={handleCall}
            activeOpacity={0.8}
            className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-4 shadow-sm"
        >
            <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: `${color}15` }}
            >
                <Ionicons name={icon} size={24} color={color} />
            </View>

            <View className="flex-1">
                <Text className="text-[16px] font-bold text-gray-900 mb-0.5">
                    {title}
                </Text>
                <Text className="text-[13px] text-gray-500 leading-4 mb-1">
                    {description}
                </Text>
                <Text className="text-[14px] font-bold" style={{ color: color }}>
                    {phone}
                </Text>
            </View>

            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                <Ionicons name="call" size={20} color="#757575" />
            </View>
        </TouchableOpacity>
    );
}
