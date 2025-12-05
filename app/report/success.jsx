import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">

        {/* ICON ANIMATION PLACEHOLDER OR STATIC ICON */}
        <View className="mb-8 items-center">
          <View className="w-24 h-24 rounded-full bg-green-50 items-center justify-center mb-4 border border-green-100 shadow-sm">
            <Ionicons name="checkmark" size={48} color="#2E7D32" />
          </View>
        </View>

        {/* TITLE & DESCRIPTION */}
        <Text className="text-[28px] font-black text-gray-900 mb-3 text-center tracking-tight">
          ¡Reporte Enviado!
        </Text>

        <Text className="text-[16px] text-gray-500 text-center leading-6 mb-10 px-4">
          Tu reporte ha sido recibido correctamente. Nuestro equipo de validación lo revisará en breve para su publicación.
        </Text>

        {/* INFO CARD */}
        <View className="w-full bg-blue-50 rounded-2xl p-5 mb-10 border border-blue-100 flex-row items-start">
          <Ionicons name="information-circle" size={24} color="#1976D2" style={{ marginTop: 2 }} />
          <View className="ml-3 flex-1">
            <Text className="text-blue-900 font-bold text-[15px] mb-1">
              Proceso de Verificación
            </Text>
            <Text className="text-blue-700 text-[13px] leading-5">
              Para garantizar la veracidad, todos los reportes pasan por un filtro de seguridad. Te notificaremos cuando sea aprobado.
            </Text>
          </View>
        </View>

        {/* ACTION BUTTON */}
        <TouchableOpacity
          className="w-full bg-gray-900 rounded-2xl py-4 items-center shadow-md"
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-white text-[16px] font-bold tracking-wide">
            Volver al Inicio
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4 py-3"
          activeOpacity={0.6}
          onPress={() => router.replace('/(tabs)/alerts')}
        >
          <Text className="text-gray-500 text-[15px] font-semibold">
            Ver otros reportes
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
