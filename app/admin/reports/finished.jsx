import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import ReportListItem from '../../../components/admin/ReportListItem';
import adminService from '../../../services/adminService';

export default function FinishedReports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, resolved, closed

    useEffect(() => {
        loadReports(1, true);
    }, [filterStatus, search]);

    const loadReports = async (pageNum = 1, shouldReset = false) => {
        try {
            if (shouldReset) setLoading(true);

            const queryParams = {
                page: pageNum,
                limit: 10,
                validated: true
            };

            // Filter by status
            if (filterStatus === 'resolved') {
                queryParams.status = 'resolved';
            } else if (filterStatus === 'closed') {
                queryParams.status = 'closed';
            } else {
                queryParams.status = 'closed,resolved';
            }

            // Add search
            if (search.trim()) {
                queryParams.search = search.trim();
            }

            const response = await adminService.getAllReports(queryParams);

            const newReports = response.data || [];
            const pagination = response.pagination || { totalPages: 1 };

            if (shouldReset) {
                setReports(newReports);
            } else {
                setReports(prev => [...prev, ...newReports]);
            }

            setHasMore(pageNum < pagination.totalPages);
            setPage(pageNum);

        } catch (error) {
            console.error('Error loading finished reports:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadReports(1, true);
    }, [filterStatus, search]);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadReports(page + 1, false);
        }
    }, [loading, hasMore, page]);

    const FilterChip = ({ label, value, isActive, icon }) => (
        <TouchableOpacity
            onPress={() => setFilterStatus(value)}
            className={`px-4 py-2.5 rounded-full mr-2 flex-row items-center ${isActive ? 'bg-green-600' : 'bg-white border border-gray-200'
                }`}
            activeOpacity={0.7}
        >
            {icon && (
                <Ionicons
                    name={icon}
                    size={16}
                    color={isActive ? 'white' : '#6B7280'}
                    style={{ marginRight: 6 }}
                />
            )}
            <Text className={`text-[13px] font-bold ${isActive ? 'text-white' : 'text-gray-600'
                }`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const stats = {
        total: reports.length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        closed: reports.filter(r => r.status === 'closed').length
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Custom Header with Green Theme */}
            <View
                className="pt-12 pb-4 px-5 border-b border-green-100"
                style={{ backgroundColor: '#4CAF50' }}
            >
                <View className="flex-row items-center mb-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-3"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="checkmark-done-circle" size={20} color="white" />
                            <Text className="text-white/80 text-[11px] font-semibold ml-2 uppercase tracking-wider">
                                Historial Completo
                            </Text>
                        </View>
                        <Text className="text-white text-[22px] font-bold">
                            Reportes Finalizados
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white/20 backdrop-blur rounded-xl px-4 py-3">
                    <Ionicons name="search" size={20} color="white" />
                    <TextInput
                        className="flex-1 ml-2 text-white text-[14px]"
                        placeholder="Buscar en historial..."
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor="rgba(255,255,255,0.7)"
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={20} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Stats Summary with Green Theme */}
            <View className="bg-white px-5 py-4 border-b border-gray-100">
                <View className="flex-row justify-around">
                    <View className="items-center">
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                        </View>
                        <Text className="text-[24px] font-bold text-green-600">{stats.resolved}</Text>
                        <Text className="text-[11px] text-gray-500 uppercase tracking-wide">Resueltos</Text>
                    </View>
                    <View className="items-center">
                        <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="folder" size={24} color="#757575" />
                        </View>
                        <Text className="text-[24px] font-bold text-gray-600">{stats.closed}</Text>
                        <Text className="text-[11px] text-gray-500 uppercase tracking-wide">Cerrados</Text>
                    </View>
                    <View className="items-center">
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="archive" size={24} color="#4CAF50" />
                        </View>
                        <Text className="text-[24px] font-bold text-green-600">{stats.total}</Text>
                        <Text className="text-[11px] text-gray-500 uppercase tracking-wide">Total</Text>
                    </View>
                </View>
            </View>

            {/* Filters */}
            <View className="bg-white px-5 py-3 border-b border-gray-100">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={[
                        { label: 'Todos', value: 'all', icon: 'list' },
                        { label: 'Resueltos', value: 'resolved', icon: 'checkmark-circle' },
                        { label: 'Cerrados', value: 'closed', icon: 'folder' },
                    ]}
                    keyExtractor={item => item.value}
                    renderItem={({ item }) => (
                        <FilterChip
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                            isActive={filterStatus === item.value}
                        />
                    )}
                />
            </View>

            {/* Results Count */}
            <View className="px-5 py-2 bg-green-50">
                <Text className="text-green-700 text-[13px] font-semibold">
                    ✅ {reports.length} {reports.length === 1 ? 'caso finalizado' : 'casos finalizados'}
                </Text>
            </View>

            {loading && page === 1 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="px-5 mb-3">
                            <ReportListItem
                                report={item}
                                onPress={() => router.push(`/admin/reports/${item._id}`)}
                                showStatus={true}
                            />
                        </View>
                    )}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Ionicons name="checkmark-done-circle-outline" size={64} color="#E0E0E0" />
                            <Text className="text-gray-400 mt-4">No hay reportes finalizados</Text>
                        </View>
                    }
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" color="#4CAF50" />
                            </View>
                        ) : null
                    }
                    contentContainerStyle={{ paddingBottom: 20, paddingTop: 10 }}
                />
            )}
        </View>
    );
}
