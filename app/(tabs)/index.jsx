import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScrollView, TouchableOpacity, View, Image } from "react-native";
import { Avatar, Card, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const QuickActionCard = ({ title, icon, color, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    className="w-[48%] bg-surface rounded-2xl shadow-sm border border-surfaceVariant px-5 py-6 mb-4 items-center"
  >
    <View
      className="w-14 h-14 rounded-full items-center justify-center mb-3"
      style={{ backgroundColor: `${color}20` }}
    >
      <Ionicons name={icon} size={30} color={color} />
    </View>

    <Text className="text-[16px] font-semibold text-text text-center">
      {title}
    </Text>
  </TouchableOpacity>
);

const NewsCard = ({ title, source, time, image }) => (
  <TouchableOpacity
    activeOpacity={0.9}
    className="mr-4 w-[310px] bg-surface rounded-3xl overflow-hidden shadow-sm border border-surfaceVariant"
  >
    <View className="w-full h-[160px] overflow-hidden">
      <Image
        source={{ uri: image }}
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>

    <View className="p-4">
      <Text className="text-primary font-semibold text-[13px] mb-1">
        {source}
      </Text>

      <Text
        className="font-bold text-text text-[16px] leading-tight mb-1"
        numberOfLines={2}
      >
        {title}
      </Text>

      <Text className="text-textSecondary text-[13px]">{time}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >

        {/* HEADER */}
        <View className="px-5 pt-4 pb-5 bg-surface border-b border-surfaceVariant flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-primary font-extrabold text-[24px] leading-tight">
              Alerta Ciudadana
            </Text>
            <Text className="text-textSecondary text-[15px] mt-[2px]">
              Panel de Control
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
            className="ml-3"
          >
            <Avatar.Image
              size={46}
              source={{ uri: "https://via.placeholder.com/150" }}
              style={{ backgroundColor: "#E0E0E0" }}
            />
          </TouchableOpacity>
        </View>

        {/* BODY CONTENT */}
        <View className="px-5 mt-5">

          {/* QUICK ACTIONS */}
          <Text className="font-bold text-text text-[20px] mb-4">
            Accesos Rápidos
          </Text>

          <View className="flex-row flex-wrap justify-between">
            <QuickActionCard
              title="Crear Reporte"
              icon="add-circle"
              color="#D32F2F"
              onPress={() => router.push("/report/create")}
            />

            <QuickActionCard
              title="Alertas Activas"
              icon="alert-circle"
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
              onPress={() => {}}
            />
          </View>

          {/* NEWS SECTION */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3 px-1">
              <Text className="font-bold text-text text-[20px]">
                Noticias Recientes
              </Text>

              <TouchableOpacity>
                <Text className="text-primary text-[14px] font-semibold">
                  Ver todo
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingLeft: 5,
                paddingRight: 20,
              }}
            >
              <NewsCard
                title="Nueva estrategia de búsqueda implementada en la ciudad"
                source="Seguridad Pública"
                time="Hace 2 horas"
                image="https://via.placeholder.com/300"
              />

              <NewsCard
                title="Resultados del operativo de fin de semana"
                source="Policía Municipal"
                time="Hace 5 horas"
                image="https://via.placeholder.com/300"
              />

              <NewsCard
                title="Consejos de seguridad para la comunidad"
                source="Prevención del Delito"
                time="Ayer"
                image="https://via.placeholder.com/300"
              />
            </ScrollView>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
