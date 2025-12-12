import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

import AlertListItem from '../../components/alerts/AlertListItem';
import StatCard from '../../components/cards/StatCard';
import HomeHeader from '../../components/shared/HomeHeader';
import reportService from '../../services/reportService';

export default function HomeScreen() {
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load on mount
  useEffect(() => {
    loadRecentAlerts();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadRecentAlerts();
    }, [])
  );

  const loadRecentAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await reportService.getRecentReports(5);
      console.log('✅ [Home] Recent alerts loaded:', response.data?.length || 0);
      setRecentAlerts(response.data || []);
    } catch (error) {
      console.error('❌ [Home] Error loading recent alerts:', error);
    } finally {
      setLoadingAlerts(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecentAlerts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Urgente',
      investigating: 'En Búsqueda',
      resolved: 'Encontrado',
      closed: 'Cerrado'
    };
    return labels[status] || 'Activo';
  };

  return (
    <View className="flex-1 bg-white">
      <HomeHeader />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#D32F2F']}
            tintColor="#D32F2F"
          />
        }
      >
        <View className="px-5 mt-2">
          {/* WELCOME */}
          <View className="py-6">
            <Text className="text-gray-400 text-[13px] font-semibold uppercase tracking-wider mb-1">
              Sistema de Alertas
            </Text>
            <Text className="text-[26px] font-bold text-gray-900">
              Personas Desaparecidas
            </Text>
          </View>

          {/* HERO ACTION - CREATE REPORT */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/report/create")}
            className="bg-red-600 rounded-2xl p-6 mb-6 shadow-lg"
            style={{
              elevation: 4,
              shadowColor: "#D32F2F",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="add-circle" size={24} color="white" />
                  <Text className="text-white text-[20px] font-bold ml-2">
                    Crear Reporte
                  </Text>
                </View>
                <Text className="text-red-100 text-[13px]">
                  Reporta una persona desaparecida
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* STATS CARDS */}
          <Text className="font-bold text-gray-900 text-[18px] mb-4">
            Resumen
          </Text>

          <View className="flex-row mb-6">
            <StatCard
              icon="alert-circle"
              label="Alertas Activas"
              count={recentAlerts.length.toString()}
              color="#D32F2F"
              badge="Validadas"
              onPress={() => router.push("/(tabs)/alerts")}
            />
            <StatCard
              icon="people"
              label="Comunidad"
              count={recentAlerts.length > 0 ? recentAlerts.length.toString() : "0"}
              color="#1976D2"
              onPress={() => router.push("/(tabs)/alerts")}
            />
          </View>

          {/* RECENT ALERTS SECTION */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="font-bold text-gray-900 text-[18px]">
                  Alertas Recientes
                </Text>
                <Text className="text-gray-500 text-[12px] mt-0.5">
                  Validadas por autoridades
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
                <Text className="text-red-600 text-[14px] font-bold">
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            {loadingAlerts ? (
              <View className="py-8 items-center bg-gray-50 rounded-xl">
                <ActivityIndicator size="small" color="#D32F2F" />
                <Text className="text-gray-500 text-[13px] mt-2">Cargando alertas...</Text>
              </View>
            ) : recentAlerts.length > 0 ? (
              recentAlerts.map((report) => (
                <AlertListItem
                  key={report._id}
                  alert={{
                    id: report._id,
                    name: report.name,
                    age: report.age,
                    lastSeen: report.lastLocation,
                    date: formatDate(report.createdAt),
                    status: getStatusLabel(report.status),
                    photo: report.photo
                  }}
                  onPress={() => router.push(`/alert/${report._id}`)}
                />
              ))
            ) : (
              <View className="bg-gray-50 rounded-2xl p-8 items-center border border-gray-100">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="notifications-off-outline" size={32} color="#BDBDBD" />
                </View>
                <Text className="text-gray-900 font-bold text-[16px] mb-1">
                  No hay alertas recientes
                </Text>
                <Text className="text-gray-400 text-[13px] text-center">
                  Las alertas validadas aparecerán aquí
                </Text>
              </View>
            )}
          </View>

          {/* INFO SECTION */}
          <View className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
            <View className="flex-row items-start">
              <View className="w-10 h-10 bg-blue-600 rounded-full items-center justify-center mr-3">
                <Ionicons name="information" size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-blue-900 font-bold text-[15px] mb-1">
                  ¿Cómo funciona ALARMBER?
                </Text>
                <Text className="text-blue-700 text-[13px] leading-5">
                  Todas las alertas son validadas por autoridades antes de publicarse.
                  Puedes ayudar reportando información relevante.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
