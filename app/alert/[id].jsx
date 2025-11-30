import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const getAlertById = (id) => {
  const alerts = {
    '1': {
      id: '1',
      name: 'María González',
      age: 25,
      lastSeen: 'Centro Histórico',
      daysMissing: 3,
      photo: 'https://via.placeholder.com/300',
      description: 'Estatura media, cabello castaño',
      physicalDescription: 'Estatura: 1.65m, Peso: 60kg, Cabello castaño largo, Ojos marrones',
      clothing: 'Última vez vista con camiseta blanca, jeans azules y zapatos deportivos negros',
      circumstances: 'Desapareció después de salir de su trabajo en el centro. No ha respondido llamadas ni mensajes.',
      contactPhone: '555-1234',
    },
    '2': {
      id: '2',
      name: 'Carlos Ramírez',
      age: 18,
      lastSeen: 'Zona Norte',
      daysMissing: 5,
      photo: 'https://via.placeholder.com/300',
      description: 'Alto, cabello negro, usa lentes',
      physicalDescription: 'Estatura: 1.80m, Peso: 75kg, Cabello negro corto, Ojos marrones, Usa lentes',
      clothing: 'Última vez visto con playera roja, pantalón negro y mochila azul',
      circumstances: 'No regresó a casa después de salir con amigos. Su familia está muy preocupada.',
      contactPhone: '555-5678',
    },
    '3': {
      id: '3',
      name: 'Ana Martínez',
      age: 30,
      lastSeen: 'Plaza Principal',
      daysMissing: 1,
      photo: 'https://via.placeholder.com/300',
      description: 'Baja estatura, cabello rubio',
      physicalDescription: 'Estatura: 1.55m, Peso: 55kg, Cabello rubio largo, Ojos verdes',
      clothing: 'Última vez vista con vestido floral, sandalias blancas y bolso beige',
      circumstances: 'Fue vista por última vez en la plaza principal. No ha contactado a su familia.',
      contactPhone: '555-9012',
    },
  };
  return alerts[id] || alerts['1'];
};

const InfoSection = ({ title, content }) => {
  return (
    <View className="mb-5">
      <Text className="text-lg font-bold text-white mb-2">{title}</Text>
      <Text className="text-base text-muted leading-6">{content}</Text>
    </View>
  );
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const alert = getAlertById(id || '1');

  const handleCall = () => {
    Linking.openURL(`tel:${alert.contactPhone}`);
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="relative w-full h-[300px]">
        <Image source={{ uri: alert.photo }} className="w-full h-full bg-surface" />
        <View className="absolute top-4 right-4 bg-danger flex-row items-center px-3 py-1.5 rounded-full">
          <Ionicons name="time-outline" size={16} color="#FFFFFF" />
          <Text className="text-white text-xs font-bold ml-1">
            {alert.daysMissing} días desaparecido/a
          </Text>
        </View>
      </View>

      <View className="p-5">
        <Text className="text-[28px] font-bold text-white mb-1.5">{alert.name}</Text>
        <Text className="text-lg text-muted mb-4">Edad: {alert.age} años</Text>

        <View className="flex-row items-center bg-surface p-3 rounded-lg mb-5 border border-surfaceMuted">
          <Ionicons name="location-outline" size={20} color="#D32F2F" />
          <Text className="text-base text-white ml-2 flex-1">{alert.lastSeen}</Text>
        </View>

        <InfoSection title="Descripción Física" content={alert.physicalDescription} />
        <InfoSection title="Vestimenta" content={alert.clothing} />
        <InfoSection title="Circunstancias" content={alert.circumstances} />

        <TouchableOpacity
          className="bg-primary flex-row items-center justify-center py-4 px-4 rounded-xl mt-2.5 mb-5"
          onPress={handleCall}
        >
          <Ionicons name="call" size={20} color="#FFFFFF" />
          <Text className="text-white text-lg font-bold ml-2">Contactar</Text>
        </TouchableOpacity>

        <View className="flex-row bg-surface p-4 rounded-xl border-l-4 border-l-danger border border-surfaceMuted">
          <Ionicons name="warning-outline" size={24} color="#D32F2F" />
          <Text className="flex-1 text-sm text-white ml-2.5 leading-5">
            Si tienes información sobre esta persona, por favor contacta inmediatamente a las autoridades.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
