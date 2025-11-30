import React, { useState } from 'react';
import { View, Text, TextInput, Image, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockAlerts = [
  { id: '1', name: 'María González', age: 25, lastSeen: 'Centro Histórico', daysMissing: 3, photo: 'https://via.placeholder.com/150' },
  { id: '2', name: 'Carlos Ramírez', age: 18, lastSeen: 'Zona Norte', daysMissing: 5, photo: 'https://via.placeholder.com/150' },
  { id: '3', name: 'Ana Martínez', age: 30, lastSeen: 'Plaza Principal', daysMissing: 1, photo: 'https://via.placeholder.com/150' },
  { id: '4', name: 'Luis Fernández', age: 22, lastSeen: 'Avenida Principal', daysMissing: 7, photo: 'https://via.placeholder.com/150' },
  { id: '5', name: 'Sofía López', age: 19, lastSeen: 'Parque Central', daysMissing: 2, photo: 'https://via.placeholder.com/150' },
];

const AlertCard = ({ alert }) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/alert/${alert.id}`)}
      className="mx-5 mb-4 p-4 bg-surface rounded-2xl flex-row items-center border border-surfaceMuted"
    >
      <Image source={{ uri: alert.photo }} className="w-20 h-20 rounded-xl mr-4 bg-surfaceMuted" />

      <View className="flex-1">
        <Text className="text-white text-base font-bold">{alert.name}</Text>

        <Text className="text-muted text-xs">Edad: {alert.age} años</Text>

        <Text className="text-muted text-xs mb-1">
          Última ubicación: {alert.lastSeen}
        </Text>

        <View className="flex-row items-center mt-1">
          <Ionicons name="time-outline" size={14} color="#D32F2F" />
          <Text className="text-red-400 text-xs ml-1 font-semibold">
            {alert.daysMissing} días desaparecido/a
          </Text>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={22} color="#888" />
    </TouchableOpacity>
  );
};

export default function AlertsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = mockAlerts.filter(
    (alert) =>
      alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.lastSeen.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="mx-5 mt-3">
        <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-surfaceMuted">
          <Ionicons name="search-outline" size={20} color="#aaa" />
          <TextInput
            placeholder="Buscar por nombre o ubicación..."
            placeholderTextColor="#777"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 text-white ml-3"
          />
        </View>
      </View>

      <View className="px-5 mt-4 mb-3">
        <Text className="text-white text-xl font-semibold">Alertas Activas</Text>
        <Text className="text-muted text-sm">
          {filteredAlerts.length} alerta(s) encontrada(s)
        </Text>
      </View>

      {filteredAlerts.length === 0 ? (
        <View className="items-center justify-center mt-20 px-6">
          <Ionicons name="search-outline" size={64} color="#555" />
          <Text className="text-white text-lg font-semibold mt-4">
            No se encontraron alertas
          </Text>
          <Text className="text-muted mt-1 text-center">
            Intenta con otros términos de búsqueda
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AlertCard alert={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
        />
      )}
    </SafeAreaView>
  );
}
