import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View
} from "react-native";
import { Button } from "react-native-paper";

import PhotoUploader from '../../components/reports/PhotoUploader';
import ReportForm from '../../components/reports/ReportForm';
import PageHeader from '../../components/shared/PageHeader';

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
    <View className="flex-1 bg-white">
      <PageHeader
        title="Nuevo Reporte"
        showBack={true}
      />

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

          <PhotoUploader
            photo={photo}
            onPickImage={pickImage}
          />

          <ReportForm
            formData={formData}
            setFormData={setFormData}
          />

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
    </View>
  );
}
