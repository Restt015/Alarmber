import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import { useNotifications } from '../../context/NotificationContext';

const NOTIFICATION_ICONS = {
  // Report status changes
  status_update: { name: 'swap-horizontal', color: '#FF9800', bg: '#FFF3E0' },
  accepted: { name: 'checkmark-circle', color: '#4CAF50', bg: '#E8F5E9' },
  review: { name: 'time', color: '#FF9800', bg: '#FFF3E0' },
  rejected: { name: 'close-circle', color: '#F44336', bg: '#FFEBEE' },
  updated: { name: 'refresh-circle', color: '#2196F3', bg: '#E3F2FD' },

  // Messages and chat
  new_message: { name: 'chatbubble-ellipses', color: '#2196F3', bg: '#E3F2FD' },
  comment: { name: 'chatbubble', color: '#9C27B0', bg: '#F3E5F5' },

  // Admin actions
  report_validated: { name: 'checkmark-done-circle', color: '#4CAF50', bg: '#E8F5E9' },
  report_rejected: { name: 'close-circle', color: '#F44336', bg: '#FFEBEE' },

  // Moderation
  moderation_warning: { name: 'warning', color: '#FF9800', bg: '#FFF3E0' },
  moderation_mute: { name: 'volume-mute', color: '#D32F2F', bg: '#FFEBEE' },
  moderation_ban: { name: 'ban', color: '#D32F2F', bg: '#FFEBEE' },

  // System
  system: { name: 'information-circle', color: '#607D8B', bg: '#ECEFF1' }
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

function NotificationItem({ notification, onPress, onMarkAsRead }) {
  const iconConfig = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`mx-4 mb-3 p-4 rounded-2xl ${notification.isRead ? 'bg-gray-50' : 'bg-white'}`}
      style={{
        shadowColor: notification.isRead ? 'transparent' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: notification.isRead ? 0 : 3,
        borderWidth: notification.isRead ? 1 : 0,
        borderColor: 'rgba(0,0,0,0.04)'
      }}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: iconConfig.bg }}
        >
          <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className={`text-[15px] font-bold flex-1 ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}
              numberOfLines={1}
            >
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View className="w-2.5 h-2.5 rounded-full bg-red-500 ml-2" />
            )}
          </View>
          <Text
            className={`text-[13px] leading-5 mb-2 ${notification.isRead ? 'text-gray-400' : 'text-gray-600'}`}
            numberOfLines={2}
          >
            {notification.message}
          </Text>
          <Text className="text-[11px] text-gray-400 font-medium">
            {formatTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const {
    notifications = [],
    unreadCount = 0,
    loading = false,
    refreshing = false,
    hasMore = false,
    refresh = () => { },
    loadMore = () => { },
    markAsRead = () => { },
    markAllAsRead = () => { }
  } = useNotifications() || {};

  const handleNotificationPress = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.reportId?._id) {
      const reportId = notification.reportId._id;

      // For message notifications, navigate to chat
      if (notification.type === 'new_message' || notification.type === 'comment') {
        router.push(`/chat/${reportId}`);
      } else {
        // For other notifications, navigate to report detail
        router.push(`/alert/${reportId}`);
      }
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader title="Notificaciones" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D32F2F" />
          <Text className="text-gray-500 mt-4 text-[15px]">Cargando notificaciones...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <PageHeader
        title="Notificaciones"
        rightIcon={unreadCount > 0 ? "checkmark-done" : null}
        onRightPress={unreadCount > 0 ? markAllAsRead : undefined}
      />

      {/* Unread count header */}
      {unreadCount > 0 && (
        <View className="px-4 py-2 bg-red-50 border-b border-red-100">
          <Text className="text-red-700 text-[13px] font-semibold">
            {unreadCount} {unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
          </Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor="#D32F2F"
            colors={['#D32F2F']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.2}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 20, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="Sin notificaciones"
            message="Te avisaremos cuando haya actividad importante sobre tus reportes."
            icon="notifications-off-outline"
          />
        }
        ListFooterComponent={
          loading && notifications.length > 0 ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#D32F2F" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

