import { Image, Text, View } from 'react-native';

export default function RegisterHeader({ textColor = "text-gray-900", subtitleColor = "text-gray-500" }) {
    return (
        <View className="mb-6 items-center">
            <View className="bg-white p-3 rounded-full mb-4 elevation-4 shadow-sm">
                <Image
                    source={require('../../assets/images/logo.png')}
                    className="w-16 h-16"
                    resizeMode="contain"
                />
            </View>

            <Text className={`text-[24px] font-black tracking-tight mb-1 text-center ${textColor}`}>
                Crear Cuenta
            </Text>
            <Text className={`text-[14px] leading-5 text-center px-4 ${subtitleColor}`}>
                Únete a la red de seguridad ciudadana
            </Text>
        </View>
    );
}
