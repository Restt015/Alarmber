import { Image, Text, View } from 'react-native';

export default function LoginHeader() {
    return (
        <View className="mb-8 items-center">
            <Image
                source={require('../../assets/images/logo.png')}
                className="w-32 h-32 mb-6"
                resizeMode="contain"
            />
            <Text className="text-[28px] font-black text-gray-900 tracking-tight mb-2 text-center">
                Bienvenido a Alarmber
            </Text>
            <Text className="text-[16px] text-gray-500 leading-6 text-center px-4">
                Tu seguridad y la de los tuyos es nuestra prioridad. Inicia sesión para continuar.
            </Text>
        </View>
    );
}
