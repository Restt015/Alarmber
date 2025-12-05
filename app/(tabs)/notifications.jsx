import { Ionicons } from '@expo/vector-icons';
import { FlatList, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

const notifications = [
  {
    id: '1',
    title: 'Nuevo reporte cercano',
    description: 'Se ha reportado una desaparición en tu zona.',
    time: '5 min',
    icon: 'location',
    color: '#D32F2F',
  },
  {
    id: '2',
    title: 'Actualización de caso',
    description: 'El caso #1234 ha sido actualizado a "En búsqueda".',
    time: '2h',
    icon: 'refresh',
    color: '#1976D2',
  },
  {
    id: '3',
    title: 'Alerta general',
    description: 'Se recomienda precaución en la zona centro.',
    time: 'Ayer',
    icon: 'warning',
    color: '#FBC02D',
  },
  {
    id: '4',
    title: 'Reporte validado',
    description: 'Tu reporte #5678 ha sido validado por un administrador.',
    time: 'Ayer',
    icon: 'checkmark-circle',
    color: '#388E3C',
  },
];

const NotificationItem = ({ item }) => (
  <Card
    mode="elevated"
    className="mx-5 mb-3 bg-surface rounded-2xl border border-surfaceVariant shadow-sm"
    style={{ elevation: 1 }}
  >
    <Card.Content className="flex-row items-start p-4">

      {/* ICON */}
      <View
        className="w-12 h-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${item.color}22` }}
      >
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>

      {/* TEXT */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-[15px] font-semibold text-text flex-1 mr-2">
            {item.title}
          </Text>
          <Text className="text-[12px] text-textSecondary">
            {item.time}
          </Text>
        </View>

        <Text className="text-[14px] text-textSecondary leading-[20px]">
          {item.description}
        </Text>
      </View>

    </Card.Content>
  </Card>
);

import AppHeader from '../../components/AppHeader';

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Notificaciones" />

      {/* HEADER */}
      <View className="px-5 pt-3 pb-4 bg-surface border-b border-surfaceVariant">
        <Text className="text-[24px] font-extrabold text-text tracking-tight">
          Actividad Reciente
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem item={item} />}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
