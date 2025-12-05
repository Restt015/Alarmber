import { ActivityIndicator, Text, View } from 'react-native';

export default function Loader({ message = "Cargando...", fullScreen = false }) {
    if (fullScreen) {
        return (
            <View className="flex-1 items-center justify-center bg-white z-50 absolute top-0 left-0 right-0 bottom-0">
                <ActivityIndicator size="large" color="#D32F2F" />
                {message && (
                    <Text className="mt-4 text-gray-500 font-medium text-[15px]">
                        {message}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#D32F2F" />
        </View>
    );
}
