import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { Avatar, Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const getAlertById = (id) => {
  const alerts = {
    "1": {
      id: "1",
      name: "María González",
      age: 25,
      lastSeen: "Centro Histórico",
      daysMissing: 3,
      photo: "https://via.placeholder.com/300",
      physicalDescription:
        "Estatura: 1.65m, Peso: 60kg, Cabello castaño largo, Ojos marrones",
      clothing:
        "Camiseta blanca, jeans azules, zapatos deportivos negros",
      circumstances:
        "Desapareció después de salir de su trabajo. No responde llamadas.",
      status: "URGENTE",
      reporter: {
        name: "Juan Pérez",
        relation: "Hermano",
        time: "Hace 3 días",
      },
    },
  };

  return alerts[id] || alerts["1"];
};

const InfoRow = ({ icon, label, value }) => (
  <View className="flex-row items-start mb-5">
    <Ionicons name={icon} size={22} color="#616161" style={{ marginTop: 2 }} />
    <View className="ml-3 flex-1">
      <Text className="text-[12px] font-bold text-gray-500 uppercase tracking-tight">
        {label}
      </Text>
      <Text className="text-[15px] leading-5 text-gray-900 mt-1">{value}</Text>
    </View>
  </View>
);

const CommentItem = ({ name, time, text, isAdmin }) => (
  <View className="flex-row mb-5">
    <Avatar.Text
      size={38}
      label={name.substring(0, 1).toUpperCase()}
      style={{ backgroundColor: "#E0E0E0" }}
      color="#424242"
    />

    <View className="ml-3 flex-1 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center">
          <Text className="font-semibold text-gray-900 text-[14px] mr-2">
            {name}
          </Text>

          {isAdmin && (
            <View className="bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-[10px] text-white font-bold tracking-tight">
                ADMIN
              </Text>
            </View>
          )}
        </View>

        <Text className="text-[12px] text-gray-500">{time}</Text>
      </View>

      <Text className="text-gray-700 text-[14px] leading-5">{text}</Text>
    </View>
  </View>
);

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const alert = getAlertById(id || "1");
  const [comment, setComment] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="p-1.5">
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <Text className="text-[18px] font-bold text-gray-900">
          Detalle del Reporte
        </Text>

        <TouchableOpacity className="p-1.5">
          <Ionicons name="share-outline" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false}>

          <View className="relative w-full h-[320px] bg-gray-200">
            <Image
              source={{ uri: alert.photo }}
              className="w-full h-full"
              resizeMode="cover"
            />

            <View className="absolute bottom-4 right-4 bg-red-600 px-4 py-1.5 rounded-full shadow-md">
              <Text className="text-white text-[12px] font-bold tracking-wider">
                {alert.status}
              </Text>
            </View>
          </View>

          <View className="px-5 py-4 bg-white border-b border-gray-200 flex-row items-center">
            <Avatar.Image
              size={46}
              source={{ uri: "https://via.placeholder.com/100" }}
            />

            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-semibold text-gray-900">
                {alert.reporter.name}
              </Text>
              <Text className="text-[12px] text-gray-500">
                {alert.reporter.relation} • {alert.reporter.time}
              </Text>
            </View>

            <Button
              mode="outlined"
              textColor="#D32F2F"
              style={{ borderColor: "#D32F2F", borderRadius: 8 }}
              compact
            >
              Contactar
            </Button>
          </View>

          <View className="p-5 bg-white mt-2 border-y border-gray-200">
            <Text className="text-[23px] font-bold text-gray-900 tracking-tight">
              {alert.name}
            </Text>

            <Text className="text-[15px] text-gray-600 mb-6">
              Edad: {alert.age} años
            </Text>

            <InfoRow
              icon="location-outline"
              label="Última Ubicación"
              value={alert.lastSeen}
            />
            <InfoRow
              icon="time-outline"
              label="Tiempo desaparecida"
              value={`${alert.daysMissing} días`}
            />
            <InfoRow
              icon="body-outline"
              label="Descripción física"
              value={alert.physicalDescription}
            />
            <InfoRow
              icon="shirt-outline"
              label="Vestimenta"
              value={alert.clothing}
            />
            <InfoRow
              icon="alert-circle-outline"
              label="Circunstancias"
              value={alert.circumstances}
            />
          </View>

          <View className="px-5 py-4 bg-white border-t border-gray-200 mt-2">
            <Button
              mode="contained"
              buttonColor="#D32F2F"
              className="rounded-lg py-1.5"
              labelStyle={{ fontWeight: "600", fontSize: 16 }}
            >
              Procesar / Validar Reporte
            </Button>
          </View>

          <View className="p-5 bg-white mt-2">
            <Text className="text-[18px] font-bold text-gray-900 mb-4">
              Discusión / Aportes
            </Text>

            <CommentItem
              name="Oficial Ramírez"
              time="Hace 2h"
              text="Hemos iniciado el protocolo de búsqueda en la zona norte."
              isAdmin={true}
            />

            <CommentItem
              name="Ana López"
              time="Hace 5h"
              text="Creo haber visto a alguien con esa descripción cerca del parque."
            />

            <View className="flex-row items-center mt-3 bg-gray-100 rounded-full px-4 py-2 border border-gray-300">
              <TextInput
                placeholder="Escribe un comentario..."
                placeholderTextColor="#9E9E9E"
                value={comment}
                onChangeText={setComment}
                className="flex-1 text-gray-900 mr-2"
              />
              <TouchableOpacity>
                <Ionicons name="send" size={20} color="#D32F2F" />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
