import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateReportScreen() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    lastLocation: "",
    description: "",
    clothing: "",
    circumstances: "",
  });

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permisos necesarios",
        "Debes habilitar acceso a fotos para subir una imagen."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) return "El nombre es requerido";
    if (!formData.age.trim()) return "La edad es requerida";
    if (!formData.lastLocation.trim()) return "La última ubicación es requerida";
    if (!formData.description.trim()) return "La descripción física es requerida";
    if (!photo) return "La fotografía es obligatoria";
    return null;
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Campos incompletos", error);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/report/success");
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* HEADER estilo Uber */}
      <View className="flex-row items-center px-5 py-3 border-b border-surfaceVariant bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={26} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-[20px] font-bold text-gray-900">
          Nuevo Reporte
        </Text>

        <View className="w-6" /> {/* Para centrar el título perfectamente */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5 pt-4"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* TEXTO DE AYUDA */}
          <Text className="text-gray-600 text-[14px] leading-5 mb-6">
            Completa la información lo más precisa posible. Todos los reportes
            son verificados por un administrador antes de publicarse.
          </Text>

          {/* FOTO estilo Uber */}
          <TouchableOpacity
            onPress={pickImage}
            className="w-full h-[220px] bg-[#F3F3F3] rounded-2xl border border-gray-300 items-center justify-center mb-7 overflow-hidden"
            style={{ borderStyle: "dashed", borderWidth: 1.5 }}
          >
            {photo ? (
              <Image
                source={{ uri: photo }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <View className="w-14 h-14 rounded-full bg-gray-200 items-center justify-center mb-2">
                  <Ionicons name="camera" size={26} color="#777" />
                </View>
                <Text className="text-gray-600 font-medium">
                  Subir foto del desaparecido
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* INPUTS TIPO UBER */}
          <View className="gap-5">

            <TextInput
              mode="flat"
              label="Nombre completo"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              underlineColor="transparent"
              className="rounded-xl bg-surface"
              style={{ backgroundColor: "#FAFAFA" }}
            />

            <View className="flex-row gap-4">
              <TextInput
                mode="flat"
                label="Edad"
                value={formData.age}
                keyboardType="numeric"
                onChangeText={(t) => setFormData({ ...formData, age: t })}
                underlineColor="transparent"
                className="flex-1 rounded-xl bg-surface"
                style={{ backgroundColor: "#FAFAFA" }}
              />

              <TextInput
                mode="flat"
                label="Última ubicación"
                value={formData.lastLocation}
                onChangeText={(t) =>
                  setFormData({ ...formData, lastLocation: t })
                }
                underlineColor="transparent"
                className="flex-[2] rounded-xl bg-surface"
                style={{ backgroundColor: "#FAFAFA" }}
              />
            </View>

            <TextInput
              mode="flat"
              label="Descripción física"
              value={formData.description}
              onChangeText={(t) =>
                setFormData({ ...formData, description: t })
              }
              multiline
              numberOfLines={3}
              underlineColor="transparent"
              className="rounded-xl bg-surface"
              style={{ backgroundColor: "#FAFAFA" }}
            />

            <TextInput
              mode="flat"
              label="Vestimenta"
              value={formData.clothing}
              onChangeText={(t) =>
                setFormData({ ...formData, clothing: t })
              }
              underlineColor="transparent"
              className="rounded-xl bg-surface"
              style={{ backgroundColor: "#FAFAFA" }}
            />

            <TextInput
              mode="flat"
              label="Circunstancias (Opcional)"
              value={formData.circumstances}
              onChangeText={(t) =>
                setFormData({ ...formData, circumstances: t })
              }
              multiline
              numberOfLines={3}
              underlineColor="transparent"
              className="rounded-xl bg-surface"
              style={{ backgroundColor: "#FAFAFA" }}
            />
          </View>

          {/* BOTÓN ESTILO UBER */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            buttonColor="#D32F2F"
            className="rounded-full py-1.5 mt-9"
            labelStyle={{ fontSize: 16, fontWeight: "700" }}
          >
            Enviar para validación
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
