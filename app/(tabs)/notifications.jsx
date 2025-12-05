import { router } from 'expo-router';
import { FlatList, View } from 'react-native';
import NotificationCard from '../../components/cards/NotificationCard';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Nueva alerta en tu zona',
    message: 'Se ha reportado una desaparición cerca de tu ubicación actual. Revisa los detalles y ayuda en la búsqueda.',
    time: 'Hace 10 min',
    read: false,
    icon: 'warning'
  },
  {
    id: '2',
    title: 'Actualización de reporte',
    message: 'El reporte #4829 ha sido actualizado con nueva información sobre el paradero.',
    time: 'Hace 2 horas',
    read: true,
    icon: 'document-text'
  },
  {
    id: '3',
    title: 'Reporte verificado',
    message: 'Tu reporte enviado ayer ha sido verificado y publicado exitosamente.',
    time: 'Ayer',
    read: true,
    icon: 'checkmark-circle'
  },
  {
    id: '4',
    title: 'Alerta Amber Activada',
    message: 'URGENTE: Se ha activado una Alerta Amber para un menor en la zona centro.',
    time: 'Ayer',
    read: true,
    icon: 'megaphone'
  }
];

export default function NotificationsScreen() {
  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Notificaciones"
        rightIcon="settings-outline"
        onRightPress={() => { }}
      />

      <FlatList
        data={NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => {
              if (item.id === '1') router.push('/alert/1');
            }}
          />
        )}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Sin notificaciones"
            message="Te avisaremos cuando haya actividad importante."
            icon="notifications-off-outline"
          />
        }
      />
    </View>
  );
}
