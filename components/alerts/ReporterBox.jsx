import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ReporterBox({ name, role, time }) {
    return (
        <View className="bg-gray-50 p-4 rounded-2xl flex-row items-center border border-gray-100">
            <View className="w-12 h-12 rounded-full bg-white items-center justify-center border border-gray-200 mr-3">
                <Ionicons name="person" size={24} color="#BDBDBD" />
            </View>
            <View className="flex-1">
                <Text className="text-[15px] font-bold text-gray-900">
                    {name}
                </Text>
                <Text className="text-[13px] text-gray-500">
                    {role} • {time}
                </Text>
            </View>
            <TouchableOpacity className="bg-white p-2 rounded-full border border-gray-200">
                <Ionicons name="chatbubble-outline" size={20} color="#757575" />
            </TouchableOpacity>
        </View>
    );
}
