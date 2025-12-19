import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "react-native-paper";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import InfoRow from "../../components/alerts/InfoRow";
import ReporterBox from "../../components/alerts/ReporterBox";
import ReportChat from "../../components/reports/ReportChat";
import Loader from "../../components/shared/Loader";
import PageHeader from "../../components/shared/PageHeader";
import { useAuth } from "../../context/AuthContext";
import reportService from "../../services/reportService";

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [chatModalVisible, setChatModalVisible] = useState(false);

  useEffect(() => {
    loadReportData();
    fetchToken();
  }, [id]);

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      setToken(storedToken);
    } catch (e) {
      console.error("Error fetching token:", e);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("ID de reporte no proporcionado");
      }

      const response = await reportService.getReportById(id);

      if (response.success && response.data) {
        setReport(response.data);
      } else {
        throw new Error("No se pudo cargar el reporte");
      }
    } catch (err) {
      console.error("❌ [AlertDetail] Error loading report:", err);
      setError(err.message || "Error al cargar el reporte");
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader title="Detalle del Reporte" showBack={true} />
        <Loader fullScreen message="Cargando reporte..." />
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader title="Detalle del Reporte" showBack={true} />
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={48} color="#D32F2F" />
          </View>
          <Text className="text-gray-900 text-[20px] font-bold mb-3 text-center">
            Error al cargar
          </Text>
          <Text className="text-gray-600 text-[15px] text-center leading-6 mb-6">
            {error}
          </Text>
          <Button
            mode="contained"
            buttonColor="#D32F2F"
            className="rounded-xl"
            labelStyle={{ fontWeight: "bold", fontSize: 15 }}
            onPress={loadReportData}
          >
            Reintentar
          </Button>
        </View>
      </View>
    );
  }

  // Not Found State
  if (!report) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader title="Detalle del Reporte" showBack={true} />
        <View className="flex-1 justify-center items-center px-8">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="document-outline" size={48} color="#9CA3AF" />
          </View>
          <Text className="text-gray-900 text-[20px] font-bold mb-3 text-center">
            Reporte no encontrado
          </Text>
          <Text className="text-gray-600 text-[15px] text-center leading-6">
            El reporte que buscas no existe o ha sido eliminado.
          </Text>
        </View>
      </View>
    );
  }

  // Success State - Display Report Data
  const reporterName = report.reportedBy?.name || "Usuario";
  const isOwner = user && report.reportedBy?._id === user._id;
  const statusColor = report.status === "active" || report.status === "investigating"
    ? "#D32F2F"
    : report.status === "resolved"
      ? "#4CAF50"
      : "#757575";

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Detalle del Reporte"
        showBack={true}
        rightIcon={isOwner ? "create-outline" : "share-outline"}
        rightIconColor={isOwner ? "#1976D2" : "#1A1A1A"}
        rightIconBg={isOwner ? "bg-blue-50" : "bg-gray-50"}
        onRightPress={() => {
          if (isOwner) {
            router.push(`/report/edit/${report._id}`);
          }
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* CONTENT AREA - Clean detail view without tabs */}
        <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
          {/* PHOTO & STATUS */}
          <View className="relative w-full h-[320px] bg-gray-100">
            {report.photo ? (
              <Image
                source={{ uri: report.photo }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full bg-gray-200 items-center justify-center">
                <Ionicons name="person-outline" size={80} color="#9CA3AF" />
              </View>
            )}
            <View
              className="absolute bottom-4 right-4 px-4 py-1.5 rounded-full shadow-md"
              style={{ backgroundColor: statusColor }}
            >
              <Text className="text-white text-[12px] font-bold tracking-wider">
                {getStatusLabel(report.status)}
              </Text>
            </View>

            {/* Views Counter */}
            <View
              className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full flex-row items-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            >
              <Ionicons name="eye" size={14} color="white" />
              <Text className="text-white text-[12px] font-semibold ml-1">
                {report.views || 0} {(report.views || 0) === 1 ? 'vista' : 'vistas'}
              </Text>
            </View>
          </View>

          {/* REPORTER INFO */}
          <View className="px-5 py-4 bg-white border-b border-gray-100">
            <ReporterBox
              name={reporterName}
              profileImage={report.reportedBy?.profileImage}
              relationship={report.relationship}
              time={formatDate(report.createdAt)}
              activityStatus={report.reportedBy?.activityStatus}
              isOwner={isOwner}
            />
          </View>

          {/* DETAILS TEXT */}
          <View className="p-5 bg-white">
            <Text className="text-[28px] font-black text-gray-900 tracking-tight leading-8 mb-1">
              {report.name}
            </Text>
            <View className="flex-row items-center flex-wrap mb-6">
              <Text className="text-[16px] text-gray-500 font-medium">
                Edad: {report.age} años
              </Text>
              {report.gender && (
                <Text className="text-[16px] text-gray-500 font-medium ml-2">
                  • {report.gender === 'male' ? 'Hombre' : report.gender === 'female' ? 'Mujer' : 'Otro'}
                </Text>
              )}
              {report.priority && report.priority !== 'medium' && report.priority !== 'low' && (
                <View
                  className="ml-2 px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: report.priority === 'high' || report.priority === 'critical' ? '#FFEBEE' : '#FFF3E0'
                  }}
                >
                  <Text
                    className="text-[11px] font-bold uppercase"
                    style={{
                      color: report.priority === 'high' || report.priority === 'critical' ? '#D32F2F' : '#FF9800'
                    }}
                  >
                    {report.priority === 'high' || report.priority === 'critical' ? '🔴 Alta' : '🟡 Media'}
                  </Text>
                </View>
              )}
              {report.createdByAdmin && (
                <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E3F2FD' }}>
                  <Text className="text-[11px] font-bold" style={{ color: '#1976D2' }}>
                    👮 Reporte Oficial
                  </Text>
                </View>
              )}
            </View>

            <InfoRow
              icon="location-outline"
              label="Última Ubicación"
              value={report.lastLocation}
            />
            <InfoRow
              icon="time-outline"
              label="Reportado"
              value={formatDate(report.createdAt)}
            />
            <InfoRow
              icon="body-outline"
              label="Descripción física"
              value={report.description}
            />
            <InfoRow
              icon="shirt-outline"
              label="Vestimenta"
              value={report.clothing}
            />
            {report.circumstances && (
              <InfoRow
                icon="alert-circle-outline"
                label="Circunstancias"
                value={report.circumstances}
              />
            )}
            {report.contactPhone && (
              <InfoRow
                icon="call-outline"
                label="Teléfono de contacto"
                value={report.contactPhone}
              />
            )}
            {report.contactEmail && (
              <InfoRow
                icon="mail-outline"
                label="Email de contacto"
                value={report.contactEmail}
                isLast={true}
              />
            )}
          </View>

          {/* VALIDATION INFO */}
          {report.validated && report.validatedAt && (
            <View className="mt-4 bg-green-50 rounded-2xl p-4 mx-5">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <Text className="text-green-800 font-bold text-[15px] ml-2">
                  Reporte Validado
                </Text>
              </View>
              <Text className="text-green-700 text-[13px] mt-2">
                Verificado el {formatDate(report.validatedAt)}
              </Text>
            </View>
          )}

          {/* CHAT ACCESS BUTTON */}
          <TouchableOpacity
            onPress={() => setChatModalVisible(true)}
            className="mx-5 mt-6 mb-4 bg-white rounded-2xl p-5 border border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  style={{ backgroundColor: '#EFF6FF' }}
                >
                  <Ionicons name="chatbubbles" size={24} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    Ver Conversación
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Chat sobre este reporte
                  </Text>
                </View>
              </View>
              <Ionicons name="chat-bubble-ellipsis" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          {/* Bottom Spacer */}
          <View className="h-20" />
        </ScrollView>

      </KeyboardAvoidingView>

      {/* CHAT MODAL */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setChatModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
          {/* Modal Header */}
          <View
            className="px-4 py-4 border-b border-gray-200"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.05,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: 3,
            }}
          >
            <View className="flex-row items-center">
              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setChatModalVisible(false)}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#1F2937" />
              </TouchableOpacity>

              {/* Report Info */}
              <View className="flex-1">
                <Text className="font-bold text-base text-gray-900" numberOfLines={1}>
                  {report.name}
                </Text>
                <View className="flex-row items-center mt-0.5">
                  <View
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: statusColor }}
                  />
                  <Text className="text-xs text-gray-500 font-medium">
                    {getStatusLabel(report.status)}
                  </Text>
                </View>
              </View>

              {/* Status Badge */}
              <View
                className="px-3 py-1.5 rounded-full"
                style={{ backgroundColor: statusColor }}
              >
                <Text className="text-white text-xs font-bold">
                  {getStatusLabel(report.status)}
                </Text>
              </View>
            </View>
          </View>

          {/* Chat Component */}
          {user ? (
            <ReportChat
              reportId={report._id}
              currentUserId={user._id}
              token={token}
            />
          ) : (
            <View className="flex-1 items-center justify-center p-8">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-6">
                <Ionicons name="lock-closed" size={48} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-3 text-center">
                Acceso Restringido
              </Text>
              <Text className="text-gray-500 text-center">
                Inicia sesión para acceder al chat de este reporte
              </Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}


