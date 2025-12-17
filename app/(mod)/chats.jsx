import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../components/mod/EmptyState';
import chatService from '../../services/chatService';
import modChatsService from '../../services/modChatsService';

export default function ModChatsScreen() {
    const router = useRouter();

    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filters, setFilters] = useState({});

    const debounceReloadRef = useRef(null);

    const normalizeId = (v) => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        if (typeof v === 'number') return String(v);
        if (typeof v === 'object') return v._id?.toString?.() ?? v.toString?.() ?? '';
        return String(v);
    };

    const getReportId = (chat) => normalizeId(chat?.reportId?._id ?? chat?.reportId);

    const formatTimeAgo = (date) => {
        if (!date) return '';
        const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (Number.isNaN(seconds) || seconds < 0) return '';
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const loadChats = useCallback(async ({ silent = false } = {}) => {
        try {
            if (!silent) setLoading(true);
            const res = await modChatsService.getActiveChats();
            const list = res?.data ?? [];
            setChats(Array.isArray(list) ? list : []);
        } catch (e) {
            console.error('Failed to load chats:', e);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChats();
    }, [loadChats]);

    useFocusEffect(
        useCallback(() => {
            loadChats({ silent: true });
        }, [loadChats])
    );

    // Realtime
    useEffect(() => {
        const unsubscribe = chatService.subscribe((event) => {
            if (event?.action !== 'mod:chat:activity') return;
            const payload = event?.payload;
            if (!payload) return;

            const reportId = normalizeId(payload.reportId);
            if (!reportId) return;

            setChats((prev) => {
                const list = Array.isArray(prev) ? prev : [];
                const idx = list.findIndex((c) => getReportId(c) === reportId);

                if (idx >= 0) {
                    const existing = list[idx];
                    const updated = {
                        ...existing,
                        lastMessagePreview: payload.lastMessagePreview ?? existing.lastMessagePreview,
                        lastMessageAt: payload.lastMessageAt ?? existing.lastMessageAt,
                        unreadCount: Math.min((existing.unreadCount ?? 0) + 1, 999),
                        urgent: typeof payload.urgent === 'boolean' ? payload.urgent : existing.urgent,
                        hasReports:
                            typeof payload.hasReports === 'boolean' ? payload.hasReports : existing.hasReports,
                        chatStatus: payload.chatStatus ?? existing.chatStatus,
                    };

                    const next = [...list];
                    next.splice(idx, 1);
                    return [updated, ...next];
                }

                if (debounceReloadRef.current) clearTimeout(debounceReloadRef.current);
                debounceReloadRef.current = setTimeout(() => {
                    loadChats({ silent: true });
                }, 400);

                return list;
            });
        });

        return () => {
            if (debounceReloadRef.current) clearTimeout(debounceReloadRef.current);
            if (typeof unsubscribe === 'function') unsubscribe();
        };
    }, [loadChats]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadChats({ silent: true });
        setRefreshing(false);
    };

    const openChat = (chat) => {
        const rid = getReportId(chat);
        if (!rid) return;
        router.push(`/(mod)/chat/${rid}`);
    };

    const toggleFilter = (key, value) => {
        setFilters((prev) => {
            if (prev[key] === value) {
                const next = { ...prev };
                delete next[key];
                return next;
            }
            return { ...prev, [key]: value };
        });
    };

    // Apply filters
    const filteredChats = chats.filter(chat => {
        if (filters.unread === 'true' && (chat.unreadCount || 0) === 0) return false;
        if (filters.urgent === 'true' && !chat.urgent) return false;
        return true;
    });

    const ItemSeparator = () => <View style={{ height: 12 }} />;

    const renderChatCard = ({ item }) => {
        const unread = item?.unreadCount ?? 0;

        return (
            <TouchableOpacity
                onPress={() => openChat(item)}
                activeOpacity={0.85}
                className="bg-white rounded-2xl border border-gray-100 p-4"
            >
                <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1 pr-3">
                        <Text className="text-[16px] font-bold text-gray-900" numberOfLines={1}>
                            {item.reportTitle || 'Reporte'}
                        </Text>

                        <Text className="text-[13px] text-gray-600 mt-1" numberOfLines={2}>
                            {item.lastMessagePreview || 'Sin mensajes'}
                        </Text>
                    </View>

                    {unread > 0 && (
                        <View className="bg-red-600 rounded-full px-2.5 min-w-[24px] h-[24px] items-center justify-center">
                            <Text className="text-white text-[11px] font-bold">
                                {unread > 99 ? '99+' : unread}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center">
                        <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                        <Text className="text-[12px] text-gray-400 ml-1">
                            {formatTimeAgo(item.lastMessageAt)}
                        </Text>
                    </View>

                    <View className="flex-row items-center" style={{ gap: 6 }}>
                        {item.urgent && (
                            <View className="bg-orange-100 px-2 py-1 rounded-full">
                                <Text className="text-orange-700 text-[11px] font-bold">URGENTE</Text>
                            </View>
                        )}

                        {item.hasReports && (
                            <View className="bg-red-100 px-2 py-1 rounded-full flex-row items-center">
                                <Ionicons name="flag" size={12} color="#EF4444" />
                                <Text className="text-red-700 text-[11px] font-bold ml-1">REPORTADO</Text>
                            </View>
                        )}

                        {item.chatStatus === 'slowmode' && (
                            <View className="bg-yellow-100 px-2 py-1 rounded-full">
                                <Text className="text-yellow-700 text-[11px] font-bold">LENTO</Text>
                            </View>
                        )}

                        {item.chatStatus === 'closed' && (
                            <View className="bg-gray-200 px-2 py-1 rounded-full">
                                <Text className="text-gray-700 text-[11px] font-bold">CERRADO</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#D32F2F" />
                    <Text className="text-gray-500 mt-4">Cargando chats...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const total = filteredChats.length;
    const unreadTotal = filteredChats.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Fixed Header */}
            <View className="bg-white border-b border-gray-200 px-4 pt-2 pb-3">
                <View className="mb-3">
                    <Text className="text-[22px] font-bold text-gray-900">Chats activos</Text>
                    <Text className="text-[13px] text-gray-500 mt-0.5">
                        {total > 0
                            ? unreadTotal > 0
                                ? `${total} conversaciones • ${unreadTotal} sin leer`
                                : `${total} conversaciones`
                            : 'Sin conversaciones por ahora'}
                    </Text>
                </View>

                {/* Filters: ONLY 2 */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 0 }}
                >
                    <FilterChip
                        label="Sin leer"
                        active={filters.unread === 'true'}
                        onPress={() => toggleFilter('unread', 'true')}
                    />
                    <FilterChip
                        label="Urgentes"
                        active={filters.urgent === 'true'}
                        onPress={() => toggleFilter('urgent', 'true')}
                    />
                </ScrollView>
            </View>

            {/* List */}
            <FlatList
                data={filteredChats}
                renderItem={renderChatCard}
                keyExtractor={(item) => getReportId(item) || `chat-${Math.random()}`}
                ItemSeparatorComponent={ItemSeparator}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D32F2F" />
                }
                ListEmptyComponent={
                    <View className="flex-1 px-4 py-10">
                        <EmptyState icon="chatbubbles-outline" message="No hay chats activos" />
                    </View>
                }
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 16,
                    paddingBottom: 24,
                    flexGrow: filteredChats?.length ? 0 : 1,
                }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

function FilterChip({ label, active, onPress }) {
    return (
        <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${active ? 'bg-red-500' : 'bg-gray-200'}`}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text className={`text-[13px] font-semibold ${active ? 'text-white' : 'text-gray-700'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
