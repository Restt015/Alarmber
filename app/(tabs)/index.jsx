import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import MyReportsModal from "../../components/modals/MyReportsModal";
import ErrorState from "../../components/shared/ErrorState";
import HomeHeader from "../../components/shared/HomeHeader";
import ImageWithFallback from "../../components/shared/ImageWithFallback";
import SkeletonCard from "../../components/shared/SkeletonCard";
import reportService from "../../services/reportService";

export default function HomeScreen() {
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showMyReportsModal, setShowMyReportsModal] = useState(false);
  const [myReportsCount, setMyReportsCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoadingAlerts(true);
      setError(null);

      // Fetch from both endpoints to get all validated reports
      const [activeResponse, finishedResponse, reportsResponse] = await Promise.all([
        reportService.getReports({}),
        reportService.getFinishedReports({}),
        reportService.getMyReports().catch(() => ({ data: [] })),
      ]);

      // Combine all reports
      const allReports = [
        ...(activeResponse.data || []),
        ...(finishedResponse || [])
      ];

      // Filter for "active" reports: validated && status !== 'resolved'
      const activeAlerts = allReports.filter(report =>
        report.validated === true && report.status !== 'resolved'
      );

      // Sort by createdAt descending and take the 5 most recent
      activeAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const recentActiveAlerts = activeAlerts.slice(0, 5);

      setRecentAlerts(recentActiveAlerts);
      setMyReportsCount(reportsResponse.data?.length || 0);
    } catch (err) {
      console.error("❌ [Home] Error loading data:", err);
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoadingAlerts(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24)
      return `Hace ${diffHours} hora${diffHours > 1 ? "s" : ""}`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: "Urgente",
      investigating: "En Búsqueda",
      resolved: "Encontrado",
      closed: "Cerrado",
    };
    return labels[status] || "Activo";
  };

  const policeNews = [
    {
      id: "1",
      title: "Operativo policial recupera menor desaparecido",
      source: "Ministerio de Seguridad Pública",
      date: "Hace 3 horas",
      image: "https://via.placeholder.com/120x80",
      url: "https://example.com/news1",
    },
    {
      id: "2",
      title: "Nueva alerta Amber activada en zona oeste",
      source: "Policía Nacional",
      date: "Hace 5 horas",
      image: "https://via.placeholder.com/120x80",
      url: "https://example.com/news2",
    },
  ];

  return (
    <View className="flex-1 bg-[#F9FAFB]">
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#000"]}
            tintColor="#000"
          />
        }
      >
        <View className="px-5">
          {/* ==============================
               PREMIUM DASHBOARD (Uber/iOS)
             ============================== */}
          <Text className="font-semibold text-gray-900 text-[18px] mb-3">
            Panel general
          </Text>

          <View className="flex-row mb-6" style={{ height: 140 }}>

            {/* CARD – ALERTAS ACTIVAS */}
            <TouchableOpacity
              className="flex-1 mr-3"
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/alerts")}
            >
              <View
                className="h-full rounded-3xl p-5 justify-between"
                style={{
                  backgroundColor: "#E53935",
                  shadowColor: "#E53935",
                  shadowOpacity: 0.25,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <View className="flex-row justify-between">
                  <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                    <Ionicons name="alert-circle" size={28} color="white" />
                  </View>
                  <Ionicons name="chevron-forward" size={26} color="white" />
                </View>

                <Text className="text-[40px] font-black text-white leading-none mt-1">
                  {recentAlerts.length}
                </Text>
                <Text className="text-white/90 text-[15px] font-semibold">
                  Alertas activas
                </Text>
              </View>
            </TouchableOpacity>

            {/* CARD – MIS REPORTES */}
            <TouchableOpacity
              className="flex-1"
              activeOpacity={0.85}
              onPress={() => setShowMyReportsModal(true)}
            >
              <View
                className="h-full rounded-3xl p-5 justify-between"
                style={{
                  backgroundColor: "#1976D2",
                  shadowColor: "#1976D2",
                  shadowOpacity: 0.25,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <View className="flex-row justify-between">
                  <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
                    <Ionicons name="document-text" size={28} color="white" />
                  </View>
                  <Ionicons name="chevron-forward" size={26} color="white" />
                </View>

                <Text className="text-[40px] font-black text-white leading-none mt-1">
                  {myReportsCount}
                </Text>
                <Text className="text-white/90 text-[15px] font-semibold">
                  Mis reportes
                </Text>
              </View>
            </TouchableOpacity>

          </View>

          {/* NEWS SECTION */}
          <Text className="font-semibold text-gray-900 text-[18px] mb-3 mt-6">
            Noticias Policiales
          </Text>

          {policeNews.map((news) => (
            <TouchableOpacity
              key={news.id}
              onPress={() => Linking.openURL(news.url)}
              activeOpacity={0.85}
              className="bg-white rounded-3xl mb-5"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 4,
              }}
            >
              <View className="flex-row p-4 items-center">
                {/* IMAGE */}
                <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden mr-4">
                  <Image
                    source={{ uri: news.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* TEXT INFO */}
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-[16px] mb-1" numberOfLines={2}>
                    {news.title}
                  </Text>
                  <Text className="text-gray-500 text-[13px] mb-2">{news.source}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="time-outline" size={14} color="#BDBDBD" />
                    <Text className="text-gray-400 text-[12px] ml-1">{news.date}</Text>
                  </View>
                </View>

                {/* ARROW ICON */}
                <Ionicons name="chevron-forward" size={22} color="#D32F2F" />
              </View>
            </TouchableOpacity>
          ))}

          {/* ALERTAS RECIENTES */}
          <Text className="font-semibold text-gray-900 text-[18px] mb-3 mt-5">
            Alertas Recientes
          </Text>

          {loadingAlerts ? (
            /* Skeleton loading cards */
            <View>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : error ? (
            /* Error state */
            <ErrorState
              title="Error al cargar alertas"
              message={error}
              onRetry={loadData}
            />
          ) : recentAlerts.length > 0 ? (
            recentAlerts.map((report) => (
              <TouchableOpacity
                key={report._id}
                onPress={() => router.push(`/alert/${report._id}`)}
                activeOpacity={0.85}
                className="mb-4 bg-white rounded-2xl p-4 flex-row"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 6,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 2,
                }}
              >
                {/* FOTO CUADRADA with loading and fallback */}
                <ImageWithFallback
                  uri={report.photo}
                  className="w-20 h-20 rounded-xl overflow-hidden mr-4"
                  fallbackIcon="person-outline"
                  fallbackIconSize={32}
                  fallbackIconColor="#9CA3AF"
                />

                {/* INFO */}
                <View className="flex-1 justify-center">
                  {/* Nombre + Estado */}
                  <View className="flex-row justify-between items-start mb-1">
                    <Text
                      className="text-[16px] font-semibold text-gray-900 flex-1 pr-2"
                      numberOfLines={1}
                    >
                      {report.name}
                    </Text>

                    <View className="px-2 py-0.5 rounded-md bg-red-50">
                      <Text className="text-[10px] text-red-600 font-bold uppercase tracking-wide">
                        {getStatusLabel(report.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Última ubicación */}
                  <Text
                    className="text-gray-600 text-[13px]"
                    numberOfLines={1}
                  >
                    Última ubicación:{" "}
                    <Text className="font-medium">{report.lastLocation}</Text>
                  </Text>

                  {/* Fecha */}
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="time-outline" size={13} color="#9CA3AF" />
                    <Text className="text-gray-400 text-[12px] ml-1">
                      {formatDate(report.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View
              className="p-10 rounded-2xl items-center bg-white"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 5,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              }}
            >
              <Ionicons
                name="notifications-off-outline"
                size={45}
                color="#BDBDBD"
              />
              <Text className="font-semibold text-gray-900 text-[17px] mt-3">
                No hay alertas recientes
              </Text>
              <Text className="text-gray-500 text-[14px] text-center leading-5 mt-1 px-8">
                Cuando se validen nuevas alertas, aparecerán en esta sección.
              </Text>
            </View>
          )}

          {/* INFO BOX */}
          <View
            className="bg-white rounded-3xl p-5 mt-8 mb-12"
            style={{
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowRadius: 10,
              elevation: 2,
            }}
          >
            <View className="flex-row">
              <View className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="information" size={26} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-[16px]">
                  ¿Cómo funciona ALARMBER?
                </Text>
                <Text className="text-gray-600 text-[14px] mt-1 leading-5">
                  Todas las alertas son verificadas por autoridades antes de publicarse.
                  Puedes apoyar compartiendo información útil en tiempo real.
                </Text>
              </View>
            </View>
          </View>

        </View>
      </ScrollView>

      <MyReportsModal
        visible={showMyReportsModal}
        onClose={() => setShowMyReportsModal(false)}
      />
    </View>
  );
}
