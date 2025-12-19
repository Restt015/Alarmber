import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

export default function SocialButtons() {
    return (
        <View className="mt-8 w-full">
            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-white/20" />
                <Text className="mx-4 text-white/60 text-[13px] font-medium">
                    O continúa con
                </Text>
                <View className="flex-1 h-[1px] bg-white/20" />
            </View>

            <View className="flex-row justify-between gap-4">
                <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-gray-50 py-3.5 rounded-xl border border-gray-200">
                    <Ionicons name="logo-google" size={20} color="#DB4437" />
                    <Text className="ml-2 font-bold text-gray-700">Google</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-gray-50 py-3.5 rounded-xl border border-gray-200">
                    <Ionicons name="logo-apple" size={20} color="#000000" />
                    <Text className="ml-2 font-bold text-gray-700">Apple</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
