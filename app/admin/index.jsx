import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../components/admin/AdminHeader';
import DashboardStatCard from '../../components/admin/DashboardStatCard';
import ReportListItem from '../../components/admin/ReportListItem';
import UserPerformanceWidget from '../../components/admin/UserPerformanceWidget';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [pendingReports, setPendingReports] = useState([]);

    // Redirect if not admin
    useEffect(() => {
        if (!loading && (!isAuthenticated || user?.role !== 'admin')) {
            Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
            router.replace('/');
        }
    }, [loading, isAuthenticated, user]);

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            const [statsData, usersData, reportsData] = await Promise.all([
                adminService.getDashboardStats(),
                adminService.getUserStats(),
                adminService.getAllReports({ validated: false, limit: 5 })
            ]);

            setStats(statsData.data);
            setUserStats(usersData.data);
            setPendingReports(reportsData.data.data || []);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Error', 'No se pudieron cargar las estadísticas');
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
            Alert.alert('Éxito', 'Reporte validado correctamente');
            loadDashboardData(); // Reload data
        } catch (error) {
            Alert.alert('Error', 'No se pudo validar el reporte');
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="mt-4 text-gray-600">Cargando dashboard...</Text>
            </View>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Dashboard Admin" />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#D32F2F']} />
                }
            >
                <View className="px-5 mt-4">
                    {/* Stats Cards */}
                    <View className="mb-4">
                        <DashboardStatCard
                            icon="checkmark-circle"
                            title="Reportes Activos"
                            count={stats?.activeReports || 0}
                            subtitle="Validados y en búsqueda"
                            color="#4CAF50"
                            onPress={() => router.push('/admin/reports?status=active&validated=true')}
                        />

                        <DashboardStatCard
                            icon="alert-circle"
                            title="Requieren Seguimiento"
                            count={stats?.needFollowUp || 0}
                            subtitle="Más de 7 días activos"
                            color="#FBC02D"
                            badge={{ text: 'Requiere atención', type: 'warning' }}
                            onPress={() => router.push('/admin/reports?needFollowUp=true')}
                        />

                        <DashboardStatCard
                            icon="eye"
                            title="Pendientes Validación"
                            count={stats?.pendingValidation || 0}
                            subtitle="Esperando revisión"
                            color="#FF9800"
                            onPress={() => router.push('/admin/reports?validated=false')}
                        />

                        <DashboardStatCard
                            icon="archive"
                            title="Cerrados Recientemente"
                            count={stats?.recentlyClosed || 0}
                            subtitle="Últimos 7 días"
                            color="#757575"
                            onPress={() => router.push('/admin/reports?status=closed,resolved')}
                        />
                    </View>

                    {/* User Performance */}
                    {userStats?.topReporters && (
                        <UserPerformanceWidget topReporters={userStats.topReporters} />
                    )}

                    {/* Pending Validation Queue */}
                    <View className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
                                    <Ionicons name="alert" size={20} color="#FF9800" />
                                </View>
                                <Text className="text-[16px] font-bold text-gray-900">
                                    Cola de Validación
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => router.push('/admin/reports?validated=false')}>
                                <Text className="text-red-600 text-[13px] font-bold">
                                    Ver todos
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {pendingReports.length > 0 ? (
                            pendingReports.map((report) => (
                                <ReportListItem
                                    key={report._id}
                                    report={report}
                                    // Navigate to ADMIN validation screen
                                    onPress={() => router.push(`/admin/reports/${report._id}`)}
                                    // Or quick validate
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
            </ScrollView>
        </View>
    );
}
