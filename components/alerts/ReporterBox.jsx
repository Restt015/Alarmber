import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const RELATIONSHIP_LABELS = {
    family: 'Familiar',
    friend: 'Amigo/a',
    partner: 'Pareja',
    neighbor: 'Vecino/a',
    coworker: 'Colega',
    other: 'Conocido'
};

export default function ReporterBox({ name, profileImage, relationship, time, activityStatus, isOwner = false }) {
    const relationshipLabel = RELATIONSHIP_LABELS[relationship] || 'Reportero';

    return (
        <View
            className={`p-4 rounded-2xl flex-row items-center border ${isOwner
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
        >
            {/* Avatar - Show photo if available, otherwise show icon */}
            <View
                className={`w-12 h-12 rounded-full items-center justify-center overflow-hidden border mr-3 ${isOwner
                        ? 'bg-blue-100 border-blue-300'
                        : 'bg-white border-gray-200'
                    }`}
            >
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        className="w-12 h-12"
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons
                        name={isOwner ? "person-circle" : "person"}
                        size={24}
                        color={isOwner ? "#1976D2" : "#BDBDBD"}
                    />
                )}
            </View>

            {/* Name, relationship and activity status */}
            <View className="flex-1">
                <Text className={`text-[15px] font-bold ${isOwner ? 'text-blue-900' : 'text-gray-900'}`}>
                    {isOwner ? 'Creado por ti' : name}
                </Text>
                <Text className={`text-[13px] ${isOwner ? 'text-blue-600' : 'text-gray-500'}`}>
                    {relationshipLabel} • {time}
                </Text>
                {/* Activity Status - Only show for other users, using backend calculation */}
                {!isOwner && activityStatus && (
                    <View className="flex-row items-center mt-1">
                        <View
                            className={`w-2 h-2 rounded-full mr-1.5 ${activityStatus.isOnline ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                        />
                        <Text className="text-[11px] text-gray-400 font-medium">
                            {activityStatus.label}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action buttons */}
            {!isOwner && (
                <TouchableOpacity className="bg-white p-2 rounded-full border border-gray-200">
                    <Ionicons name="chatbubble-outline" size={20} color="#757575" />
                </TouchableOpacity>
            )}
            {isOwner && (
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-700 text-[11px] font-bold">Tu reporte</Text>
                </View>
            )}
        </View>
    );
}
