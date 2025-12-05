import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeHeader() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="flex-row justify-between items-center px-5 py-3 bg-white border-b border-gray-100"
            style={{ paddingTop: insets.top + 5, paddingBottom: 15 }}
        >
            <View className="flex-row items-center">
                <Text className="text-[28px] font-black text-gray-900 tracking-tighter">
                    Amber<Text className="text-red-600">.</Text>
                </Text>
            </View>

            <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center border border-gray-200">
                    <Ionicons name="person" size={20} color="#757575" />
                </View>
            </TouchableOpacity>
        </View>
    );
}
