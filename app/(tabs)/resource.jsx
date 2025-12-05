import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Linking, ScrollView, View, TouchableOpacity } from "react-native";
import { Button, Card, Text, TextInput, useTheme } from "react-native-paper";

const SectionTitle = ({ title }) => (
  <View className="px-5 mt-8 mb-2">
    <Text className="text-[20px] font-bold text-gray-900">{title}</Text>
  </View>
);

const contacts = [
  { id: "1", name: "Emergencias", phone: "911", icon: "call", color: "#E53935" },
  { id: "2", name: "Policía Nacional", phone: "104", icon: "shield", color: "#1E88E5" },
  { id: "3", name: "Cruz Roja", phone: "103", icon: "medical", color: "#D81B60" },
];

export default function ResourceScreen() {
  const theme = useTheme();

  const [anonymousInfo, setAnonymousInfo] = useState({
    name: "",
    location: "",
    description: "",
  });

  const handleCall = (phone) => Linking.openURL(`tel:${phone}`);

  const handleSubmitInfo = () => {
    if (!anonymousInfo.name.trim() || !anonymousInfo.location.trim() || !anonymousInfo.description.trim())
      return;

    setAnonymousInfo({ name: "", location: "", description: "" });
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >

      {/* HEADER */}
      <View className="px-5 pt-8 pb-4 bg-background">
        <Text className="text-[28px] font-extrabold text-gray-900 tracking-tight">
          Recursos
        </Text>
        <Text className="text-[15px] text-gray-600 mt-1">
          Contactos importantes y envío de información
        </Text>
      </View>

      {/* CONTACTOS */}
      <SectionTitle title="Contactos de Emergencia" />

      <View className="px-5 space-y-4">
        {contacts.map((c) => (
          <TouchableOpacity
            key={c.id}
            activeOpacity={0.8}
            onPress={() => handleCall(c.phone)}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex-row items-center"
          >
            {/* Icono circular estilo Uber */}
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: `${c.color}15` }}
            >
              <Ionicons name={c.icon} size={26} color={c.color} />
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-[17px] font-semibold text-gray-900">
                {c.name}
              </Text>
              <Text className="text-[13px] text-gray-600 mt-[2px]">
                {c.phone}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="#9E9E9E" />
          </TouchableOpacity>
        ))}
      </View>

      {/* FORMULARIO */}
      <SectionTitle title="Enviar Información Anónima" />

      <View className="px-5">

        <TextInput
          mode="outlined"
          label="Nombre de la persona"
          value={anonymousInfo.name}
          onChangeText={(t) => setAnonymousInfo({ ...anonymousInfo, name: t })}
          className="mb-4 bg-white rounded-xl"
          style={{ backgroundColor: "#FFF" }}
          outlineColor="#E0E0E0"
          activeOutlineColor={theme.colors.primary}
        />

        <TextInput
          mode="outlined"
          label="Ubicación"
          value={anonymousInfo.location}
          onChangeText={(t) => setAnonymousInfo({ ...anonymousInfo, location: t })}
          className="mb-4 bg-white rounded-xl"
          style={{ backgroundColor: "#FFF" }}
          outlineColor="#E0E0E0"
          activeOutlineColor={theme.colors.primary}
        />

        <TextInput
          mode="outlined"
          label="Descripción"
          multiline
          numberOfLines={4}
          value={anonymousInfo.description}
          onChangeText={(t) => setAnonymousInfo({ ...anonymousInfo, description: t })}
          className="mb-5 bg-white rounded-xl"
          style={{ backgroundColor: "#FFF" }}
          outlineColor="#E0E0E0"
          activeOutlineColor={theme.colors.primary}
        />

        <Button
          mode="contained"
          onPress={handleSubmitInfo}
          className="py-2.5 rounded-full"
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          Enviar Información
        </Button>

        <Text className="text-[13px] text-gray-600 text-center mt-4 mb-6">
          La información enviada es anónima y será revisada por las autoridades.
        </Text>

      </View>
    </ScrollView>
  );
}
