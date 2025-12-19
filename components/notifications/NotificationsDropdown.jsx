import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useNotifications } from '../../context/NotificationContext';

const NOTIFICATION_ICONS = {
    status_update: { name: 'swap-horizontal', color: '#FF9800', bg: '#FFF3E0' },
    accepted: { name: 'checkmark-circle', color: '#4CAF50', bg: '#E8F5E9' },
    rejected: { name: 'close-circle', color: '#F44336', bg: '#FFEBEE' },
    new_message: { name: 'chatbubble-ellipses', color: '#2196F3', bg: '#E3F2FD' },
    comment: { name: 'chatbubble', color: '#9C27B0', bg: '#F3E5F5' },
    report_validated: { name: 'checkmark-done-circle', color: '#4CAF50', bg: '#E8F5E9' },
    report_rejected: { name: 'close-circle', color: '#F44336', bg: '#FFEBEE' },
    moderation_warning: { name: 'warning', color: '#FF9800', bg: '#FFF3E0' },
    moderation_mute: { name: 'volume-mute', color: '#D32F2F', bg: '#FFEBEE' },
    moderation_ban: { name: 'ban', color: '#D32F2F', bg: '#FFEBEE' },
    system: { name: 'information-circle', color: '#607D8B', bg: '#ECEFF1' }
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins} min`;
    if (diffHours < 24) return `${diffHours} h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

export default function NotificationsDropdown({ visible, onClose }) {
    const {
        notifications = [],
        unreadCount = 0,
        markAsRead,
        markAllAsRead,
        loading = false
    } = useNotifications() || {};

    if (!visible) return null;

    const handleNotificationPress = (notification) => {
        if (!notification.isRead) markAsRead(notification._id);
        onClose();

        if (notification.reportId?._id) {
            const reportId = notification.reportId._id;
            if (['new_message', 'comment'].includes(notification.type)) {
                router.push(`/chat/${reportId}`);
            } else {
                router.push(`/alert/${reportId}`);
            }
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View className="flex-1 bg-black/20">
                    <TouchableWithoutFeedback>
                        <View
                            className="absolute top-28 right-5 w-80 max-h-[500px] bg-white rounded-2xl shadow-xl overflow-hidden"
                            style={{ elevation: 5 }}
                        >
                            {/* Header */}
                            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                                <Text className="text-[17px] font-bold text-gray-900">Notificaciones</Text>
                                <TouchableOpacity onPress={markAllAsRead}>
                                    <Text className="text-[13px] font-semibold text-blue-600">
                                        Marcar todo leído
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Tabs */}
                            <View className="flex-row px-4 border-b border-gray-100">
                                <View className="py-2.5 border-b-2 border-red-600 mr-6 flex-row items-center">
                                    <Text className="text-[14px] font-bold text-gray-900 mr-1.5">Inbox</Text>
                                    {unreadCount > 0 && (
                                        <View className="bg-red-100 px-1.5 py-0.5 rounded-full">
                                            <Text className="text-[10px] font-bold text-red-700">{unreadCount}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {/* Content */}
                            {loading && notifications.length === 0 ? (
                                <View className="py-8 items-center">
                                    <ActivityIndicator color="#D32F2F" />
                                </View>
                            ) : (
                                <FlatList
                                    data={notifications}
                                    keyExtractor={item => item._id}
                                    contentContainerStyle={{ paddingVertical: 8 }}
                                    ListEmptyComponent={
                                        <View className="py-8 items-center px-6">
                                            <Ionicons name="notifications-off-outline" size={40} color="#E0E0E0" />
                                            <Text className="text-gray-400 text-[13px] text-center mt-2">
                                                No tienes notificaciones recientes
                                            </Text>
                                        </View>
                                    }
                                    renderItem={({ item }) => {
                                        const iconConfig = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.system;
                                        return (
                                            <TouchableOpacity
                                                onPress={() => handleNotificationPress(item)}
                                                className={`flex-row px-4 py-3 border-b border-gray-50 ${!item.isRead ? 'bg-red-50/30' : ''}`}
                                            >
                                                {/* Status Dot */}
                                                {!item.isRead && (
                                                    <View className="absolute right-4 top-4 w-2 h-2 rounded-full bg-red-500" />
                                                )}

                                                <View
                                                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                                    style={{ backgroundColor: iconConfig.bg }}
                                                >
                                                    <Ionicons name={iconConfig.name} size={18} color={iconConfig.color} />
                                                </View>

                                                <View className="flex-1 pr-4">
                                                    <Text className={`text-[14px] mb-0.5 ${!item.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {item.title}
                                                    </Text>
                                                    <Text className="text-[12px] text-gray-500 leading-4 mb-1" numberOfLines={2}>
                                                        {item.message}
                                                    </Text>
                                                    <Text className="text-[11px] text-gray-400 font-medium">
                                                        {formatTime(item.createdAt)}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}
