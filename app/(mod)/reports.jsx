import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../../components/mod/EmptyState';
import useDebounce from '../../hooks/useDebounce';
import modReportsService from '../../services/modReportsService';

export default function ModReportsScreen() {
    const router = useRouter();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filters, setFilters] = useState({});

    const debouncedSetSearch = useDebounce((value) => setDebouncedSearch(value), 400);

    useEffect(() => {
        debouncedSetSearch(search);
    }, [search]);

    useEffect(() => {
        loadReports();
    }, [debouncedSearch, filters]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const response = await modReportsService.getModReports({
                ...filters,
                q: debouncedSearch,
            });

            let list = Array.isArray(response?.data) ? response.data : [];

            // Sort: Urgent first, then by activity (lastMessageAt or createdAt)
            list = list.sort((a, b) => {
                const aUrgent = a?.priority === 'Alta' ? 1 : 0;
                const bUrgent = b?.priority === 'Alta' ? 1 : 0;

                if (aUrgent !== bUrgent) return bUrgent - aUrgent;

                const aTime = new Date(a?.lastMessageAt || a?.createdAt || 0).getTime();
                const bTime = new Date(b?.lastMessageAt || b?.createdAt || 0).getTime();
                return bTime - aTime;
            });

            setReports(list);
        } catch (error) {
            console.error('Failed to load reports:', error);
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
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

    const handleReportPress = (report) => {
        router.push(`/alert/${report._id}`);
    };

    const openChat = (report) => {
        router.push(`/(mod)/chat/${report._id}`);
    };

    const ItemSeparator = () => <View style={{ height: 12 }} />;

    const renderReportCard = ({ item }) => {
        const urgent = item?.priority === 'Alta';
        const status = item?.status || 'Desconocido';
        const hasMessages = (item?.activeChatCount || 0) > 0;

        return (
            <View className="bg-white rounded-2xl border border-gray-100 p-4">
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-[16px] font-bold text-gray-900 flex-1 pr-3" numberOfLines={1}>
                        {item?.name || 'Reporte'}
                    </Text>

                    {urgent && (
                        <View className="bg-red-600 px-2 py-1 rounded-full">
                            <Text className="text-white text-[11px] font-bold">URGENTE</Text>
                        </View>
                    )}
                </View>

                {/* Description */}
                <Text className="text-gray-600 text-[13px] mb-3" numberOfLines={2}>
                    {item?.description || 'Sin descripción'}
                </Text>

                {/* Badges and actions row */}
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
                        {/* Status badge */}
                        <View className={`px-2 py-1 rounded-full ${status === 'Abierto' ? 'bg-green-100' :
                                status === 'Cerrado' ? 'bg-gray-200' :
                                    'bg-blue-100'
                            }`}>
                            <Text className={`text-[11px] font-bold ${status === 'Abierto' ? 'text-green-700' :
                                    status === 'Cerrado' ? 'text-gray-700' :
                                        'text-blue-700'
                                }`}>
                                {status.toUpperCase()}
                            </Text>
                        </View>

                        {/* Chat count */}
                        {hasMessages && (
                            <View className="bg-blue-100 px-2 py-1 rounded-full flex-row items-center">
                                <Ionicons name="chatbubble" size={12} color="#3B82F6" />
                                <Text className="text-blue-700 text-[11px] font-bold ml-1">
                                    {item.activeChatCount}
                                </Text>
                            </View>
                        )}

                        {/* Chat status */}
                        {item?.chatStatus === 'closed' && (
                            <View className="bg-gray-200 px-2 py-1 rounded-full flex-row items-center">
                                <Ionicons name="lock-closed" size={12} color="#6B7280" />
                                <Text className="text-gray-700 text-[11px] font-bold ml-1">CERRADO</Text>
                            </View>
                        )}

                        {item?.chatStatus === 'slowmode' && (
                            <View className="bg-orange-100 px-2 py-1 rounded-full flex-row items-center">
                                <Ionicons name="time" size={12} color="#F97316" />
                                <Text className="text-orange-700 text-[11px] font-bold ml-1">LENTO</Text>
                            </View>
                        )}
                    </View>

                    {/* Quick action */}
                    {hasMessages && (
                        <TouchableOpacity
                            onPress={() => openChat(item)}
                            activeOpacity={0.8}
                            className="bg-red-600 px-3 py-1.5 rounded-full flex-row items-center"
                        >
                            <Ionicons name="chatbubbles" size={14} color="white" />
                            <Text className="text-white text-[11px] font-bold ml-1">CHAT</Text>
                        </TouchableOpacity>
                    )}

                    {!hasMessages && (
                        <TouchableOpacity
                            onPress={() => handleReportPress(item)}
                            activeOpacity={0.8}
                            className="bg-gray-600 px-3 py-1.5 rounded-full"
                        >
                            <Text className="text-white text-[11px] font-bold">VER</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    const ListHeader = useMemo(() => {
        const total = reports.length;
        const urgent = reports.filter(r => r?.priority === 'Alta').length;

        return (
            <View>
                {/* Filters */}
                <View className="bg-white border-b border-gray-200 pb-3">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 0 }}
                    >
                        <FilterChip
                            label="Urgentes"
                            active={filters.urgent === 'true'}
                            onPress={() => toggleFilter('urgent', 'true')}
                            color="red"
                        />
                        <FilterChip
                            label="Abiertos"
                            active={filters.status === 'Abierto'}
                            onPress={() => toggleFilter('status', 'Abierto')}
                            color="green"
                        />
                        <FilterChip
                            label="Cerrados"
                            active={filters.status === 'Cerrado'}
                            onPress={() => toggleFilter('status', 'Cerrado')}
                            color="gray"
                        />
                    </ScrollView>
                </View>

                <View style={{ height: 8 }} />
            </View>
        );
    }, [search, filters, reports]);

    if (loading && !refreshing && reports.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#D32F2F" />
                    <Text className="text-gray-500 mt-4">Cargando reportes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const total = reports.length;
    const urgent = reports.filter(r => r?.priority === 'Alta').length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Fixed Header */}
            <View className="bg-white border-b border-gray-200 px-4 pt-2 pb-3">
                <View className="flex-row items-center justify-between mb-3">
                    <View>
                        <Text className="text-[22px] font-bold text-gray-900">Reportes</Text>
                        <Text className="text-[13px] text-gray-500 mt-0.5">
                            {total > 0 ? (
                                urgent > 0 ? `${total} reportes • ${urgent} urgentes` : `${total} reportes`
                            ) : 'Sin reportes por ahora'}
                        </Text>
                    </View>
                </View>

                {/* Search */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2.5">
                    <Ionicons name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-900 text-[15px]"
                        placeholder="Buscar reportes..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.8}>
                            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* List */}
            <FlatList
                data={reports}
                renderItem={renderReportCard}
                keyExtractor={(item) => item._id}
                ItemSeparatorComponent={ItemSeparator}
                ListHeaderComponent={ListHeader}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#D32F2F" />
                }
                ListEmptyComponent={
                    <View className="px-4 py-10">
                        <EmptyState
                            icon="document-text-outline"
                            message={search ? 'No se encontraron reportes' : 'No hay reportes'}
                        />
                    </View>
                }
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingTop: 8,
                    paddingBottom: 24,
                    flexGrow: reports?.length ? 0 : 1,
                }}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

function FilterChip({ label, active, onPress, color = 'gray' }) {
    const bg = {
        red: active ? 'bg-red-500' : 'bg-gray-200',
        green: active ? 'bg-green-500' : 'bg-gray-200',
        gray: active ? 'bg-gray-600' : 'bg-gray-200',
    };

    const text = active ? 'text-white' : 'text-gray-700';

    return (
        <TouchableOpacity
            className={`mr-2 px-4 py-2 rounded-full ${bg[color]}`}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <Text className={`text-[13px] font-semibold ${text}`}>{label}</Text>
        </TouchableOpacity>
    );
}
