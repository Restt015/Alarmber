import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../components/admin/AdminHeader';
import ErrorState from '../../components/shared/ErrorState';
import SkeletonCard from '../../components/shared/SkeletonCard';
import { theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

export default function ValidationQueue() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [reports, setReports] = useState([]);
    const [actionLoading, setActionLoading] = useState(null);

    const loadPendingReports = useCallback(async () => {
        try {
            setError(null);
            const response = await adminService.getAllReports({ validated: false });
            setReports(response.data || []);
        } catch (err) {
            console.error('Error loading pending reports:', err);
            setError(err.message || 'Error al cargar reportes pendientes');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadPendingReports();
        }
    }, [isAuthenticated, user, loadPendingReports]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadPendingReports();
    };

    const handleApprove = async (reportId, reportName) => {
        Alert.alert(
            'Validar Reporte',
            `¿Confirmas validar el reporte de "${reportName}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Validar',
                    style: 'default',
                    onPress: async () => {
                        try {
                            setActionLoading(reportId);
                            await adminService.validateReport(reportId);
                            setReports(prev => prev.filter(r => r._id !== reportId));
                            Alert.alert('✅ Validado', 'El reporte ha sido publicado.');
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo validar el reporte');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (reportId, reportName) => {
        Alert.alert(
            'Rechazar Reporte',
            `¿Estás seguro de rechazar el reporte de "${reportName}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Rechazar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(reportId);
                            await adminService.updateReportStatus(reportId, 'closed');
                            setReports(prev => prev.filter(r => r._id !== reportId));
                            Alert.alert('Rechazado', 'El reporte ha sido rechazado.');
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo rechazar el reporte');
                        } finally {
                            setActionLoading(null);
                        }
                    }
                }
            ]
        );
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'Sin fecha';
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Cola de Validación" showBack />
                <View className="px-5 pt-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            </View>
        );
    }

    if (error && reports.length === 0) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Cola de Validación" showBack />
                <ErrorState
                    title="Error al cargar"
                    message={error}
                    onRetry={loadPendingReports}
                />
            </View>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Cola de Validación" showBack />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary.main]}
                        tintColor={theme.colors.primary.main}
                    />
                }
            >
                {/* Stats Banner */}
                <View
                    className="mx-5 mt-4 p-4 rounded-2xl flex-row items-center"
                    style={{ backgroundColor: theme.colors.primary.light }}
                >
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: theme.colors.primary.main }}
                    >
                        <Ionicons name="hourglass" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[28px] font-black" style={{ color: theme.colors.primary.main }}>
                            {reports.length}
                        </Text>
                        <Text className="text-[14px]" style={{ color: theme.colors.gray[600] }}>
                            Reportes pendientes de validación
                        </Text>
                    </View>
                </View>

                {/* Reports List */}
                <View className="px-5 mt-6">
                    {reports.length > 0 ? (
                        reports.map((report) => (
                            <View
                                key={report._id}
                                className="bg-white rounded-2xl mb-4 overflow-hidden"
                                style={theme.shadows.card}
                            >
                                {/* Report Header */}
                                <TouchableOpacity
                                    onPress={() => router.push(`/admin/reports/${report._id}`)}
                                    className="p-4 border-b"
                                    style={{ borderBottomColor: theme.colors.gray[200] }}
                                >
                                    <View className="flex-row items-start">
                                        {/* Photo placeholder */}
                                        <View
                                            className="w-16 h-16 rounded-xl mr-4 items-center justify-center"
                                            style={{ backgroundColor: theme.colors.gray[200] }}
                                        >
                                            {report.photo ? (
                                                <View className="w-16 h-16 rounded-xl overflow-hidden">
                                                    {/* Image would go here */}
                                                    <View className="w-full h-full bg-gray-300" />
                                                </View>
                                            ) : (
                                                <Ionicons name="person" size={28} color={theme.colors.gray[400]} />
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-[16px] font-bold" style={{ color: theme.colors.gray[900] }}>
                                                {report.name}
                                            </Text>
                                            <Text className="text-[13px] mt-1" style={{ color: theme.colors.gray[600] }}>
                                                {report.age} años • {report.gender === 'male' ? 'Masculino' : 'Femenino'}
                                            </Text>
                                            <View className="flex-row items-center mt-2">
                                                <Ionicons name="time-outline" size={14} color={theme.colors.gray[400]} />
                                                <Text className="text-[12px] ml-1" style={{ color: theme.colors.gray[500] }}>
                                                    {formatDate(report.createdAt)}
                                                </Text>
                                            </View>
                                        </View>

                                        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
                                    </View>

                                    {/* Reporter info */}
                                    {report.reportedBy && (
                                        <View
                                            className="flex-row items-center mt-3 p-2 rounded-lg"
                                            style={{ backgroundColor: theme.colors.gray[100] }}
                                        >
                                            <Ionicons name="person-circle" size={18} color={theme.colors.gray[500]} />
                                            <Text className="text-[12px] ml-2" style={{ color: theme.colors.gray[600] }}>
                                                Reportado por: {report.reportedBy.name}
                                            </Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                {/* Action Buttons */}
                                <View className="flex-row p-3" style={{ backgroundColor: theme.colors.gray[50] }}>
                                    {/* Reject Button */}
                                    <TouchableOpacity
                                        onPress={() => handleReject(report._id, report.name)}
                                        disabled={actionLoading === report._id}
                                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl mr-2"
                                        style={{
                                            backgroundColor: theme.colors.gray[200],
                                            opacity: actionLoading === report._id ? 0.5 : 1
                                        }}
                                    >
                                        <Ionicons name="close" size={20} color={theme.colors.gray[700]} />
                                        <Text
                                            className="font-bold ml-2 text-[14px]"
                                            style={{ color: theme.colors.gray[700] }}
                                        >
                                            Rechazar
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Approve Button */}
                                    <TouchableOpacity
                                        onPress={() => handleApprove(report._id, report.name)}
                                        disabled={actionLoading === report._id}
                                        className="flex-1 flex-row items-center justify-center py-3 rounded-xl ml-2"
                                        style={{
                                            backgroundColor: theme.colors.success.main,
                                            opacity: actionLoading === report._id ? 0.5 : 1
                                        }}
                                    >
                                        <Ionicons name="checkmark" size={20} color="white" />
                                        <Text className="text-white font-bold ml-2 text-[14px]">
                                            Validar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="py-16 items-center">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: theme.colors.success.light }}
                            >
                                <Ionicons name="checkmark-circle" size={40} color={theme.colors.success.main} />
                            </View>
                            <Text className="text-[18px] font-bold" style={{ color: theme.colors.gray[900] }}>
                                ¡Todo validado!
                            </Text>
                            <Text className="text-[14px] mt-2" style={{ color: theme.colors.gray[500] }}>
                                No hay reportes pendientes
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
