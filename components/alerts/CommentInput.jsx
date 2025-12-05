import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CommentInput() {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-white border-t border-gray-100 shadow-sm"
            style={{ paddingBottom: Math.max(insets.bottom, 20), paddingTop: 12, paddingHorizontal: 16 }}
        >
            <View className="flex-row items-end">
                <View className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-200 mr-3 min-h-[50px]">
                    <TextInput
                        placeholder="Escribe información relevante..."
                        placeholderTextColor="#9E9E9E"
                        className="flex-1 text-[16px] text-gray-900 leading-5"
                        multiline
                        style={{ maxHeight: 100, padding: 0 }}
                    />
                </View>
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="w-12 h-12 rounded-full bg-red-600 items-center justify-center shadow-md mb-0.5"
                >
                    <Ionicons name="send" size={22} color="white" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}
