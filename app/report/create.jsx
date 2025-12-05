import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const CustomInput = ({ label, value, onChangeText, icon, multiline = false, keyboardType = "default", style }) => (
  <View className="mb-5" style={style}>
    <Text className="text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wider ml-1">
      {label}
    </Text>
    <View
      className={`flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 ${multiline ? 'items-start py-3' : 'h-[56px]'}`}
    >
      <Ionicons
        name={icon}
        size={20}
        color="#9E9E9E"
        style={{ marginRight: 12, marginTop: multiline ? 2 : 0 }}
      />
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={`Ingresa ${label.toLowerCase()}`}
        placeholderTextColor="#BDBDBD"
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        className="flex-1 text-[16px] text-gray-900 font-medium"
        style={{ textAlignVertical: multiline ? 'top' : 'center', height: multiline ? 100 : '100%' }}
      />
    </View>
  </View>
);

export default function CreateReportScreen() {
  const router = useRouter();
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
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center px-4 py-2 border-b border-gray-100 bg-white">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
        >
          <Ionicons name="close" size={24} color="#1A1A1A" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-[18px] font-bold text-gray-900">
          Nuevo Reporte
        </Text>

        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          <Text className="text-gray-500 text-[15px] leading-6 mb-8 text-center">
            Por favor, proporciona información detallada y veraz. Tu reporte ayudará a la comunidad y autoridades.
          </Text>

          {/* FOTO UPLOAD */}
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.8}
            className="w-full h-[240px] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center mb-8 overflow-hidden shadow-sm"
          >
            {photo ? (
              <Image
                source={{ uri: photo }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="items-center">
                <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-3">
                  <Ionicons name="camera" size={32} color="#D32F2F" />
                </View>
                <Text className="text-gray-900 font-bold text-[16px]">
                  Subir Fotografía
                </Text>
                <Text className="text-gray-400 text-[13px] mt-1">
                  Toca para seleccionar
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* FORMULARIO */}
          <View>
            <CustomInput
              label="Nombre Completo"
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
              icon="person-outline"
            />

            <View className="flex-row gap-4">
              <CustomInput
                label="Edad"
                value={formData.age}
                onChangeText={(t) => setFormData({ ...formData, age: t })}
                icon="calendar-outline"
                keyboardType="numeric"
                style={{ flex: 1 }}
              />

              <CustomInput
                label="Última Ubicación"
                value={formData.lastLocation}
                onChangeText={(t) => setFormData({ ...formData, lastLocation: t })}
                icon="location-outline"
                style={{ flex: 1.5 }}
              />
            </View>

            <CustomInput
              label="Descripción Física"
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              icon="body-outline"
              multiline={true}
            />

            <CustomInput
              label="Vestimenta"
              value={formData.clothing}
              onChangeText={(t) => setFormData({ ...formData, clothing: t })}
              icon="shirt-outline"
            />

            <CustomInput
              label="Circunstancias (Opcional)"
              value={formData.circumstances}
              onChangeText={(t) => setFormData({ ...formData, circumstances: t })}
              icon="information-circle-outline"
              multiline={true}
            />
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            buttonColor="#D32F2F"
            className="rounded-2xl py-2 mt-4 shadow-md"
            labelStyle={{ fontSize: 17, fontWeight: "700", letterSpacing: 0.5 }}
            contentStyle={{ height: 56 }}
          >
            Enviar Reporte
          </Button>

          <View className="h-10" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
