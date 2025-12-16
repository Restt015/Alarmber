import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white border-b border-gray-100"
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

                {/* Right side - Status indicator */}
                <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-full">
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <Text className="text-green-700 text-[11px] font-semibold">En línea</Text>
                </View>
            </View>
        </View>
    );
}
