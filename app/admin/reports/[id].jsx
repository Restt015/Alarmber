import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import adminService from '../../../services/adminService';
import reportService from '../../../services/reportService';

export default function AdminReportDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        loadReport();
    }, [id]);

    const loadReport = async () => {
        try {
            // Re-using public getReportById since it doesn't filter by validation
            // ideally we should have a specific admin endpoint or use adminService if implemented
            const response = await reportService.getReportById(id);
            setReport(response.data);
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar el reporte");
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async () => {
        Alert.alert(
            "Confirmar Validación",
            "¿Estás seguro de validar este reporte? Será visible para todos los usuarios.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Validar",
                    onPress: async () => {
                        try {
                            setValidating(true);
                            await adminService.validateReport(id, notes);
                            Alert.alert("Éxito", "Reporte validado correctamente", [
                                { text: "OK", onPress: () => router.replace('/admin') }
                            ]);
                        } catch (error) {
                            Alert.alert("Error", "No se pudo validar el reporte");
                        } finally {
                            setValidating(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async () => {
        Alert.alert(
            "Eliminar Reporte",
            "Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        // Implement delete logic here if needed
                        Alert.alert("Info", "Funcionalidad de eliminar pendiente de implementar");
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#D32F2F" />
            </View>
        );
    }

    if (!report) return null;

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Validar Reporte" />

            <ScrollView className="flex-1 px-5 pt-5">

                {/* Status Badge */}
                <View className={`self-start px-3 py-1 rounded-full mb-4 ${report.validated ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[12px] font-bold ${report.validated ? 'text-green-700' : 'text-orange-700'}`}>
                        {report.validated ? 'VALIDADO' : 'PENDIENTE DE VALIDACIÓN'}
                    </Text>
                </View>

                {/* Photo */}
                <View className="w-full h-80 bg-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                    {report.photo ? (
                        <Image
                            source={{ uri: report.photo.startsWith('http') ? report.photo : `http://localhost:5000/${report.photo.replace(/\\/g, '/')}` }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Ionicons name="image-outline" size={64} color="#BDBDBD" />
                            <Text className="text-gray-400 mt-2">Sin fotografía</Text>
                        </View>
                    )}
                </View>

                {/* Info Grid */}
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-6">
                    <Text className="text-[22px] font-bold text-gray-900 mb-4">{report.name}</Text>

                    <View className="flex-row flex-wrap">
                        <InfoItem label="Edad" value={`${report.age} años`} width="w-1/2" />
                        <InfoItem label="Ubicación" value={report.lastLocation} width="w-1/2" />
                        <InfoItem label="Vestimenta" value={report.clothing} width="w-full" />
                        <InfoItem label="Características" value={report.description} width="w-full" />
                        {report.circumstances && (
                            <InfoItem label="Circunstancias" value={report.circumstances} width="w-full" />
                        )}
                    </View>
                </View>

                {/* Validation Actions */}
                {!report.validated && (
                    <View className="bg-white rounded-2xl p-5 shadow-sm mb-10">
                        <Text className="font-bold text-gray-900 mb-3">Notas de Validación (Opcional)</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl p-3 h-24 text-gray-700 mb-4"
                            multiline
                            placeholder="Escribe notas internas sobre esta validación..."
                            value={notes}
                            onChangeText={setNotes}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            onPress={handleValidate}
                            disabled={validating}
                            className="bg-green-600 py-4 rounded-xl items-center shadow-md mb-3"
                        >
                            {validating ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-[16px]">APROBAR REPORTE</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            className="bg-red-50 py-4 rounded-xl items-center border border-red-100"
                        >
                            <Text className="text-red-600 font-bold text-[16px]">RECHAZAR / ELIMINAR</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

function InfoItem({ label, value, width }) {
    return (
        <View className={`${width} mb-4 pr-2`}>
            <Text className="text-gray-500 text-[12px] uppercase tracking-wide mb-1">{label}</Text>
            <Text className="text-gray-900 text-[15px] font-semibold">{value}</Text>
        </View>
    );
}
