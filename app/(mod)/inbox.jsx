import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import EmptyState from '../../components/mod/EmptyState';
import NotificationCard from '../../components/mod/NotificationCard';
import useDebounce from '../../hooks/useDebounce';
import modInboxService from '../../services/modInboxService';

export default function ModInboxScreen() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('pending');
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({ pending: 0, reported: 0, critical: 0 });

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState(null);
    const [filterPriority, setFilterPriority] = useState(null);

    // Debounce search
    const debouncedSetSearch = useDebounce((value) => setDebouncedSearch(value), 400);

    useEffect(() => {
        debouncedSetSearch(search);
    }, [search]);

    useEffect(() => {
        loadData();
        loadStats();

        // MOD notifications only
        const unsubscribe = modInboxService.subscribe(handleRealtimeEvent);
        return () => {
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, []);

    useEffect(() => {
        loadData();
    }, [activeTab, debouncedSearch, filterStatus, filterPriority]);

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await modInboxService.getInbox({
                tab: activeTab,
                status: filterStatus,
                priority: filterPriority,
                q: debouncedSearch,
                page: 1,
                limit: 50,
            });

            if (response?.success) {
                setNotifications(Array.isArray(response.data) ? response.data : []);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to load inbox:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const response = await modInboxService.getStats();
            if (response?.success) {
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
        if (event?.action === 'mod:notification:new') {
            setNotifications((prev) => [event.payload, ...(prev || [])]);
            loadStats();
        }

        if (event?.action === 'mod:notification:updated') {
            setNotifications((prev) =>
                (prev || []).map((n) => (n._id === event.payload._id ? event.payload : n))
            );
            loadStats();
        }
    };

    const handleAction = async (action, notification) => {
        const rid = notification?.reportId?._id ?? notification?.reportId;
        const uid = notification?.targetUserId?._id ?? notification?.targetUserId;

        switch (action) {
            case 'openChat':
                if (rid) {
                    // Determine message to highlight
                    let highlightMsgId = null;
                    if (notification.type === 'message_reported' && notification.meta?.messageId) {
                        highlightMsgId = notification.meta.messageId;
                    } else if (notification.type === 'spam_detected' && notification.meta?.messageIds?.length > 0) {
                        highlightMsgId = notification.meta.messageIds[0];
                    }

                    router.push({
                        pathname: `/(mod)/chat/${rid}`,
                        params: highlightMsgId ? { highlight: highlightMsgId } : {}
                    });
                }
                break;

            case 'openReport':
                if (rid) router.push(`/alert/${rid}`);
                break;

            case 'deleteMessage':
                Alert.alert('Eliminar mensaje', '¿Estás seguro?', [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Eliminar',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await modInboxService.deleteMessages(
                                    rid,
                                    [notification.messageId || notification.meta?.messageId],
                                    notification?.meta?.reason || 'Reportado',
                                    notification._id
                                );
                                // Backend now handles auto-resolve
                                setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                loadStats();
                                Alert.alert('✅', 'Mensaje eliminado');
                            } catch (error) {
                                console.error('Delete error:', error);
                                Alert.alert('Error', 'No se pudo eliminar');
                            }
                        },
                    },
                ]);
                break;

            case 'mute':
                Alert.alert('Silenciar usuario', 'Selecciona duración', [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: '1 hora', onPress: () => muteUser(uid, notification._id, 3600) },
                    { text: '24 horas', onPress: () => muteUser(uid, notification._id, 86400) },
                ]);
                break;

            case 'resolve':
                Alert.alert(
                    'Resolver Caso',
                    '¿Qué acción deseas tomar antes de cerrar?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Solo Marcar Resuelto',
                            onPress: async () => {
                                try {
                                    setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                    await modInboxService.markResolved(notification._id);
                                    loadStats();
                                } catch (error) {
                                    Alert.alert('Error', 'No se pudo resolver');
                                    loadData();
                                }
                            }
                        },
                        {
                            text: 'Advertir Usuario...',
                            onPress: () => handleAction('warn', notification)
                        },
                        {
                            text: 'Silenciar Usuario...',
                            onPress: () => handleAction('mute', notification)
                        },
                        {
                            text: 'Eliminar Mensaje(s)...',
                            onPress: () => handleAction('deleteMessage', notification) // Or deleteMessages depending on type
                        }
                    ]
                );
                break;

            case 'spamCleanup':
                // Show action sheet for spam cleanup options
                Alert.alert(
                    'Moderación de Spam',
                    `Acciones para ${notification?.meta?.count || 1} incidente(s)`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Solo resolver',
                            onPress: () => executeSpamCleanup(notification._id, 'resolve_only')
                        },
                        {
                            text: 'Resolver + Borrar mensajes',
                            onPress: () => executeSpamCleanup(notification._id, 'resolve_and_delete_messages')
                        },
                        {
                            text: 'Borrar + Mutear 1h',
                            style: 'destructive',
                            onPress: () => executeSpamCleanup(notification._id, 'resolve_delete_and_mute_1h')
                        },
                        {
                            text: 'Borrar + Mutear 24h',
                            style: 'destructive',
                            onPress: () => executeSpamCleanup(notification._id, 'resolve_delete_and_mute_24h')
                        }
                    ]
                );
                break;

            case 'expandGroup':
                // For now, confirm action or navigate
                // Ideally prompt to "Manage Group"
                handleAction('spamCleanup', notification);
                break;

            case 'deleteMessages':
                const messageIds = notification?.meta?.messageIds || [];
                const count = notification?.meta?.count || messageIds.length;

                Alert.alert(
                    'Eliminar mensajes de spam',
                    `¿Eliminar ${count} mensaje(s)?`,
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Eliminar',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    await modInboxService.deleteMessages(
                                        rid,
                                        messageIds,
                                        'Spam detectado',
                                        notification._id
                                    );
                                    await modInboxService.markResolved(notification._id);
                                    setNotifications(prev => prev.filter(n => n._id !== notification._id));
                                    loadStats();
                                    Alert.alert('✅', 'Mensajes eliminados');
                                    if (notification.reportId) {
                                        const reportId = typeof notification.reportId === 'object' ? notification.reportId._id : notification.reportId;

                                        // Determine message to highlight
                                        let highlightMsgId = null;
                                        const type = notification.type; // Assuming notification.type exists
                                        if (type === 'message_reported' && notification.meta?.messageId) {
                                            highlightMsgId = notification.meta.messageId;
                                        } else if (type === 'spam_detected' && notification.meta?.messageIds?.length > 0) {
                                            highlightMsgId = notification.meta.messageIds[0];
                                        }

                                        router.push({
                                            pathname: `/(mod)/chat/${reportId}`,
                                            params: highlightMsgId ? { highlight: highlightMsgId } : {}
                                        });
                                    } else {
                                        Alert.alert('Error', 'No se encontró el reporte asociado');
                                    }
                                } catch (error) {
                                    console.error('Error deleting messages:', error);
                                    Alert.alert('Error', 'No se pudieron eliminar los mensajes');
                                }
                            }
                        }
                    ]
                );
                break;

            case 'warn':
                Alert.alert(
                    'Advertir usuario',
                    'Selecciona plantilla de advertencia',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: 'Spam',
                            onPress: () => executeWarn(uid, rid, notification._id, 'spam_detected', notification?.meta)
                        },
                        {
                            text: 'Lenguaje',
                            onPress: () => executeWarn(uid, rid, notification._id, 'inappropriate_language')
                        },
                        {
                            text: 'Off-topic',
                            onPress: () => executeWarn(uid, rid, notification._id, 'off_topic')
                        }
                    ]
                );
                break;

            case 'ban':
                Alert.alert(
                    'Suspender usuario',
                    '¿Por cuánto tiempo?',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                            text: '24 horas',
                            style: 'destructive',
                            onPress: () => executeBan(uid, rid, notification._id, 86400)
                        }
                    ]
                );
                break;

            case 'slowmode':
                try {
                    await modInboxService.setSlowmode(rid, 15, 'Control de spam', notification._id);
                    Alert.alert('✅', 'Slowmode activado (15s)');
                } catch (error) {
                    console.error('Error setting slowmode:', error);
                    Alert.alert('Error', 'No se pudo activar slowmode');
                }
                break;

            default:
                break;
        }
    };

    const muteUser = async (userId, notificationId, duration) => {
        try {
            const rid = notifications.find(n => n._id === notificationId)?.reportId?._id;
            await modInboxService.muteUser(userId, duration, 'Reportado', rid, notificationId);
            await modInboxService.markResolved(notificationId);
            setNotifications(prev => prev.filter(n => n._id !== notificationId));
            loadStats();
            Alert.alert('✅', 'Usuario silenciado');
        } catch (error) {
            console.error('Error muting user:', error);
            Alert.alert('Error', 'No se pudo silenciar');
            loadData();
        }
    };

    const executeWarn = async (userId, reportId, notificationId, template, meta = {}) => {
        try {
            await modInboxService.warnUser(userId, reportId, template, '', meta, notificationId);
            Alert.alert('✅', 'Usuario advertido');
        } catch (error) {
            console.error('Error warning user:', error);
            Alert.alert('Error', 'No se pudo advertir al usuario');
        }
    };

    const executeBan = async (userId, reportId, notificationId, durationSeconds) => {
        try {
            await modInboxService.banUser(userId, durationSeconds, 'Violación de normas', reportId, notificationId);
            await modInboxService.markResolved(notificationId);
            setNotifications(prev => prev.filter(n => n._id === notificationId));
            loadStats();
            Alert.alert('✅', 'Usuario suspendido');
        } catch (error) {
            console.error('Error banning user:', error);
            Alert.alert('Error', 'No se pudo suspender al usuario');
            loadData();
        }
    };

    const executeSpamCleanup = async (notificationId, actionMode) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.filter(n => n._id === notificationId));

            const response = await modInboxService.spamCleanup(notificationId, actionMode);
            loadStats();

            // Show success message from server
            if (response?.success && response.message) {
                Alert.alert('✅ Spam Limpiado', response.message);
            } else {
                Alert.alert('✅', 'Spam resuelto correctamente');
            }
        } catch (error) {
            console.error('Error cleaning spam:', error);
            Alert.alert('Error', 'No se pudo limpiar el spam');
            loadData(); // Reload on error
        }
    };

    const listHeader = useMemo(() => {
        return (
            <View>
                {/* Header + Stats */}
                <View className="bg-white border-b border-gray-200 px-4 pt-4 pb-3">
                    <Text className="text-[22px] font-bold text-gray-900">Inbox</Text>

                    <View className="flex-row justify-between mt-3">
                        <StatBadge label="Pendientes" count={stats.pending} tone="orange" />
                        <StatBadge label="Reportados" count={stats.reported} tone="red" />
                        <StatBadge label="Críticos" count={stats.critical} tone="red" />
                    </View>
                </View>

                {/* Search */}
                <View className="bg-white border-b border-gray-200 px-4 py-3">
                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5">
                        <Ionicons name="search" size={18} color="#9CA3AF" />
                        <TextInput
                            placeholder="Buscar..."
                            placeholderTextColor="#9CA3AF"
                            value={search}
                            onChangeText={setSearch}
                            className="flex-1 ml-2 text-gray-900 text-[15px]"
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.7}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Chips */}
                <View className="bg-white border-b border-gray-200">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
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
                </View>

                {/* Tabs */}
                <View className="bg-white border-b border-gray-200 px-2">
                    <View className="flex-row">
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
                        <TabButton
                            label="Resueltos"
                            active={activeTab === 'resolved'}
                            onPress={() => setActiveTab('resolved')}
                        />
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: 12 }} />
            </View>
        );
    }, [stats, search, activeTab, filterStatus, filterPriority]);

    const ItemSeparator = () => <View style={{ height: 12 }} />;

    // Grouping Logic
    const groupedNotifications = useMemo(() => {
        if (!notifications.length) return [];

        // Only group spam in system tab or pending tabs? 
        // User said: "Agrupar spam detectado... Agrupar por: targetUserId + reportId + type"
        // Let's group spam_detected generally.

        const groups = {};
        const result = [];

        notifications.forEach(n => {
            if (n.type === 'spam_detected') {
                const key = `${n.targetUserId}_${n.reportId}_${n.type}`;
                if (!groups[key]) {
                    groups[key] = {
                        ...n,
                        isGroup: true,
                        meta: { ...n.meta, count: n.meta?.count || 1 },
                        groupItems: [n]
                    };
                    result.push(groups[key]);
                } else {
                    // Update existing group
                    groups[key].meta.count += (n.meta?.count || 1);
                    groups[key].groupItems.push(n);
                    // Keep latest date
                    if (new Date(n.createdAt) > new Date(groups[key].createdAt)) {
                        groups[key].createdAt = n.createdAt;
                    }
                }
            } else {
                result.push(n);
            }
        });

        // Sort by date desc (after grouping updates)
        return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [notifications]);

    const renderNotificationCard = ({ item }) => (
        <NotificationCard
            notification={item}
            onAction={handleAction}
            isGroup={item.isGroup}
        />
    );

    if (loading && !refreshing && notifications.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {listHeader}

            <FlatList
                data={groupedNotifications}
                renderItem={renderNotificationCard}
                keyExtractor={item => item._id}
                contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={["#D32F2F"]} />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="mail-open-outline"
                        title="Todo limpio"
                        message="No hay notificaciones en esta sección"
                    />
                }
            />
        </View>
    );
}

/* -------------------- Helpers -------------------- */

function StatBadge({ label, count, tone }) {
    const bg = tone === 'red' ? 'bg-red-100' : 'bg-orange-100';
    const text = tone === 'red' ? 'text-red-700' : 'text-orange-700';

    return (
        <View className="items-center flex-1">
            <View className={`${bg} px-4 py-2 rounded-full`}>
                <Text className={`${text} font-bold text-[18px]`}>{count}</Text>
            </View>
            <Text className="text-gray-500 text-[12px] mt-1.5">{label}</Text>
        </View>
    );
}

function TabButton({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            className={`flex-1 py-3 items-center border-b-2 ${active ? 'border-red-500' : 'border-transparent'
                }`}
        >
            <Text className={`font-semibold text-[14px] ${active ? 'text-red-500' : 'text-gray-500'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

function FilterChip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            className={`mr-2 px-4 py-2 rounded-full ${active ? 'bg-red-500' : 'bg-gray-200'}`}
        >
            <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

