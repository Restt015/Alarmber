import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import AlertListItem from '../../components/alerts/AlertListItem';
import NewsCard from '../../components/cards/NewsCard';
import StatCard from '../../components/cards/StatCard';
import HomeHeader from '../../components/shared/HomeHeader';

// Mock data - will be replaced with backend data later
const RECENT_ALERTS = [
  {
    id: "1",
    name: "Sofia Ramirez",
    age: "14",
    lastSeen: "Plaza Central, Ciudad de México",
    date: "Hace 2 horas",
    status: "Urgente",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Miguel Angel Torres",
    age: "7",
    lastSeen: "Parque México, Condesa",
    date: "Hace 5 horas",
    status: "En Búsqueda",
    photo: "https://images.unsplash.com/photo-1503919545885-7f4941199540?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Lucia Mendez",
    age: "16",
    lastSeen: "Metro Insurgentes",
    date: "Ayer",
    status: "Reciente",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=60",
  },
];

export default function HomeScreen() {
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
              count="12"
              color="#D32F2F"
              badge="En tu zona"
              onPress={() => router.push("/(tabs)/alerts")}
            />
            <StatCard
              icon="document-text"
              label="Mis Reportes"
              count="5"
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

            {RECENT_ALERTS.map((alert) => (
              <AlertListItem
                key={alert.id}
                alert={alert}
                onPress={() => router.push(`/alert/${alert.id}`)}
              />
            ))}
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
