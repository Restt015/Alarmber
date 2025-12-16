import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import ReportListItem from '../../../components/admin/ReportListItem';
import adminService from '../../../services/adminService';

// Filter configurations with visual identity
const FILTER_CONFIGS = {
    all: {
        id: 'all',
        label: 'Todos',
        icon: 'apps',
        color: '#1976D2',
        bgColor: '#E3F2FD',
        subtitle: 'Vista completa',
        emptyMessage: 'No hay reportes',
        query: {}
    },
    pending: {
        id: 'pending',
        label: 'Pendientes',
        icon: 'time',
        color: '#FF9800',
        bgColor: '#FFF3E0',
        subtitle: 'Esperando validación',
        emptyMessage: 'No hay reportes pendientes',
        query: { validated: false }
    },
    active: {
        id: 'active',
        label: 'Activos',
        icon: 'radio-button-on',
        color: '#F44336',
        bgColor: '#FFEBEE',
        subtitle: 'En búsqueda activa',
        emptyMessage: 'No hay reportes activos',
        query: { validated: true, status: 'active' }
    },
    followup: {
        id: 'followup',
        label: 'Seguimiento',
        icon: 'trending-up',
        color: '#9C27B0',
        bgColor: '#F3E5F5',
        subtitle: 'Requieren atención',
        emptyMessage: 'No hay reportes en seguimiento',
        query: { validated: true, needFollowUp: true }
    },
    closed: {
        id: 'closed',
        label: 'Cerrados',
        icon: 'checkmark-done-circle',
        color: '#4CAF50',
        bgColor: '#E8F5E9',
        subtitle: 'Historial completo',
        emptyMessage: 'No hay reportes cerrados',
        query: { validated: true, status: 'closed,resolved' }
    }
};

export default function UnifiedReportsView() {
    const params = useLocalSearchParams();
    const initialFilter = params.filter || 'all';

    const [activeFilter, setActiveFilter] = useState(initialFilter);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');

    const currentConfig = FILTER_CONFIGS[activeFilter];

    useEffect(() => {
        loadReports(1, true);
    }, [activeFilter, search]);

    const loadReports = async (pageNum = 1, shouldReset = false) => {
        try {
            if (shouldReset) setLoading(true);

            const queryParams = {
                page: pageNum,
                limit: 10,
                ...currentConfig.query
            };

            if (search.trim()) {
                queryParams.search = search.trim();
            }

            const response = await adminService.getAllReports(queryParams);
            // Axios interceptor already unwraps response.data, so response IS the backend object
            const newReports = response.data || []; // response.data is the reports array
            const pagination = response.pagination || { totalPages: 1 };

            if (shouldReset) {
                setReports(newReports);
            } else {
                setReports(prev => [...prev, ...newReports]);
            }

            setHasMore(pageNum < pagination.totalPages);
            setPage(pageNum);

        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadReports(1, true);
    }, [activeFilter, search]);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadReports(page + 1, false);
        }
    }, [loading, hasMore, page]);

    const handleValidateReport = async (reportId) => {
        try {
            await adminService.validateReport(reportId);
            loadReports(1, true);
        } catch (error) {
            console.error('Error validating report:', error);
        }
    };

    const handleFilterChange = (filterId) => {
        setActiveFilter(filterId);
        setSearch('');
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* iOS-Style Native Header */}
            <View
                className="bg-white border-b border-gray-100"
                style={{
                    paddingTop: Platform.OS === 'ios' ? 50 : 12,
                    paddingBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}
            >
                {/* Top Bar with Back Button */}
                <View className="px-4 flex-row items-center mb-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>

                    <View className="flex-1">
                        <Text
                            className="text-gray-900 font-semibold"
                            style={{ fontSize: 28, letterSpacing: -0.5, fontWeight: '700' }}
                        >
                            Reportes
                        </Text>
                    </View>

                    {/* Create Report Button */}
                    <TouchableOpacity
                        onPress={() => router.push('/admin/reports/create')}
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: '#D32F2F' }}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar - iOS Style */}
                <View className="px-4 mb-3">
                    <View
                        className="flex-row items-center rounded-xl px-3 py-2"
                        style={{ backgroundColor: 'rgba(142, 142, 147, 0.12)' }}
                    >
                        <Ionicons name="search" size={18} color="#8E8E93" />
                        <TextInput
                            className="flex-1 ml-2 text-[16px]"
                            placeholder="Buscar reportes..."
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor="#8E8E93"
                            style={{ color: '#000' }}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#8E8E93" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Tabs - iOS Style */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {Object.values(FILTER_CONFIGS).map((config) => (
                        <TouchableOpacity
                            key={config.id}
                            onPress={() => handleFilterChange(config.id)}
                            className="mr-2 px-4 py-2 rounded-full flex-row items-center"
                            style={{
                                backgroundColor: activeFilter === config.id ? config.color : 'rgba(142, 142, 147, 0.12)'
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={config.icon}
                                size={16}
                                color={activeFilter === config.id ? '#FFF' : '#8E8E93'}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                className="font-semibold text-[14px]"
                                style={{
                                    color: activeFilter === config.id ? '#FFF' : '#8E8E93'
                                }}
                            >
                                {config.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Badge - Dynamic based on filter */}
            <View
                className="px-4 py-2"
                style={{ backgroundColor: currentConfig.bgColor }}
            >
                <View className="flex-row items-center">
                    <View
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: currentConfig.color }}
                    />
                    <Text
                        className="text-[13px] font-semibold"
                        style={{ color: currentConfig.color }}
                    >
                        {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}
                    </Text>
                </View>
            </View>

            {/* Reports List */}
            {loading && page === 1 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color={currentConfig.color} />
                    <Text className="mt-3 text-gray-500 text-[14px]">Cargando...</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="px-4 mb-3">
                            <ReportListItem
                                report={item}
                                onPress={() => router.push(`/admin/reports/${item._id}`)}
                                onValidate={handleValidateReport}
                                currentFilter={activeFilter}
                                showActions={true}
                            />
                        </View>
                    )}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: currentConfig.bgColor }}
                            >
                                <Ionicons
                                    name={currentConfig.icon}
                                    size={40}
                                    color={currentConfig.color}
                                />
                            </View>
                            <Text className="text-gray-400 text-[16px] font-medium">
                                {currentConfig.emptyMessage}
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" color={currentConfig.color} />
                            </View>
                        ) : null
                    }
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
                />
            )}
        </View>
    );
}
