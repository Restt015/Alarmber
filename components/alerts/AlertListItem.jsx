import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function AlertListItem({ alert, onPress }) {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'urgente':
                return '#D32F2F';
            case 'en búsqueda':
                return '#FBC02D';
            case 'reciente':
                return '#1976D2';
            default:
                return '#757575';
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="bg-white rounded-xl border border-gray-100 p-3 mb-3 flex-row items-center"
        >
            {/* Photo */}
            <Image
                source={{ uri: alert.photo }}
                className="w-14 h-14 rounded-lg bg-gray-200"
                resizeMode="cover"
            />

            {/* Info */}
            <View className="flex-1 ml-3">
                <View className="flex-row items-center mb-1">
                    <Text className="text-[15px] font-bold text-gray-900 flex-1" numberOfLines={1}>
                        {alert.name}, {alert.age} años
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={12} color="#9E9E9E" />
                    <Text className="text-[12px] text-gray-500 ml-1 flex-1" numberOfLines={1}>
                        {alert.lastSeen}
                    </Text>
                </View>

                <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={12} color="#9E9E9E" />
                    <Text className="text-[11px] text-gray-400 ml-1">
                        {alert.date}
                    </Text>
                </View>
            </View>

            {/* Status Badge */}
            <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: `${getStatusColor(alert.status)}15` }}
            >
                <Text
                    className="text-[10px] font-bold"
                    style={{ color: getStatusColor(alert.status) }}
                >
                    {alert.status}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
