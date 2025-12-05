import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const mockAlerts = [
  { id: "1", name: "María González", age: 25, lastSeen: "Centro Histórico", daysMissing: 3, photo: "https://via.placeholder.com/300", status: "Urgente", date: "Hace 3 días" },
  { id: "2", name: "Carlos Ramírez", age: 18, lastSeen: "Zona Norte", daysMissing: 5, photo: "https://via.placeholder.com/300", status: "En búsqueda", date: "Hace 5 días" },
  { id: "3", name: "Ana Martínez", age: 30, lastSeen: "Plaza Principal", daysMissing: 1, photo: "https://via.placeholder.com/300", status: "Reciente", date: "Ayer" },
  { id: "4", name: "Luis Fernández", age: 22, lastSeen: "Avenida Principal", daysMissing: 7, photo: "https://via.placeholder.com/300", status: "Pendiente", date: "Hace 1 semana" },
  { id: "5", name: "Sofía López", age: 19, lastSeen: "Parque Central", daysMissing: 2, photo: "https://via.placeholder.com/300", status: "Urgente", date: "Hace 2 días" },
];

const StatusTag = ({ status }) => {
  let color = "#757575";
  let bg = "#EEEEEE";

  if (status === "Urgente") {
    color = "#D32F2F";
    bg = "#FFEBEE";
  } else if (status === "En búsqueda") {
    color = "#1976D2";
    bg = "#E3F2FD";
  } else if (status === "Reciente") {
    color = "#388E3C";
    bg = "#E8F5E9";
  }

  return (
    <View
      className="px-2 py-1 rounded-md"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-[11px] font-semibold" style={{ color }}>
        {status}
      </Text>
    </View>
  );
};

const ReportCard = ({ alert }) => {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/alert/${alert.id}`)}
      activeOpacity={0.9}
      className="mx-5 mb-4 bg-surface rounded-2xl border border-surfaceVariant shadow-sm overflow-hidden"
    >
      <View className="flex-row p-3 items-center">

        {/* IMAGE */}
        <Image
          source={{ uri: alert.photo }}
          className="w-[90px] h-[90px] rounded-xl bg-surfaceVariant"
        />

        <View className="flex-1 ml-4 justify-between">
          {/* TOP AREA */}
          <View className="flex-row justify-between items-start">
            <Text
              className="text-[17px] font-semibold text-text flex-1"
              numberOfLines={1}
            >
              {alert.name}
            </Text>

            <StatusTag status={alert.status} />
          </View>

          {/* AGE */}
          <Text className="text-sm text-textSecondary mt-1">
            Edad: {alert.age} años
          </Text>

          {/* LOCATION */}
          <View className="flex-row items-center mt-1">
            <Ionicons name="location-outline" size={15} color="#757575" />
            <Text
              className="text-xs text-textSecondary ml-1 flex-1"
              numberOfLines={1}
            >
              {alert.lastSeen}
            </Text>
          </View>

          {/* DATE */}
          <View className="flex-row justify-between items-center mt-2">
            <Text className="text-xs text-textSecondary font-medium">
              {alert.date}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#BDBDBD" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

import AppHeader from '../../components/AppHeader';

export default function AlertsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filters = ["Todos", "Urgente", "Reciente", "En búsqueda"];

  const filteredAlerts = mockAlerts.filter(
    (alert) =>
      (activeFilter === "Todos" || alert.status === activeFilter) &&
      (alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.lastSeen.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Alertas" />

      {/* HEADER */}
      <View className="bg-surface border-b border-surfaceVariant pb-3">
        <View className="px-5 pt-3 mb-2">
          <Text className="text-[24px] font-extrabold text-text tracking-tight">
            Búsqueda Activa
          </Text>
        </View>

        {/* SEARCH BAR */}
        <View className="mx-5 mb-3 bg-background rounded-xl px-4 py-2.5 flex-row items-center border border-surfaceVariant">
          <Ionicons name="search-outline" size={20} color="#9E9E9E" />
          <TextInput
            placeholder="Buscar por nombre o ubicación..."
            placeholderTextColor="#A8A8A8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-[15px] text-text"
          />
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5 pb-1.5"
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              activeOpacity={0.8}
              className={`mr-3 px-4 py-1.5 rounded-full border ${activeFilter === filter
                ? "bg-primary border-primary"
                : "bg-surface border-surfaceVariant"
                }`}
            >
              <Text
                className={`text-[13px] font-semibold ${activeFilter === filter ? "text-white" : "text-textSecondary"
                  }`}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}

          <View className="w-5" />
        </ScrollView>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReportCard alert={item} />}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 px-10">
            <Ionicons name="search" size={48} color="#D0D0D0" />
            <Text className="text-textSecondary text-center mt-4">
              No se encontraron reportes con los criterios seleccionados.
            </Text>
          </View>
        }
      />
    </View>
  );
}
