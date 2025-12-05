import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const QuickActionCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className="w-[48%] bg-white rounded-2xl border border-gray-100 px-5 py-6 mb-4 items-center shadow-sm"
    style={{
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8
    }}
  >
    <View
      className="w-14 h-14 rounded-full items-center justify-center mb-3"
      style={{ backgroundColor: `${color}20` }}
    >
      <Ionicons name={icon} size={28} color={color} />
    </View>

    <Text className="text-[15px] font-bold text-gray-900 text-center tracking-tight">
      {title}
    </Text>
  </TouchableOpacity>
);

const NewsCard = ({ title, source, time, image }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    className="mr-4 w-[280px] bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
    style={{
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8
    }}
  >
    <View className="w-full h-[150px] bg-gray-100">
      <Image
        source={{ uri: image }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>

    <View className="p-4">
      <View className="flex-row items-center mb-2">
        <View className="bg-red-50 px-2 py-0.5 rounded-md mr-2">
          <Text className="text-red-700 font-bold text-[10px] uppercase tracking-wide">
            {source}
          </Text>
        </View>
        <Text className="text-gray-400 text-[11px] font-medium">{time}</Text>
      </View>

      <Text
        className="font-bold text-gray-900 text-[16px] leading-snug"
        numberOfLines={2}
      >
        {title}
      </Text>
    </View>
  </TouchableOpacity>
);

import AppHeader from '../../components/AppHeader';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  return (
    <View className="flex-1 bg-white">
      <AppHeader showLocation={true} />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* BODY CONTENT */}
        <View className="px-5 mt-2">
          {/* Welcome Message */}
          <View className="py-6">
            <Text className="text-gray-400 text-[14px] font-semibold uppercase tracking-wider mb-1">Bienvenido de nuevo</Text>
            
          </View>

          {/* QUICK ACTIONS */}
          <Text className="font-bold text-gray-900 text-[18px] mb-4">
            Accesos Rápidos
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <QuickActionCard
              title="Crear Reporte"
              icon="add"
              color="#D32F2F"
              onPress={() => router.push("/report/create")}
            />

            <QuickActionCard
              title="Alertas Activas"
              icon="alert"
              color="#FBC02D"
              onPress={() => router.push("/(tabs)/alerts")}
            />

            <QuickActionCard
              title="Casos Recientes"
              icon="time"
              color="#1976D2"
              onPress={() => router.push("/(tabs)/alerts")}
            />

            <QuickActionCard
              title="Noticias"
              icon="newspaper"
              color="#7B1FA2"
              onPress={() => router.push("/news")}
            />
          </View>

          {/* NEWS SECTION */}
          <View className="mt-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <Text className="font-bold text-gray-900 text-[18px]">
                Noticias Recientes
              </Text>

              <TouchableOpacity onPress={() => router.push('/news')}>
                <Text className="text-red-600 text-[14px] font-bold">
                  Ver todo
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
                image="https://via.placeholder.com/300"
              />

              <NewsCard
                title="Resultados del operativo de fin de semana"
                source="Policía"
                time="5h"
                image="https://via.placeholder.com/300"
              />

              <NewsCard
                title="Consejos de seguridad para la comunidad"
                source="Prevención"
                time="1d"
                image="https://via.placeholder.com/300"
              />
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
