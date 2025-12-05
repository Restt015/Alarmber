import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function PhotoUploader({ photo, onPickImage }) {
    return (
        <TouchableOpacity
            onPress={onPickImage}
            activeOpacity={0.8}
            className="w-full h-[240px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center mb-8 overflow-hidden shadow-sm"
        >
            {photo ? (
                <Image
                    source={{ uri: photo }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            ) : (
                <View className="items-center">
                    <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-3">
                        <Ionicons name="camera" size={32} color="#D32F2F" />
                    </View>
                    <Text className="text-gray-900 font-bold text-[16px]">
                        Subir Fotografía
                    </Text>
                    <Text className="text-gray-400 text-[13px] mt-1">
                        Toca para seleccionar
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
