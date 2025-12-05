import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function NewsCard({ title, source, time, image, onPress, fullWidth = false }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm mb-4 ${fullWidth ? 'w-full' : 'w-[280px] mr-4'}`}
            style={{
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8
            }}
        >
            <View className={`bg-gray-100 ${fullWidth ? 'h-[180px]' : 'h-[150px]'}`}>
                <Image
                    source={{ uri: image }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
            </View>

            <View className="p-4">
                <View className="flex-row items-center mb-2">
                    <View className="bg-red-50 px-2 py-0.5 rounded-md mr-2">
                        <Text className="text-red-700 font-bold text-[10px] uppercase tracking-wide">
                            {source}
                        </Text>
                    </View>
                    <Text className="text-gray-400 text-[11px] font-medium">{time}</Text>
                </View>

                <Text
                    className="font-bold text-gray-900 text-[16px] leading-snug"
                    numberOfLines={2}
                >
                    {title}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
