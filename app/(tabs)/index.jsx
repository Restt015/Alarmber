import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

import AlertListItem from '../../components/alerts/AlertListItem';
import NewsCard from '../../components/cards/NewsCard';
import StatCard from '../../components/cards/StatCard';
import HomeHeader from '../../components/shared/HomeHeader';
import reportService from '../../services/reportService';

export default function HomeScreen() {
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    loadRecentAlerts();
  }, []);

  const loadRecentAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const response = await reportService.getRecentReports(3);
      setRecentAlerts(response.data || []);
    } catch (error) {
      console.error('Error loading recent alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

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
      >
        <View className="px-5 mt-2">
          {/* WELCOME */}
          <View className="py-6">
            <Text className="text-gray-400 text-[14px] font-semibold uppercase tracking-wider mb-1">
              Bienvenido de nuevo
            </Text>
            <Text className="text-[24px] font-bold text-gray-900">
              ¿Cómo podemos ayudarte hoy?
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
              icon="time"
              label="Casos Recientes"
              count={recentAlerts.length > 0 ? recentAlerts.length.toString() : "0"}
              color="#1976D2"
              onPress={() => router.push("/(tabs)/alerts")}
            />
          </View>

          {/* RECENT ALERTS */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-gray-900 text-[18px]">
                Alertas Recientes
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/alerts')}>
                <Text className="text-red-600 text-[14px] font-bold">
                  Ver todas
                </Text>
              </TouchableOpacity>
            </View>

            {loadingAlerts ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="small" color="#D32F2F" />
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
              <View className="bg-gray-50 rounded-xl p-8 items-center">
                <Ionicons name="information-circle-outline" size={48} color="#BDBDBD" />
                <Text className="text-gray-400 text-[14px] mt-2">
                  No hay alertas recientes
                </Text>
              </View>
            )}
          </View>

          {/* NEWS SECTION */}
          <View className="mt-2">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-bold text-gray-900 text-[18px]">
                Últimas Noticias
              </Text>

              <TouchableOpacity onPress={() => router.push('/news')}>
                <Text className="text-red-600 text-[14px] font-bold">
                  Ver más
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingRight: 20,
                paddingBottom: 20
              }}
            >
              <NewsCard
                title="Nueva estrategia de búsqueda implementada en la ciudad"
                source="Seguridad"
                time="2h"
                image="https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&auto=format&fit=crop&q=60"
                onPress={() => router.push('/news')}
              />

              <NewsCard
                title="Resultados del operativo de fin de semana"
                source="Policía"
                time="5h"
                image="https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&auto=format&fit=crop&q=60"
                onPress={() => router.push('/news')}
              />

              <NewsCard
                title="Consejos de seguridad para la comunidad"
                source="Prevención"
                time="1d"
                image="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?w=400&auto=format&fit=crop&q=60"
                onPress={() => router.push('/news')}
              />
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
