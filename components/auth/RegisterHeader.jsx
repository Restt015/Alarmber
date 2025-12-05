import { Image, Text, View } from 'react-native';

export default function RegisterHeader() {
    return (
        <View className="mb-6 items-center">
            <Image
                source={require('../../assets/images/logo.png')}
                className="w-24 h-24 mb-6"
                resizeMode="contain"
            />

            <Text className="text-[28px] font-black text-gray-900 tracking-tight mb-2 text-center">
                Crear Nueva Cuenta
            </Text>
            <Text className="text-[16px] text-gray-500 leading-6 text-center px-4">
                Únete a la red de seguridad ciudadana más grande. Tu ayuda hace la diferencia.
            </Text>
        </View>
    );
}
