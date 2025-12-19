import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotifications } from '../../context/NotificationContext';
import NotificationsDropdown from '../notifications/NotificationsDropdown';

export default function HomeHeader() {
    const insets = useSafeAreaInsets();
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const { unreadCount = 0 } = useNotifications() || {};

    return (
        <View
            className="bg-white border-b border-gray-100 z-50"
            style={{ paddingTop: insets.top + 12, paddingBottom: 16, paddingHorizontal: 20 }}
        >
            <View className="flex-row justify-between items-center">
                {/* Logo / Brand */}
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-red-600 rounded-xl items-center justify-center mr-3">
                        <Ionicons name="alert" size={22} color="white" />
                    </View>
                    <View>
                        <Text className="text-[22px] font-black text-gray-900 tracking-tight">
                            ALARMBER
                        </Text>
                        <Text className="text-[11px] text-gray-400 font-medium -mt-0.5">
                            Red de búsqueda
                        </Text>
                    </View>
                </View>

                {/* Right side - Notifications & Status */}
                <View className="flex-row items-center">

                    {/* Status indicator */}
                    <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full mr-3">
                        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                        <Text className="text-green-700 text-[11px] font-semibold">En línea</Text>
                    </View>

                    {/* Bell Icon */}
                    <TouchableOpacity
                        onPress={() => setDropdownVisible(true)}
                        className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 active:bg-gray-100"
                    >
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                        {unreadCount > 0 && (
                            <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border border-white" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Notifications Dropdown */}
            <NotificationsDropdown
                visible={dropdownVisible}
                onClose={() => setDropdownVisible(false)}
            />
        </View>
    );
}
