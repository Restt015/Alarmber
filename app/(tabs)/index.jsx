import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import NewsCard from '../../components/cards/NewsCard';
import QuickActionCard from '../../components/cards/QuickActionCard';
import HomeHeader from '../../components/shared/HomeHeader';

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
                onPress={() => { }}
              />

              <NewsCard
                title="Resultados del operativo de fin de semana"
                source="Policía"
                time="5h"
                image="https://via.placeholder.com/300"
                onPress={() => { }}
              />

              <NewsCard
                title="Consejos de seguridad para la comunidad"
                source="Prevención"
                time="1d"
                image="https://via.placeholder.com/300"
                onPress={() => { }}
              />
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
