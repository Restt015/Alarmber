import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import ImageWithFallback from '../../../components/shared/ImageWithFallback';
import Loader from '../../../components/shared/Loader';
import ReportStatusBadge from '../../../components/shared/ReportStatusBadge';
import ValidationBadge from '../../../components/shared/ValidationBadge';
import adminService from '../../../services/adminService';
import reportService from '../../../services/reportService';

export default function AdminReportDetail() {
    const params = useLocalSearchParams();
    // Get ID from params - handle both formats
    const reportId = params?.id || params?.['[id]'];

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validating, setValidating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        console.log('📍 [AdminReportDetail] Mounted with params:', params);
        console.log('📍 [AdminReportDetail] Extracted ID:', reportId);

        // Validate ID
        if (!reportId || reportId === '[id]' || reportId === 'undefined' || reportId === 'null') {
            console.error('❌ [AdminReportDetail] Invalid ID:', reportId);
            setError('ID de reporte inválido');
            setLoading(false);
            return;
        }

        // Validate ObjectId format (24 hex characters)
        if (!reportId.match(/^[0-9a-fA-F]{24}$/)) {
            console.error('❌ [AdminReportDetail] Invalid ObjectId format:', reportId);
            setError('Formato de ID inválido');
            setLoading(false);
            return;
        }

        loadReport();
    }, [reportId]);

    const loadReport = async () => {
        if (!reportId) {
            setError('ID no disponible');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            console.log('🔄 [AdminReportDetail] Loading report with ID:', reportId);

            const response = await reportService.getReportById(reportId);

            console.log('📦 [AdminReportDetail] Response received:', response);

            // Validate response structure
            if (!response) {
                throw new Error('No se recibió respuesta del servidor');
            }

            // Check if response is an array (wrong endpoint)
            if (Array.isArray(response)) {
                console.error('❌ [AdminReportDetail] Received array instead of object:', response);
                throw new Error('Error: El servidor devolvió un array en lugar de un objeto');
            }

            // Check if response has success flag
            if (response.success === false) {
                throw new Error(response.message || 'Error al cargar el reporte');
            }

            // Get the report data
            const reportData = response.data || response;

            // Validate report data
            if (!reportData || typeof reportData !== 'object') {
                console.error('❌ [AdminReportDetail] Invalid report data:', reportData);
                throw new Error('Datos del reporte inválidos');
            }

            // Check if it's an array
            if (Array.isArray(reportData)) {
                console.error('❌ [AdminReportDetail] Report data is an array:', reportData);
                throw new Error('Error: Los datos del reporte son un array');
            }

            console.log('✅ [AdminReportDetail] Report loaded successfully:', reportData.name);
            setReport(reportData);

        } catch (error) {
            console.error('❌ [AdminReportDetail] Error loading report:', error);
            console.error('❌ [AdminReportDetail] Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            const errorMessage = error.response?.data?.message
                || error.message
                || 'Error al cargar el reporte';

            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = useCallback(async () => {
        if (!reportId) return;

        try {
            setValidating(true);
            console.log('🔄 [AdminReportDetail] Validating report:', reportId);

            await adminService.validateReport(reportId, notes);

            console.log('✅ [AdminReportDetail] Report validated successfully');
            await loadReport();

        } catch (error) {
            console.error('❌ [AdminReportDetail] Error validating report:', error);
            Alert.alert('Error', 'No se pudo validar el reporte');
        } finally {
            setValidating(false);
        }
    }, [reportId, notes]);

    const handleDelete = useCallback(async () => {
        if (!reportId) return;

        Alert.alert(
            'Confirmar eliminación',
            '¿Estás seguro de que deseas eliminar este reporte?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            console.log('🔄 [AdminReportDetail] Deleting report:', reportId);

                            await reportService.deleteReport(reportId);

                            console.log('✅ [AdminReportDetail] Report deleted successfully');
                            router.replace('/admin');

                        } catch (error) {
                            console.error('❌ [AdminReportDetail] Error deleting report:', error);
                            Alert.alert('Error', 'No se pudo eliminar el reporte');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    }, [reportId]);

    const handleStatusChange = useCallback(async (newStatus) => {
        if (!reportId) return;

        try {
            setUpdatingStatus(true);
            console.log('🔄 [AdminReportDetail] Updating status to:', newStatus);

            await adminService.updateReportStatus(reportId, newStatus);

            console.log('✅ [AdminReportDetail] Status updated successfully');
            await loadReport();

        } catch (error) {
            console.error('❌ [AdminReportDetail] Error updating status:', error);
            Alert.alert('Error', 'No se pudo actualizar el estado');
        } finally {
            setUpdatingStatus(false);
        }
    }, [reportId]);

    // Loading state
    if (loading) {
        return (
            <View className="flex-1 bg-white">
                <AdminHeader title="Detalle del Reporte" showBack={true} />
                <Loader fullScreen message="Cargando reporte..." />
            </View>
        );
    }

    // Error state
    if (error || !report) {
        return (
            <View className="flex-1 bg-white">
                <AdminHeader title="Error" showBack={true} />
                <View className="flex-1 items-center justify-center px-10">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="mt-4 text-red-600 font-bold text-[18px] text-center">
                        {error || 'Reporte no encontrado'}
                    </Text>
                    <Text className="mt-2 text-gray-500 text-[14px] text-center">
                        ID: {reportId}
                    </Text>
                    <View className="mt-6 flex-row">
                        <TouchableOpacity
                            onPress={() => loadReport()}
                            className="bg-purple-600 px-6 py-3 rounded-xl mr-3"
                            activeOpacity={0.7}
                        >
                            <Text className="text-white font-bold">Reintentar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-gray-200 px-6 py-3 rounded-xl"
                            activeOpacity={0.7}
                        >
                            <Text className="text-gray-700 font-bold">Volver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Detalle del Reporte" showBack={true} />

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="px-5 pt-5">
                    {/* Status Badges */}
                    <View className="flex-row items-center justify-between mb-4">
                        <ValidationBadge validated={report.validated} size="medium" />
                        <ReportStatusBadge status={report.status} size="medium" />
                    </View>

                    {/* Photo */}
                    <View className="w-full h-80 rounded-2xl overflow-hidden mb-6 shadow-sm">
                        <ImageWithFallback
                            uri={report.photo}
                            className="w-full h-80"
                            fallbackIcon="image-outline"
                            fallbackIconSize={64}
                            fallbackIconColor="#BDBDBD"
                        />
                    </View>

                    {/* Info Card */}
                    <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                        <Text className="text-[24px] font-bold text-gray-900 mb-4">{report.name || 'Sin nombre'}</Text>

                        <View className="flex-row flex-wrap">
                            <InfoItem label="Edad" value={report.age ? `${report.age} años` : 'N/A'} width="w-1/2" />
                            <InfoItem label="Ubicación" value={report.lastLocation || 'N/A'} width="w-1/2" />
                            <InfoItem label="Vestimenta" value={report.clothing || 'N/A'} width="w-full" />
                            <InfoItem label="Características" value={report.description || 'N/A'} width="w-full" />
                            {report.circumstances && (
                                <InfoItem label="Circunstancias" value={report.circumstances} width="w-full" />
                            )}
                            <InfoItem label="Reportado Por" value={report.reportedBy?.name || 'Anónimo'} width="w-1/2" />
                            <InfoItem label="Contacto" value={report.contactPhone || report.reportedBy?.email || 'N/A'} width="w-1/2" />
                        </View>
                    </View>

                    {/* Status Change Section (for validated reports) */}
                    {report.validated && (
                        <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                            <Text className="font-bold text-gray-900 mb-3 text-[16px]">Cambiar Estado del Reporte</Text>
                            <View className="flex-row flex-wrap">
                                {['active', 'investigating', 'resolved', 'closed'].map((status) => (
                                    <TouchableOpacity
                                        key={status}
                                        onPress={() => handleStatusChange(status)}
                                        disabled={updatingStatus || report.status === status}
                                        className={`px-4 py-3 rounded-xl mr-2 mb-2 ${report.status === status
                                            ? 'bg-purple-600'
                                            : 'bg-gray-100 border border-gray-200'
                                            }`}
                                        activeOpacity={0.7}
                                    >
                                        <Text className={`text-[13px] font-bold ${report.status === status ? 'text-white' : 'text-gray-700'
                                            }`}>
                                            {status === 'active' && '🔴 Activo'}
                                            {status === 'investigating' && '🔍 En Investigación'}
                                            {status === 'resolved' && '✅ Resuelto'}
                                            {status === 'closed' && '📁 Cerrado'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {updatingStatus && (
                                <View className="mt-3 items-center">
                                    <ActivityIndicator size="small" color="#9C27B0" />
                                </View>
                            )}
                        </View>
                    )}

                    {/* Validation Actions */}
                    {!report.validated ? (
                        <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                            <Text className="font-bold text-gray-900 mb-3 text-[16px]">Validar Reporte</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 text-gray-700 mb-4 text-[14px]"
                                multiline
                                placeholder="Notas de validación (opcional)..."
                                value={notes}
                                onChangeText={setNotes}
                                textAlignVertical="top"
                                placeholderTextColor="#9CA3AF"
                            />

                            <TouchableOpacity
                                onPress={handleValidate}
                                disabled={validating}
                                className="bg-green-600 py-4 rounded-xl items-center shadow-md mb-3"
                                activeOpacity={0.8}
                            >
                                {validating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="checkmark-circle" size={20} color="white" />
                                        <Text className="text-white font-bold text-[16px] ml-2">APROBAR REPORTE</Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleDelete}
                                disabled={deleting}
                                className="bg-red-50 py-4 rounded-xl items-center border border-red-100"
                                activeOpacity={0.8}
                            >
                                {deleting ? (
                                    <ActivityIndicator color="#D32F2F" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="trash" size={20} color="#D32F2F" />
                                        <Text className="text-red-600 font-bold text-[16px] ml-2">RECHAZAR / ELIMINAR</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleDelete}
                            disabled={deleting}
                            className="bg-red-50 py-4 rounded-xl items-center border border-red-100 mb-6"
                            activeOpacity={0.8}
                        >
                            {deleting ? (
                                <ActivityIndicator color="#D32F2F" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Ionicons name="trash" size={20} color="#D32F2F" />
                                    <Text className="text-red-600 font-bold text-[16px] ml-2">ELIMINAR REPORTE</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

function InfoItem({ label, value, width }) {
    return (
        <View className={`${width} mb-4 pr-2`}>
            <Text className="text-gray-500 text-[11px] uppercase tracking-wide mb-1 font-semibold">{label}</Text>
            <Text className="text-gray-900 text-[15px]">{value || 'N/A'}</Text>
        </View>
    );
}
