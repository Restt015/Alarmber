import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationCard({ notification, onAction, isGroup = false }) {
    const { type, priority, status, meta, createdAt } = notification;

    // Helper to format date relative
    const timeAgo = useMemo(() => {
        const seconds = Math.floor((new Date() - new Date(createdAt)) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        return `${Math.floor(hours / 24)}d`;
    }, [createdAt]);

    // Config based on type
    const config = useMemo(() => {
        const targetName = notification.targetUserId?.name || 'Usuario';

        switch (type) {
            case 'spam_detected':
                return {
                    icon: 'alert-circle',
                    color: 'bg-red-100',
                    iconColor: '#D32F2F',
                    title: isGroup ? `Spam: ${targetName} (${meta?.count || 1})` : `Spam: ${targetName}`,
                };
            case 'message_reported':
                return {
                    icon: 'flag',
                    color: 'bg-orange-100',
                    iconColor: '#F57C00',
                    title: `Reporte: ${targetName}`,
                };
            case 'system_event':
                return {
                    icon: 'information-circle',
                    color: 'bg-blue-100',
                    iconColor: '#1976D2',
                    title: 'Sistema',
                };
            default:
                return {
                    icon: 'notifications',
                    color: 'bg-gray-100',
                    iconColor: '#757575',
                    title: 'Notificación',
                };
        }
    }, [type, isGroup, notification.targetUserId, meta]);

    // Priority badge color
    const priorityColor = useMemo(() => {
        switch (priority) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-blue-500';
        }
    }, [priority]);

    const handlePress = () => {
        if (isGroup) {
            onAction('expandGroup', notification);
        } else {
            onAction(type === 'spam_detected' ? 'openChat' : 'openReport', notification);
        }
    };

    const handleOptions = () => {
        if (status === 'resolved') return; // No actions for resolved

        if (type === 'spam_detected') {
            onAction('spamCleanup', notification);
        } else {
            // General actions
            Alert.alert(
                'Opciones',
                'Selecciona una acción',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Gestionar / Resolver', onPress: () => onAction('resolve', notification) },
                    { text: 'Ver Detalle', onPress: () => handlePress() }
                ]
            );
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className={`bg-white mb-2 mx-4 rounded-xl shadow-sm border ${status === 'unread' ? 'border-l-4 border-l-blue-500' : 'border-gray-100'} overflow-hidden`}
        >
            <View className="flex-row p-3">
                {/* Icon Column */}
                <View className={`w-10 h-10 rounded-full ${config.color} items-center justify-center mr-3`}>
                    <Ionicons name={config.icon} size={20} color={config.iconColor} />
                </View>

                {/* Content Column */}
                <View className="flex-1 justify-center">
                    <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center flex-1 mr-2">
                            <Text className="font-semibold text-gray-900 text-[15px] mr-2" numberOfLines={1}>
                                {config.title}
                            </Text>
                            {/* Priority Dot */}
                            <View className={`w-2 h-2 rounded-full ${priorityColor}`} />
                            {isGroup && (
                                <View className="ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                                    <Text className="text-[10px] text-gray-600 font-bold">{meta?.count || 1} incidentes</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-[11px] text-gray-400">{timeAgo}</Text>
                    </View>

                    <Text className="text-gray-600 text-[13px] leading-tight" numberOfLines={2}>
                        {notification.preview || notification.message || 'Sin descripción'}
                    </Text>

                    {/* Footer / Meta */}
                    <View className="flex-row items-center mt-2.5">
                        {notification.reportId && (
                            <View className="flex-row items-center mr-3 bg-gray-50 px-1.5 py-0.5 rounded">
                                <Ionicons name="document-text-outline" size={10} color="#9CA3AF" />
                                <Text className="text-[10px] text-gray-500 ml-1 font-medium">
                                    {notification.reportId.name || 'Reporte'}
                                </Text>
                            </View>
                        )}
                        {status === 'resolved' && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-full flex-row items-center">
                                <Ionicons name="checkmark" size={10} color="#166534" />
                                <Text className="text-[10px] text-green-800 ml-1 font-medium">Resuelto</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Actions Button */}
                {status !== 'resolved' && (
                    <TouchableOpacity
                        onPress={handleOptions}
                        className="w-8 h-full justify-center items-center -mr-2"
                    >
                        <Ionicons name="ellipsis-vertical" size={18} color="#9CA3AF" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}
