import { useLocalSearchParams } from "expo-router";
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button } from "react-native-paper";

import CommentInput from '../../components/alerts/CommentInput';
import CommentItem from '../../components/alerts/CommentItem';
import InfoRow from '../../components/alerts/InfoRow';
import ReporterBox from '../../components/alerts/ReporterBox';
import PageHeader from '../../components/shared/PageHeader';

const getAlertById = (id) => {
  const alerts = {
    "1": {
      id: "1",
      name: "María González",
      age: 25,
      lastSeen: "Centro Histórico",
      daysMissing: 3,
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
      physicalDescription: "Estatura: 1.65m, Peso: 60kg, Cabello castaño largo, Ojos marrones",
      clothing: "Camiseta blanca, jeans azules, zapatos deportivos negros",
      circumstances: "Desapareció después de salir de su trabajo. No responde llamadas.",
      status: "URGENTE",
      reporter: {
        name: "Juan Pérez",
        role: "Hermano",
        time: "Hace 3 días",
      },
      comments: [
        { id: 1, user: "Oficial Ramírez", time: "Hace 2h", text: "Hemos iniciado el protocolo de búsqueda en la zona norte.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        { id: 2, user: "Ana López", time: "Hace 5h", text: "Creo haber visto a alguien con esa descripción cerca del parque.", avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }
      ]
    },
  };
  return alerts[id] || alerts["1"];
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams();
  const alert = getAlertById(id || "1");

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Detalle del Reporte"
        showBack={true}
        rightIcon="share-outline"
        onRightPress={() => { }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* PHOTO & STATUS */}
          <View className="relative w-full h-[320px] bg-gray-100">
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

          {/* REPORTER INFO */}
          <View className="px-5 py-4 bg-white border-b border-gray-100">
            <ReporterBox
              name={alert.reporter.name}
              role={alert.reporter.role}
              time={alert.reporter.time}
            />
          </View>

          {/* MAIN INFO */}
          <View className="p-5 bg-white">
            <Text className="text-[28px] font-black text-gray-900 tracking-tight leading-8 mb-1">
              {alert.name}
            </Text>
            <Text className="text-[16px] text-gray-500 font-medium mb-6">
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
              isLast={true}
            />

            <Button
              mode="contained"
              buttonColor="#D32F2F"
              className="rounded-xl py-1.5 mt-6 shadow-none"
              labelStyle={{ fontWeight: "bold", fontSize: 16, letterSpacing: 0.5 }}
            >
              Procesar / Validar Reporte
            </Button>
          </View>

          {/* COMMENTS SECTION */}
          <View className="p-5 bg-white border-t border-gray-100 pb-10">
            <Text className="text-[18px] font-bold text-gray-900 mb-6">
              Discusión / Aportes
            </Text>

            {alert.comments.map(comment => (
              <CommentItem
                key={comment.id}
                {...comment}
              />
            ))}
          </View>
        </ScrollView>

        <CommentInput />
      </KeyboardAvoidingView>
    </View>
  );
}
