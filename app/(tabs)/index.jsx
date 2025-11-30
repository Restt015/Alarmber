import React from 'react';
import { ScrollView, View, Image } from 'react-native';
import { router } from 'expo-router';
import { Card, Text, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const mockAlerts = [
  {
    id: '1',
    name: 'María González',
    age: 25,
    lastSeen: 'Centro Histórico',
    daysMissing: 3,
    photo: 'https://via.placeholder.com/150',
    description: 'Estatura media, cabello castaño',
  },
  {
    id: '2',
    name: 'Carlos Ramírez',
    age: 18,
    lastSeen: 'Zona Norte',
    daysMissing: 5,
    photo: 'https://via.placeholder.com/150',
    description: 'Alto, cabello negro, usa lentes',
  },
  {
    id: '3',
    name: 'Ana Martínez',
    age: 30,
    lastSeen: 'Plaza Principal',
    daysMissing: 1,
    photo: 'https://via.placeholder.com/150',
    description: 'Baja estatura, cabello rubio',
  },
];

const AlertCard = ({ alert }) => (
  <Card
    className="mx-5 mb-4 bg-surface border border-surfaceMuted"
    onPress={() => router.push(`/alert/${alert.id}`)}
    mode="elevated"
  >
    <Card.Content className="flex-row items-center p-4 gap-3">
      <Image source={{ uri: alert.photo }} className="w-20 h-20 rounded-lg bg-surfaceMuted" />
      <View className="flex-1">
        <Text variant="titleMedium" className="mb-1 font-bold text-white">
          {alert.name}
        </Text>
        <Text variant="bodySmall" className="mb-0.5 text-muted">
          Edad: {alert.age} años
        </Text>
        <Text variant="bodySmall" className="mb-1.5 text-muted">
          Última ubicación: {alert.lastSeen}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={14} color="#D32F2F" />
          <Text variant="labelSmall" className="ml-1 font-semibold text-danger">
            {alert.daysMissing} días desaparecido/a
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#AAAAAA" />
    </Card.Content>
  </Card>
);

const SectionTitle = ({ title }) => (
  <View className="px-5 mt-2.5 mb-4">
    <Text variant="titleLarge" className="font-semibold text-white">
      {title}
    </Text>
  </View>
);

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2.5">
          <Text variant="headlineMedium" className="mb-1.5 text-white">
            Alerta Ciudadana
          </Text>
          <Text variant="bodyMedium" className="text-muted">
            Últimas alertas activas
          </Text>
        </View>

        <SectionTitle title="Alertas Recientes" />

        {mockAlerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}

        <View className="h-24" />
      </ScrollView>

      <FAB
        icon="plus"
        className="absolute right-5 bottom-8 bg-danger"
        onPress={() => router.push('/report/create')}
        color="#FFFFFF"
      />
    </View>
  );
}
