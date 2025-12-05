import { Ionicons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchBar({
    placeholder = "Buscar...",
    value,
    onChangeText,
    onClear
}) {
    return (
        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 mb-4">
            <Ionicons name="search-outline" size={20} color="#9E9E9E" />
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="#9E9E9E"
                value={value}
                onChangeText={onChangeText}
                className="flex-1 ml-2 text-[15px] text-gray-900 font-medium"
            />
            {value?.length > 0 && (
                <TouchableOpacity onPress={onClear}>
                    <Ionicons name="close-circle" size={18} color="#BDBDBD" />
                </TouchableOpacity>
            )}
        </View>
    );
}
