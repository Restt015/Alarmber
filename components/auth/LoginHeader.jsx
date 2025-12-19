import { Image, Text, View } from 'react-native';

export default function LoginHeader({ textColor = "text-gray-900", subtitleColor = "text-gray-500" }) {
    return (
        <View className="mb-8 items-center">
            <View className="bg-white p-4 rounded-full mb-6 elevation-4 shadow-sm">
                <Image
                    source={require('../../assets/images/logo.png')}
                    className="w-20 h-20"
                    resizeMode="contain"
                />
            </View>
            <Text className={`text-[28px] font-black tracking-tight mb-2 text-center ${textColor}`}>
                Bienvenido
            </Text>
            <Text className={`text-[16px] leading-6 text-center px-4 ${subtitleColor}`}>
                Inicia sesión para continuar
            </Text>
        </View>
    );
}
