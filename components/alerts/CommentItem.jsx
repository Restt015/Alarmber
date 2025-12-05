import { Image, Text, View } from 'react-native';

export default function CommentItem({ user, time, text, avatar }) {
    return (
        <View className="flex-row mb-6">
            <Image
                source={{ uri: avatar || "https://i.pravatar.cc/100" }}
                className="w-10 h-10 rounded-full bg-gray-200 mr-3"
            />
            <View className="flex-1 bg-gray-50 p-3 rounded-2xl rounded-tl-none">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-gray-900 text-[14px]">{user}</Text>
                    <Text className="text-xs text-gray-400">{time}</Text>
                </View>
                <Text className="text-gray-700 text-[14px] leading-5">
                    {text}
                </Text>
            </View>
        </View>
    );
}
