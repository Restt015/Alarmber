import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import StatusBadge from '../shared/StatusBadge';

export default function AlertCard({ alert }) {
    return (
        <TouchableOpacity
            onPress={() => router.push(`/alert/${alert.id}`)}
            activeOpacity={0.9}
            className="mx-5 mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8
            }}
        >
            <View className="flex-row p-3 items-center">
                {/* IMAGE */}
                <Image
                    source={{ uri: alert.photo }}
                    className="w-[90px] h-[90px] rounded-xl bg-gray-100"
                />

                <View className="flex-1 ml-4 justify-between">
                    {/* TOP AREA */}
                    <View className="flex-row justify-between items-start">
                        <Text
                            className="text-[17px] font-semibold text-gray-900 flex-1 mr-2"
                            numberOfLines={1}
                        >
                            {alert.name}
                        </Text>
                        <StatusBadge status={alert.status} />
                    </View>

                    {/* AGE */}
                    <Text className="text-sm text-gray-500 mt-1">
                        Edad: {alert.age} años
                    </Text>

                    {/* LOCATION */}
                    <View className="flex-row items-center mt-1">
                        <Ionicons name="location-outline" size={15} color="#757575" />
                        <Text
                            className="text-xs text-gray-500 ml-1 flex-1"
                            numberOfLines={1}
                        >
                            {alert.lastSeen}
                        </Text>
                    </View>

                    {/* DATE */}
                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-xs text-gray-400 font-medium">
                            {alert.date}
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
