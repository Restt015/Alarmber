import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import modInboxService from '../../services/modInboxService';
import moderationService from '../../services/moderationService';

export default function ModInboxScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('pending');
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ pending: 0, reported: 0, critical: 0 });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterPriority, setFilterPriority] = useState(null);

    useEffect(() => {
        loadData();
        loadStats();

        // Subscribe to realtime updates
        const unsubscribe = modInboxService.subscribe(handleRealtimeEvent);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab, search, filterStatus, filterPriority]);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await modInboxService.getInbox({
                tab: activeTab,
                status: filterStatus,
                priority: filterPriority,
                q: search,
                page: 1,
                limit: 50
            });

            if (response.success) {
                setNotifications(response.data);
            }
        } catch (error) {
            console.error('Failed to load inbox:', error);
            Alert.alert('Error', 'No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await modInboxService.getStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadData(), loadStats()]);
        setRefreshing(false);
    };

    const handleRealtimeEvent = (event) => {
        if (event.type === 'mod:notification:new') {
            // Add new notification
            setNotifications(prev => [event.payload, ...prev]);
            loadStats(); // Refresh stats
        } else if (event.type === 'mod:notification:updated') {
            // Update existing notification
            setNotifications(prev =>
                prev.map(n => n._id === event.payload._id ? event.payload : n)
            );
            loadStats();
        }
    };

    const handleAction = async (action, notification) => {
        switch (action) {
            case 'openChat':
                // Navigate to chat (you'll need to create this route or reuse existing)
                router.push(`/alert/${notification.reportId._id}`);
                break;

            case 'openReport':
                router.push(`/alert/${notification.reportId._id}`);
                break;

            case 'deleteMessage':
                Alert.alert(
                    'Eliminar mensaje',
                    '¿Estás seguro de eliminar este mensaje?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await moderationService.deleteMessage(
                                        notification.messageId,
                                        notification.meta?.reason || 'Reportado por usuarios'
                                    );
                                    await modInboxService.markResolved(notification._id);
                                    Alert.alert('✅', 'Mensaje eliminado');
                                    loadData();
                                } catch (error) {
                                    Alert.alert('Error', 'No se pudo eliminar el mensaje');
                                }
                            }
                        }
                    ]
                );
                break;

            case 'mute':
                Alert.alert(
                    'Silenciar usuario',
                    'Selecciona la duración',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: '1 hora',
                            onPress: () => muteUser(notification, 3600)
                        },
                        {
                            text: '24 horas',
                            onPress: () => muteUser(notification, 86400)
                        }
                    ]
                );
                break;

            case 'resolve':
                try {
                    await modInboxService.markResolved(notification._id);
                    loadData();
                } catch (error) {
                    Alert.alert('Error', 'No se pudo marcar como resuelto');
                }
                break;

            case 'view':
                // Mark as read when viewed
                if (notification.status === 'unread') {
                    modInboxService.markRead(notification._id);
                }
                break;
        }
    };

    const muteUser = async (notification, duration) => {
        try {
            await moderationService.muteUser(
                notification.targetUserId._id,
                duration,
                'Reportado múltiples veces'
            );
            await modInboxService.markResolved(notification._id);
            Alert.alert('✅', 'Usuario silenciado');
            loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo silenciar el usuario');
        }
    };

    const renderNotificationCard = ({ item }) => (
        <NotificationCard
            notification={item}
            onAction={handleAction}
        />
    );

    const EmptyState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">
                No hay notificaciones {activeTab === 'pending' ? 'pendientes' : 'aquí'}
            </Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Stats Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row justify-around">
                    <StatBadge label="Pendientes" count={stats.pending} color="orange" />
                    <StatBadge label="Reportados" count={stats.reported} color="red" />
                    <StatBadge label="Críticos" count={stats.critical} color="red" />
                </View>
            </View>

            {/* Search */}
            <View className="bg-white px-4 py-2 border-b border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        placeholder="Buscar..."
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-2 text-gray-900"
                    />
                </View>
            </View>

            {/* Filter Chips */}
            <ScrollView
                horizontal
                className="bg-white px-4 py-2 border-b border-gray-200"
                showsHorizontalScrollIndicator={false}
            >
                <FilterChip
                    label="Sin leer"
                    active={filterStatus === 'unread'}
                    onPress={() => setFilterStatus(filterStatus === 'unread' ? null : 'unread')}
                />
                <FilterChip
                    label="Alta prioridad"
                    active={filterPriority === 'high'}
                    onPress={() => setFilterPriority(filterPriority === 'high' ? null : 'high')}
                />
                <FilterChip
                    label="Leídos"
                    active={filterStatus === 'read'}
                    onPress={() => setFilterStatus(filterStatus === 'read' ? null : 'read')}
                />
            </ScrollView>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-200">
                <TabButton
                    label="Pendientes"
                    active={activeTab === 'pending'}
                    onPress={() => setActiveTab('pending')}
                />
                <TabButton
                    label="Reportados"
                    active={activeTab === 'reported'}
                    onPress={() => setActiveTab('reported')}
                />
                <TabButton
                    label="Sistema"
                    active={activeTab === 'system'}
                    onPress={() => setActiveTab('system')}
                />
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotificationCard}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={<EmptyState />}
                contentContainerStyle={{ flexGrow: 1 }}
            />
        </View>
    );
}

// Helper Components
function StatBadge({ label, count, color }) {
    const bgColor = color === 'red' ? 'bg-red-100' : 'bg-orange-100';
    const textColor = color === 'red' ? 'text-red-700' : 'text-orange-700';

    return (
        <View className="items-center">
            <View className={`${bgColor} px-3 py-1 rounded-full`}>
                <Text className={`${textColor} font-bold text-lg`}>{count}</Text>
            </View>
            <Text className="text-gray-500 text-xs mt-1">{label}</Text>
        </View>
    );
}

function TabButton({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 py-3 items-center border-b-2 ${active ? 'border-red-500' : 'border-transparent'
                }`}
        >
            <Text className={`font-semibold ${active ? 'text-red-500' : 'text-gray-500'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function FilterChip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`mr-2 px-4 py-1.5 rounded-full ${active ? 'bg-red-500' : 'bg-gray-200'
                }`}
        >
            <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function NotificationCard({ notification, onAction }) {
    const { type, title, preview, priority, status, meta, createdAt, reportId } = notification;

    const getPriorityColor = () => {
        switch (priority) {
            case 'high':
                return 'border-red-500 bg-red-50';
            case 'medium':
                return 'border-yellow-500 bg-yellow-50';
            default:
                return 'border-gray-300 bg-white';
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    return (
        <TouchableOpacity
            className={`mx-4 my-2 p-4 rounded-lg border-l-4 ${getPriorityColor()} ${status === 'unread' ? 'shadow-md' : 'opacity-60'
                }`}
            onPress={() => onAction('view', notification)}
        >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-2">
                <View className="flex-row items-center flex-1">
                    <Ionicons
                        name={type === 'message_reported' ? 'flag' : type === 'spam_detected' ? 'warning' : 'information-circle'}
                        size={20}
                        color={priority === 'high' ? '#EF4444' : '#F59E0B'}
                    />
                    <Text className="font-bold text-gray-900 ml-2 flex-1">{title}</Text>
                    {status === 'unread' && (
                        <View className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </View>
            </View>

            {/* Preview */}
            {preview && (
                <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                    {preview}
                </Text>
            )}

            {/* Metadata */}
            <View className="flex-row items-center flex-wrap mb-3">
                <Text className="text-xs text-gray-400">{formatTimeAgo(createdAt)}</Text>
                {meta?.count && meta.count > 1 && (
                    <View className="ml-2 px-2 py-0.5 bg-red-600 rounded-full">
                        <Text className="text-white text-xs font-bold">{meta.count} reportes</Text>
                    </View>
                )}
                {priority === 'high' && (
                    <View className="ml-2 px-2 py-0.5 bg-red-600 rounded-full">
                        <Text className="text-white text-xs font-bold">URGENTE</Text>
                    </View>
                )}
                {reportId?.name && (
                    <Text className="ml-2 text-xs text-gray-500">• {reportId.name}</Text>
                )}
            </View>

            {/* Quick Actions */}
            <View className="flex-row flex-wrap gap-2">
                <ActionButton
                    label="Ver"
                    icon="eye-outline"
                    color="blue"
                    onPress={() => onAction('openReport', notification)}
                />

                {type === 'message_reported' && (
                    <>
                        <ActionButton
                            label="Eliminar"
                            icon="trash-outline"
                            color="red"
                            onPress={() => onAction('deleteMessage', notification)}
                        />
                        <ActionButton
                            label="Mutear"
                            icon="mic-off-outline"
                            color="orange"
                            onPress={() => onAction('mute', notification)}
                        />
                    </>
                )}

                <ActionButton
                    label="Resolver"
                    icon="checkmark-circle-outline"
                    color="green"
                    onPress={() => onAction('resolve', notification)}
                />
            </View>
        </TouchableOpacity>
    );
}

function ActionButton({ label, icon, color = 'blue', onPress }) {
    const colors = {
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-500'
    };

    return (
        <TouchableOpacity
            className={`${colors[color]} px-3 py-1.5 rounded-full flex-row items-center`}
            onPress={onPress}
        >
            <Ionicons name={icon} size={14} color="white" />
            <Text className="text-white text-xs font-semibold ml-1">{label}</Text>
        </TouchableOpacity>
    );
}
