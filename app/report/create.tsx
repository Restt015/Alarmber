import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  View,
} from 'react-native';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';

// Intentar importar expo-image-picker si está disponible
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  // expo-image-picker no está instalado
}


export default function CreateReportScreen() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    lastLocation: '',
    description: '',
    clothing: '',
    circumstances: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);

  const pickImage = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Funcionalidad no disponible',
        'Por favor instala expo-image-picker:\nnpm install expo-image-picker'
      );
      return;
    }
  
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la galería');
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };
  
  const takePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert(
        'Funcionalidad no disponible',
        'Por favor instala expo-image-picker para usar esta función:\nnpm install expo-image-picker'
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos para acceder a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const showImagePicker = () => {
    Alert.alert('Seleccionar Foto', 'Elige una opción', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Tomar Foto', onPress: takePhoto },
      { text: 'Elegir de Galería', onPress: pickImage },
    ]);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return false;
    }
    if (!formData.age.trim()) {
      Alert.alert('Error', 'La edad es requerida');
      return false;
    }
    if (!formData.lastLocation.trim()) {
      Alert.alert('Error', 'La última ubicación es requerida');
      return false;
    }
    if (!formData.description.trim()) {
      Alert.alert('Error', 'La descripción física es requerida');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Aquí normalmente se enviaría al servidor
    // Por ahora solo navegamos a success
    router.push('/report/success');
  };

  const theme = useTheme();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-5 pb-2.5">
        <Text variant="bodyMedium" className="opacity-70 leading-6">
          Completa el formulario con la información disponible sobre la persona desaparecida.
        </Text>
      </View>

      <View className="px-5 mb-5">
        <Text variant="titleMedium" className="mb-3 font-bold">Foto</Text>
        <Button
          mode="outlined"
          onPress={showImagePicker}
          className="w-full h-[200px] rounded-xl overflow-hidden"
          contentStyle={{ width: '100%', height: '100%', padding: 0 }}
        >
          {photo ? (
            <Image source={{ uri: photo }} className="w-full h-full rounded-xl" />
          ) : (
            <View className="w-full h-full justify-center items-center rounded-xl">
              <Ionicons name="camera" size={40} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodyMedium" className="mt-2.5 opacity-60">Agregar Foto</Text>
            </View>
          )}
        </Button>
        {photo && (
          <Button
            mode="text"
            onPress={() => setPhoto(null)}
            textColor={theme.colors.error}
            className="mt-2.5 self-start"
          >
            Eliminar foto
          </Button>
        )}
      </View>

      <View className="px-5">
        <TextInput
          label="Nombre Completo *"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Nombre y apellidos"
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Edad *"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          placeholder="Edad en años"
          keyboardType="numeric"
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Última Ubicación Conocida *"
          value={formData.lastLocation}
          onChangeText={(text) => setFormData({ ...formData, lastLocation: text })}
          placeholder="¿Dónde fue vista por última vez?"
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Descripción Física *"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Estatura, peso, color de cabello, color de ojos, etc."
          multiline
          numberOfLines={3}
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Vestimenta"
          value={formData.clothing}
          onChangeText={(text) => setFormData({ ...formData, clothing: text })}
          placeholder="Describe la ropa que llevaba puesta"
          multiline
          numberOfLines={2}
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Circunstancias de la Desaparición"
          value={formData.circumstances}
          onChangeText={(text) => setFormData({ ...formData, circumstances: text })}
          placeholder="Detalles sobre cómo y cuándo desapareció"
          multiline
          numberOfLines={4}
          mode="outlined"
          className="mb-5"
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSubmit}
        className="mx-5 mt-2.5 mb-4"
        buttonColor={theme.colors.error}
      >
        Enviar Reporte
      </Button>

      <Text variant="bodySmall" className="text-center mx-5 mb-5 opacity-60">
        * Campos obligatorios. La información será revisada antes de publicarse.
      </Text>

      <View className="h-5" />
    </ScrollView>
  );
}


