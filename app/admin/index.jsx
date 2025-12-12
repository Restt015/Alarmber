import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../components/admin/AdminHeader';
import DashboardStatCard from '../../components/admin/DashboardStatCard';
import ReportListItem from '../../components/admin/ReportListItem';
import ErrorState from '../../components/shared/ErrorState';
import SkeletonCard from '../../components/shared/SkeletonCard';
import { SkeletonStatRow } from '../../components/shared/SkeletonStatCard';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [pendingReports, setPendingReports] = useState([]);

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            setError(null);
            const [statsData, reportsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getAllReports({ validated: false, limit: 5 })
            ]);

            setStats(statsData.data);
            setPendingReports(reportsData.data || []);
        } catch (err) {
            console.error('Error loading dashboard:', err);
            setError(err.message || 'Error al cargar el dashboard');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadDashboardData();
        }
    }, [isAuthenticated, user]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const handleValidateReport = async (reportId) => {
        try {
            await adminService.validateReport(reportId);
            loadDashboardData();
        } catch (error) {
            console.error('Error validating report:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Dashboard" />
                <View className="px-5 pt-6">
                    {/* Welcome skeleton */}
                    <View className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                    <View className="h-7 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
                    {/* Stat cards skeleton */}
                    <SkeletonStatRow />
                    <SkeletonStatRow />
                    {/* Report cards skeleton */}
                    <View className="mt-4">
                        <View className="h-5 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
                        <SkeletonCard />
                        <SkeletonCard />
                    </View>
                </View>
            </View>
        );
    }

    // Error state
    if (error && !stats) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Dashboard" />
                <ErrorState
                    title="Error al cargar dashboard"
                    message={error}
                    onRetry={loadDashboardData}
                />
            </View>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Dashboard" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#9C27B0']}
                        tintColor="#9C27B0"
                    />
                }
            >
                {/* Welcome Section */}
                <View className="px-5 pt-4 pb-2">
                    <Text className="text-gray-500 text-[13px] mb-1">
                        Bienvenido de nuevo,
                    </Text>
                    <Text className="text-[26px] font-black text-gray-900">
                        {user?.name || 'Administrador'}
                    </Text>
                </View>

                {/* Main Stats Grid - 2x2 */}
                <View className="px-5 mt-4">
                    <View className="flex-row mb-3">
                        <View className="flex-1 mr-2">
                            <DashboardStatCard
                                icon="checkmark-circle"
                                title="Activos"
                                count={stats?.activeReports || 0}
                                subtitle="En búsqueda"
                                color="#4CAF50"
                                onPress={() => router.push('/admin/reports?filter=active')}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <DashboardStatCard
                                icon="time"
                                title="Seguimiento"
                                count={stats?.needFollowUp || 0}
                                subtitle="+7 días activos"
                                color="#FF9800"
                                onPress={() => router.push('/admin/reports?filter=followup')}
                            />
                        </View>
                    </View>

                    <View className="flex-row mb-3">
                        <View className="flex-1 mr-2">
                            <DashboardStatCard
                                icon="alert-circle"
                                title="Pendientes"
                                count={stats?.pendingValidation || 0}
                                subtitle="Sin validar"
                                color="#F44336"
                                badge={stats?.pendingValidation > 0 ? { text: 'Requiere atención', type: 'error' } : null}
                                onPress={() => router.push('/admin/reports?filter=pending')}
                            />
                        </View>
                        <View className="flex-1 ml-2">
                            <DashboardStatCard
                                icon="checkmark-done-circle"
                                title="Cerrados"
                                count={stats?.recentlyClosed || 0}
                                subtitle="Últimos 7 días"
                                color="#757575"
                                onPress={() => router.push('/admin/reports?filter=closed')}
                            />
                        </View>
                    </View>
                </View>

                {/* Quick Access Section */}
                <View className="px-5 mt-2 mb-4">
                    <Text className="text-[18px] font-bold text-gray-900 mb-3">
                        Acceso Rápido
                    </Text>
                    <View className="flex-row">
                        {/* Users Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/users')}
                            className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 mr-2 shadow-lg"
                            style={{
                                backgroundColor: '#1976D2',
                                shadowColor: '#1976D2',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8
                            }}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                                    <Ionicons name="people" size={24} color="white" />
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </View>
                            <Text className="text-white font-bold text-[16px] mb-1">
                                Usuarios
                            </Text>
                            <Text className="text-white/80 text-[12px]">
                                {stats?.totalUsers || 0} registrados
                            </Text>
                        </TouchableOpacity>

                        {/* Finished Reports Card */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/reports/finished')}
                            className="flex-1 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 ml-2 shadow-lg"
                            style={{
                                backgroundColor: '#4CAF50',
                                shadowColor: '#4CAF50',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8
                            }}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                                    <Ionicons name="checkmark-done" size={24} color="white" />
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </View>
                            <Text className="text-white font-bold text-[16px] mb-1">
                                Finalizados
                            </Text>
                            <Text className="text-white/80 text-[12px]">
                                Ver historial
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pending Validation Queue */}
                <View className="px-5 mb-4">
                    <View className="bg-white rounded-2xl border border-red-100 overflow-hidden shadow-sm">
                        {/* Header with gradient */}
                        <View
                            className="p-4 border-b border-red-100"
                            style={{ backgroundColor: '#FFF5F5' }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center mr-3">
                                        <Ionicons name="alert" size={20} color="#F44336" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[16px] font-bold text-gray-900">
                                            Cola de Validación
                                        </Text>
                                        <Text className="text-[12px] text-gray-500 mt-0.5">
                                            Reportes esperando aprobación
                                        </Text>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={() => router.push('/admin/reports?filter=pending')}
                                    className="bg-red-600 px-4 py-2 rounded-full"
                                >
                                    <Text className="text-white text-[12px] font-bold">
                                        Ver todos
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Reports List */}
                        <View className="p-4">
                            {pendingReports.length > 0 ? (
                                pendingReports.map((report) => (
                                    <ReportListItem
                                        key={report._id}
                                        report={report}
                                        onPress={() => router.push(`/admin/reports/${report._id}`)}
                                        onValidate={handleValidateReport}
                                        showActions={true}
                                    />
                                ))
                            ) : (
                                <View className="py-8 items-center">
                                    <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" />
                                    <Text className="text-gray-400 text-[14px] mt-2">
                                        ¡Todo validado!
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
