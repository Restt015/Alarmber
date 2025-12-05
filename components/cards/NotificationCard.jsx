import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function NotificationCard({ notification, onPress }) {
    const isUnread = !notification.read;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className={`flex-row p-4 border-b border-gray-100 ${isUnread ? 'bg-red-50/30' : 'bg-white'}`}
        >
            <View
                className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isUnread ? 'bg-red-100' : 'bg-gray-100'
                    }`}
            >
                <Ionicons
                    name={notification.icon || "notifications"}
                    size={20}
                    color={isUnread ? "#D32F2F" : "#757575"}
                />
            </View>

            <View className="flex-1">
                <View className="flex-row justify-between items-start mb-1">
                    <Text className={`text-[15px] flex-1 mr-2 ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                        {notification.title}
                    </Text>
                    <Text className="text-[11px] text-gray-400 mt-0.5">
                        {notification.time}
                    </Text>
                </View>
                <Text
                    className="text-[13px] text-gray-500 leading-5"
                    numberOfLines={2}
                >
                    {notification.message}
                </Text>
            </View>

            {isUnread && (
                <View className="w-2 h-2 rounded-full bg-red-600 absolute top-5 right-4" />
            )}
        </TouchableOpacity>
    );
}
