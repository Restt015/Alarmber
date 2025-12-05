import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function InfoRow({ icon, label, value, isLast }) {
    return (
        <View className={`flex-row py-4 ${!isLast ? 'border-b border-gray-100' : ''}`}>
            <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-4">
                <Ionicons name={icon} size={20} color="#757575" />
            </View>
            <View className="flex-1 justify-center">
                <Text className="text-gray-500 text-[12px] uppercase tracking-wide font-medium mb-0.5">
                    {label}
                </Text>
                <Text className="text-gray-900 text-[16px] font-semibold">
                    {value}
                </Text>
            </View>
        </View>
    );
}
