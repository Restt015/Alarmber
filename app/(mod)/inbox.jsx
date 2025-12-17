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
import useDebounce from '../../hooks/useDebounce';
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
                if (rid) router.push(`/(mod)/chat/${rid}`);
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
                                await moderationService.deleteMessage(
                                    notification.messageId,
                                    notification?.meta?.reason || 'Reportado'
                                );
                                await modInboxService.markResolved(notification._id);
                                Alert.alert('✅', 'Mensaje eliminado');
                                loadData();
                            } catch (error) {
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
                try {
                    await modInboxService.markResolved(notification._id);
                    loadData();
                } catch (error) {
                    Alert.alert('Error', 'No se pudo resolver');
                }
                break;

            default:
                break;
        }
    };

    const muteUser = async (userId, notificationId, duration) => {
        try {
            await moderationService.muteUser(userId, duration, 'Reportado');
            await modInboxService.markResolved(notificationId);
            Alert.alert('✅', 'Usuario silenciado');
            loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo silenciar');
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
                    </View>
                </View>

                {/* Spacer */}
                <View style={{ height: 12 }} />
            </View>
        );
    }, [stats, search, activeTab, filterStatus, filterPriority]);

    const ItemSeparator = () => <View style={{ height: 12 }} />;

    const renderNotificationCard = ({ item }) => (
        <NotificationCard notification={item} onAction={handleAction} />
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
            <FlatList
                data={Array.isArray(notifications) ? notifications : []}
                renderItem={renderNotificationCard}
                keyExtractor={(item) => item._id}
                ItemSeparatorComponent={ItemSeparator}
                ListHeaderComponent={listHeader}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D32F2F" />
                }
                ListEmptyComponent={
                    <View className="px-4 py-10">
                        <EmptyState
                            icon="notifications-off-outline"
                            message={`No hay notificaciones ${activeTab === 'pending' ? 'pendientes' : ''}`}
                        />
                    </View>
                }
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 24,
                    flexGrow: notifications?.length ? 0 : 1,
                }}
                showsVerticalScrollIndicator={false}
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

function NotificationCard({ notification, onAction }) {
    const { type, title, preview, priority, status, meta, createdAt, reportId } = notification;

    const borderBg = (() => {
        if (priority === 'high') return 'border-red-500 bg-red-50';
        if (priority === 'medium') return 'border-yellow-500 bg-yellow-50';
        return 'border-gray-200 bg-white';
    })();

    const iconName =
        type === 'message_reported'
            ? 'flag'
            : type === 'spam_detected'
                ? 'warning'
                : 'information-circle';

    const iconColor = priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#6B7280';

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    return (
        <View
            className={`p-4 rounded-2xl border-l-4 ${borderBg} ${status === 'unread' ? 'opacity-100' : 'opacity-80'}`}
            style={{
                shadowColor: '#000',
                shadowOpacity: status === 'unread' ? 0.06 : 0.02,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
            }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-2">
                <Ionicons name={iconName} size={18} color={iconColor} />
                <Text className="font-bold text-gray-900 ml-2 flex-1" numberOfLines={1}>
                    {title}
                </Text>
                {status === 'unread' ? <View className="w-2.5 h-2.5 bg-red-500 rounded-full" /> : null}
            </View>

            {/* Preview */}
            {preview ? (
                <Text className="text-gray-700 text-[13px] mb-3" numberOfLines={3}>
                    {preview}
                </Text>
            ) : null}

            {/* Meta row */}
            <View className="flex-row items-center flex-wrap mb-3">
                <Text className="text-[12px] text-gray-400">{timeAgo(createdAt)}</Text>

                {meta?.count > 1 ? (
                    <View className="ml-2 px-2 py-0.5 bg-red-600 rounded-full">
                        <Text className="text-white text-[11px] font-bold">{meta.count} reportes</Text>
                    </View>
                ) : null}

                {priority === 'high' ? (
                    <View className="ml-2 px-2 py-0.5 bg-red-600 rounded-full">
                        <Text className="text-white text-[11px] font-bold">URGENTE</Text>
                    </View>
                ) : null}

                {reportId?.name ? (
                    <Text className="ml-2 text-[12px] text-gray-500" numberOfLines={1}>
                        • {reportId.name}
                    </Text>
                ) : null}
            </View>

            {/* Actions (solo botones) */}
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
                <ActionButton label="Ver" icon="eye-outline" color="blue" onPress={() => onAction('openReport', notification)} />

                {type === 'message_reported' ? (
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
                        <ActionButton
                            label="Chat"
                            icon="chatbubble-ellipses-outline"
                            color="gray"
                            onPress={() => onAction('openChat', notification)}
                        />
                    </>
                ) : null}

                <ActionButton
                    label="Resolver"
                    icon="checkmark-circle-outline"
                    color="green"
                    onPress={() => onAction('resolve', notification)}
                />
            </View>
        </View>
    );
}

function ActionButton({ label, icon, color = 'blue', onPress }) {
    const colors = {
        blue: 'bg-blue-500',
        red: 'bg-red-500',
        green: 'bg-green-500',
        orange: 'bg-orange-500',
        gray: 'bg-gray-600',
    };

    return (
        <TouchableOpacity
            className={`${colors[color]} px-3 py-2 rounded-full flex-row items-center`}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Ionicons name={icon} size={14} color="white" />
            <Text className="text-white text-[12px] font-semibold ml-1">{label}</Text>
        </TouchableOpacity>
    );
}
