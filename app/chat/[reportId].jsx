import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ReportChat from "../../components/reports/ReportChat";
import Loader from "../../components/shared/Loader";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";
import { resolveAssetUrl } from "../../utils/assetUrl";

export default function ReportChatScreen() {
  const { reportId } = useLocalSearchParams();
  const { user } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReportInfo();
    fetchToken();
  }, [reportId]);

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      setToken(storedToken);
    } catch (e) {
      console.error("Error fetching token:", e);
    }
  };

  const loadReportInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!reportId) throw new Error("ID de reporte no proporcionado");

      const response = await reportService.getReportById(reportId);

      if (response?.success && response?.data) {
        setReport(response.data);
      } else {
        throw new Error("No se pudo cargar el reporte");
      }
    } catch (err) {
      console.error("❌ [ReportChat] Error loading report:", err);
      setError(err?.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "URGENTE",
      investigating: "EN BÚSQUEDA",
      resolved: "ENCONTRADO",
      closed: "CERRADO",
    };
    return labels[status] || "ACTIVO";
  };

  const getStatusColor = (status) => {
    if (status === "active" || status === "investigating") return "#EF4444";
    if (status === "resolved") return "#10B981";
    return "#6B7280";
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <Loader fullScreen message="Cargando conversación..." />
      </SafeAreaView>
    );
  }

  if (error || !report) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>

          <Text className="text-gray-900 text-xl font-bold mb-3 text-center">
            Error al cargar
          </Text>

          <Text className="text-gray-600 text-center mb-6">
            {error || "No se pudo cargar la información del reporte"}
          </Text>

          <Pressable
            onPress={() => router.back()}
            className="px-6 py-3 bg-gray-900 rounded-full"
          >
            <Text className="text-white font-bold">Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const reportPhotoUri = report?.photo ? resolveAssetUrl(report.photo) : null;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER CONTEXTUALIZADO */}
      <View
        className="bg-white px-4 py-4 border-b border-gray-200"
        style={{
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
        }}
      >
        <View className="flex-row items-center">
          {/* Botón Volver */}
          <Pressable
            onPress={() => router.back()}
            className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center mr-3 border border-gray-100"
          >
            <Ionicons name="chevron-back" size={24} color="#1F2937" />
          </Pressable>

          {/* Foto del Reporte */}
          <View className="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 border border-gray-100">
            {reportPhotoUri ? (
              <Image
                source={{ uri: reportPhotoUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Ionicons name="person" size={24} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Info del Reporte */}
          <View className="flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {report?.name || "Reporte"}
            </Text>

            <View className="flex-row items-center mt-0.5">
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: getStatusColor(report?.status) }}
              />
              <Text className="text-xs text-gray-500 font-medium">
                {getStatusLabel(report?.status)}
              </Text>
            </View>
          </View>

          {/* Botón compartir (si lo quieres en chat también) */}
          <Pressable className="w-11 h-11 rounded-full bg-gray-50 items-center justify-center border border-gray-100">
            <Ionicons name="share-outline" size={20} color="#111827" />
          </Pressable>
        </View>
      </View>

      {/* CHAT COMPONENT */}
      {user ? (
        <ReportChat reportId={reportId} currentUserId={user._id} token={token} />
      ) : (
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="lock-closed" size={48} color="#9CA3AF" />
          </View>

          <Text className="text-gray-900 text-xl font-bold mb-3 text-center">
            Acceso Restringido
          </Text>

          <Text className="text-gray-500 text-center mb-6">
            Inicia sesión para acceder al chat de este reporte
          </Text>

          <Pressable
            onPress={() => router.back()}
            className="px-6 py-3 bg-gray-900 rounded-full"
          >
            <Text className="text-white font-bold">Volver</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
