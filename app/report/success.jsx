import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SuccessScreen() {
  return (
    <View className="flex-1 bg-background justify-center items-center p-5">
      <View className="items-center max-w-[400px] w-full">
        <View className="mb-8">
          <View className="w-[120px] h-[120px] rounded-full bg-surface justify-center items-center border border-surfaceMuted">
            <Ionicons name="checkmark-circle" size={80} color="#0D47A1" />
          </View>
        </View>

        <Text className="text-[28px] font-bold text-white mb-4 text-center">¡Reporte Enviado!</Text>
        <Text className="text-base text-muted text-center leading-6 mb-8">
          Tu reporte ha sido recibido y será revisado por las autoridades. Te contactaremos si necesitamos más
          información.
        </Text>

        <View className="flex-row bg-surface p-4 rounded-xl mb-8 border-l-4 border-l-primary border border-surfaceMuted">
          <Ionicons name="information-circle-outline" size={24} color="#0D47A1" />
          <Text className="flex-1 text-sm text-white ml-2.5 leading-5">
            El reporte será publicado después de ser verificado. Esto puede tomar algunas horas.
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl py-4 px-10 min-w-[200px] items-center"
          onPress={() => router.replace('/(tabs)')}
        >
          <Text className="text-white text-lg font-bold">Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
