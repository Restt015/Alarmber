import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorState from '../../components/shared/ErrorState';
import ImageWithFallback from '../../components/shared/ImageWithFallback';
import ReportStatusBadge from '../../components/shared/ReportStatusBadge';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import ValidationBadge from '../../components/shared/ValidationBadge';
import { useAuth } from '../../context/AuthContext';
import reportService from '../../services/reportService';

export default function MyReportsScreen() {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('all');

    useEffect(() => {
        loadMyReports();
    }, []);

    // Reload when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadMyReports();
        }, [])
    );

    const loadMyReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await reportService.getMyReports();
            console.log('✅ My reports loaded:', response.data?.length || 0);
            setReports(response.data || []);
        } catch (err) {
            console.error('❌ Error loading my reports:', err);
            setError(err.message || 'Error al cargar tus reportes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadMyReports();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Filter reports based on current filter - SHOW ALL STATES
    const getFilteredReports = () => {
        switch (currentFilter) {
            case 'active':
                return reports.filter(r => r.validated && (r.status === 'active' || r.status === 'investigating'));
            case 'finished':
                return reports.filter(r => r.status === 'resolved' || r.status === 'closed');
            case 'all':
            default:
                return reports; // Show ALL reports, including pending (not validated)
        }
    };

    const filteredReports = getFilteredReports();

    // Get stats for each category
    const stats = {
        active: reports.filter(r => r.validated && (r.status === 'active' || r.status === 'investigating')).length,
        finished: reports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
        all: reports.length // Total count including pending
    };

    const ReportCard = ({ report }) => {
        return (
            <TouchableOpacity
                onPress={() => router.push(`/alert/${report._id}`)}
                className="bg-white rounded-2xl mb-3 overflow-hidden border border-gray-100"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3
                }}
                activeOpacity={0.7}
            >
                <View className="flex-row">
                    {/* Photo with loading and fallback */}
                    <ImageWithFallback
                        uri={report.photo}
                        className="w-28 h-28"
                        fallbackIcon="person-outline"
                        fallbackIconSize={40}
                        fallbackIconColor="#BDBDBD"
                    />

                    {/* Info */}
                    <View className="flex-1 p-4">
                        <View className="flex-row items-start justify-between mb-2">
                            <Text className="text-gray-900 font-bold text-[17px] flex-1" numberOfLines={1}>
                                {report.name}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-2">
                            <Ionicons name="calendar-outline" size={14} color="#757575" />
                            <Text className="text-gray-500 text-[13px] ml-1">
                                {formatDate(report.createdAt)}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Ionicons name="location-outline" size={14} color="#757575" />
                            <Text className="text-gray-600 text-[13px] ml-1 flex-1" numberOfLines={1}>
                                {report.lastLocation}
                            </Text>
                        </View>

                        <View className="flex-row items-center">
                            <View className="mr-2">
                                <ValidationBadge validated={report.validated} size="small" />
                            </View>
                            <ReportStatusBadge status={report.status} size="small" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Loading state with skeletons
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="px-5 pt-8 pb-4 bg-white border-b border-gray-100">
                    <Text className="text-[28px] font-bold text-gray-900">Mis Reportes</Text>
                </View>
                <View className="px-5 pt-4">
                    <SkeletonList count={4} />
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (error && reports.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="px-5 pt-8 pb-4 bg-white border-b border-gray-100">
                    <Text className="text-[28px] font-bold text-gray-900">Mis Reportes</Text>
                </View>
                <ErrorState
                    title="Error al cargar reportes"
                    message={error}
                    onRetry={loadMyReports}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-5 pt-8 pb-4 bg-white border-b border-gray-100">
                <Text className="text-[28px] font-bold text-gray-900 mb-2">Mis Reportes</Text>
                <Text className="text-gray-500 text-[14px]">
                    {stats.all} {stats.all === 1 ? 'reporte publicado' : 'reportes publicados'}
                </Text>
            </View>

            {/* Filter Tabs - NO PENDING TAB */}
            <View className="bg-white px-5 py-3 border-b border-gray-100">
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => setCurrentFilter('active')}
                        className={`px-4 py-2 rounded-full mr-2 ${currentFilter === 'active' ? 'bg-red-600' : 'bg-gray-100'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="radio-button-on"
                                size={16}
                                color={currentFilter === 'active' ? '#FFF' : '#757575'}
                                style={{ marginRight: 4 }}
                            />
                            <Text className={`font-semibold text-[14px] ${currentFilter === 'active' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Activos ({stats.active})
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setCurrentFilter('finished')}
                        className={`px-4 py-2 rounded-full mr-2 ${currentFilter === 'finished' ? 'bg-green-600' : 'bg-gray-100'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="checkmark-done"
                                size={16}
                                color={currentFilter === 'finished' ? '#FFF' : '#757575'}
                                style={{ marginRight: 4 }}
                            />
                            <Text className={`font-semibold text-[14px] ${currentFilter === 'finished' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Finalizados ({stats.finished})
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setCurrentFilter('all')}
                        className={`px-4 py-2 rounded-full ${currentFilter === 'all' ? 'bg-blue-600' : 'bg-gray-100'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name="list"
                                size={16}
                                color={currentFilter === 'all' ? '#FFF' : '#757575'}
                                style={{ marginRight: 4 }}
                            />
                            <Text className={`font-semibold text-[14px] ${currentFilter === 'all' ? 'text-white' : 'text-gray-600'
                                }`}>
                                Todos ({stats.all})
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Reports List */}
            <FlatList
                data={filteredReports}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => <View className="px-5"><ReportCard report={item} /></View>}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#D32F2F']}
                        tintColor="#D32F2F"
                    />
                }
                contentContainerStyle={{ paddingTop: 12, paddingBottom: 100, flexGrow: 1 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="document-text-outline" size={40} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-900 text-[18px] font-bold mb-2">
                            {currentFilter === 'active' && 'No tienes reportes activos'}
                            {currentFilter === 'finished' && 'No tienes reportes finalizados'}
                            {currentFilter === 'all' && 'No tienes reportes creados'}
                        </Text>
                        <Text className="text-gray-500 text-[14px] text-center px-10 mb-6">
                            {currentFilter === 'active' && 'Tus reportes validados aparecerán aquí'}
                            {currentFilter === 'finished' && 'Los reportes cerrados aparecerán aquí'}
                            {currentFilter === 'all' && 'Crea tu primer reporte para comenzar'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/report/create')}
                            className="bg-red-600 px-6 py-3 rounded-xl"
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="add-circle-outline" size={20} color="white" />
                                <Text className="text-white font-bold ml-2">Crear Reporte</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
