import React, { useState } from 'react';
import { ScrollView, View, Image } from 'react-native';
import { router } from 'expo-router';
import { Card, Text, Searchbar, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Datos mock de alertas
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
  {
    id: '4',
    name: 'Luis Fernández',
    age: 22,
    lastSeen: 'Avenida Principal',
    daysMissing: 7,
    photo: 'https://via.placeholder.com/150',
    description: 'Mediana estatura, cabello corto',
  },
  {
    id: '5',
    name: 'Sofía López',
    age: 19,
    lastSeen: 'Parque Central',
    daysMissing: 2,
    photo: 'https://via.placeholder.com/150',
    description: 'Alta, cabello largo negro',
  },
];

// Componente AlertCard
const AlertCard = ({ alert }: { alert: typeof mockAlerts[0] }) => {
  const theme = useTheme();
  
  return (
    <Card
      className="mx-5 mb-4"
      onPress={() => router.push(`/alert/${alert.id}`)}
      mode="elevated"
    >
      <Card.Content className="flex-row items-center p-4">
        <Image source={{ uri: alert.photo }} className="w-20 h-20 rounded-lg mr-4 bg-[#2E2E2E]" />
        <View className="flex-1">
          <Text variant="titleMedium" className="mb-1 font-bold">{alert.name}</Text>
          <Text variant="bodySmall" className="mb-0.5 opacity-70">Edad: {alert.age} años</Text>
          <Text variant="bodySmall" className="mb-1.5 opacity-70">Última ubicación: {alert.lastSeen}</Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name="time-outline" size={14} color={theme.colors.error} />
            <Text variant="labelSmall" className="ml-1 font-semibold" style={{ color: theme.colors.error }}>
              {alert.daysMissing} días desaparecido/a
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.onSurface} />
      </Card.Content>
    </Card>
  );
};

export default function AlertsScreen() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = mockAlerts.filter(
    (alert) =>
      alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.lastSeen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <Searchbar
        placeholder="Buscar por nombre o ubicación..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        className="mx-5 mt-2.5 mb-2.5"
        iconColor={theme.colors.onSurfaceVariant}
        inputStyle={{ color: theme.colors.onSurface }}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-2.5">
          <Text variant="headlineMedium" className="mb-1.5">Alertas Activas</Text>
          <Text variant="bodyMedium" className="opacity-70">
            {filteredAlerts.length} alerta(s) encontrada(s)
          </Text>
        </View>

        {filteredAlerts.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Ionicons name="search-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text variant="titleMedium" className="mt-5 font-semibold opacity-70">No se encontraron alertas</Text>
            <Text variant="bodySmall" className="mt-2 opacity-50">
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        ) : (
          filteredAlerts.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}


