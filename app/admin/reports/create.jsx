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
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import reportService from '../../../services/reportService';

const PRIORITY_OPTIONS = [
    { value: 'alta', label: 'Alta Prioridad', color: theme.colors.primary.main },
    { value: 'media', label: 'Media', color: theme.colors.warning.main },
    { value: 'baja', label: 'Baja', color: theme.colors.gray[500] },
];

export default function AdminCreateReport() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "male",
        lastLocation: "",
        description: "",
        clothing: "",
        circumstances: "",
        relationship: "official",
        priority: "media",
        contactPhone: "",
        contactEmail: "",
    });

    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Permisos necesarios", "Debes habilitar acceso a fotos.");
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

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert("Campos incompletos", error);
            return;
        }

        setLoading(true);
        try {
            await reportService.createReport({
                ...formData,
                photo,
                createdByAdmin: true,
                validated: true, // Auto-approve admin reports
            });

            Alert.alert(
                "✅ Reporte Creado",
                "El reporte ha sido creado y es visible para los usuarios.",
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error creating report:', error);
            Alert.alert("Error", "No se pudo crear el reporte. Intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Crear Reporte" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Photo Uploader */}
                    <TouchableOpacity
                        onPress={pickImage}
                        className="mx-5 mt-4 h-64 rounded-2xl overflow-hidden items-center justify-center"
                        style={{
                            backgroundColor: theme.colors.gray[200],
                            borderWidth: 2,
                            borderColor: theme.colors.gray[300],
                            borderStyle: 'dashed',
                        }}
                    >
                        {photo ? (
                            <Image source={{ uri: photo }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="items-center">
                                <Ionicons name="camera-outline" size={48} color={theme.colors.gray[400]} />
                                <Text className="mt-2 text-[14px]" style={{ color: theme.colors.gray[500] }}>
                                    Toca para agregar foto
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View className="px-5 mt-6">
                        {/* Name */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Nombre Completo *
                            </Text>
                            <TextInput
                                value={formData.name}
                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                placeholder="Nombre de la persona"
                                placeholderTextColor={theme.colors.gray[400]}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 16, color: theme.colors.gray[900], ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Age and Gender */}
                        <View className="flex-row mb-4">
                            <View className="flex-1 mr-2">
                                <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                    Edad *
                                </Text>
                                <TextInput
                                    value={formData.age}
                                    onChangeText={(text) => setFormData({ ...formData, age: text })}
                                    placeholder="Años"
                                    keyboardType="numeric"
                                    placeholderTextColor={theme.colors.gray[400]}
                                    className="bg-white p-4 rounded-xl"
                                    style={{ fontSize: 16, color: theme.colors.gray[900], ...theme.shadows.sm }}
                                />
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                    Género
                                </Text>
                                <View className="flex-row bg-white rounded-xl" style={theme.shadows.sm}>
                                    <TouchableOpacity
                                        onPress={() => setFormData({ ...formData, gender: 'male' })}
                                        className="flex-1 py-4 items-center rounded-l-xl"
                                        style={{
                                            backgroundColor: formData.gender === 'male' ? theme.colors.secondary.main : 'white'
                                        }}
                                    >
                                        <Text style={{ color: formData.gender === 'male' ? 'white' : theme.colors.gray[600] }}>
                                            Hombre
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setFormData({ ...formData, gender: 'female' })}
                                        className="flex-1 py-4 items-center rounded-r-xl"
                                        style={{
                                            backgroundColor: formData.gender === 'female' ? theme.colors.secondary.main : 'white'
                                        }}
                                    >
                                        <Text style={{ color: formData.gender === 'female' ? 'white' : theme.colors.gray[600] }}>
                                            Mujer
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        {/* Priority */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Prioridad
                            </Text>
                            <View className="flex-row">
                                {PRIORITY_OPTIONS.map((option) => (
                                    <TouchableOpacity
                                        key={option.value}
                                        onPress={() => setFormData({ ...formData, priority: option.value })}
                                        className="flex-1 py-3 items-center rounded-xl mr-2"
                                        style={{
                                            backgroundColor: formData.priority === option.value ? option.color : 'white',
                                            ...theme.shadows.sm
                                        }}
                                    >
                                        <Text
                                            className="text-[14px] font-semibold"
                                            style={{ color: formData.priority === option.value ? 'white' : theme.colors.gray[700] }}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Last Location */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Última Ubicación Conocida *
                            </Text>
                            <TextInput
                                value={formData.lastLocation}
                                onChangeText={(text) => setFormData({ ...formData, lastLocation: text })}
                                placeholder="Dirección o lugar donde fue visto por última vez"
                                placeholderTextColor={theme.colors.gray[400]}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Description */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Descripción Física *
                            </Text>
                            <TextInput
                                value={formData.description}
                                onChangeText={(text) => setFormData({ ...formData, description: text })}
                                placeholder="Estatura, complexión, rasgos distintivos..."
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={3}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], minHeight: 80, textAlignVertical: 'top', ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Clothing */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Vestimenta
                            </Text>
                            <TextInput
                                value={formData.clothing}
                                onChangeText={(text) => setFormData({ ...formData, clothing: text })}
                                placeholder="Última ropa que vestía..."
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={2}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], minHeight: 60, textAlignVertical: 'top', ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Circumstances */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Circunstancias
                            </Text>
                            <TextInput
                                value={formData.circumstances}
                                onChangeText={(text) => setFormData({ ...formData, circumstances: text })}
                                placeholder="Detalles sobre la desaparición..."
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={3}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], minHeight: 80, textAlignVertical: 'top', ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Contact Information */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Teléfono de Contacto
                            </Text>
                            <TextInput
                                value={formData.contactPhone}
                                onChangeText={(text) => setFormData({ ...formData, contactPhone: text })}
                                placeholder="Número de contacto para información"
                                placeholderTextColor={theme.colors.gray[400]}
                                keyboardType="phone-pad"
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], ...theme.shadows.sm }}
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Email de Contacto
                            </Text>
                            <TextInput
                                value={formData.contactEmail}
                                onChangeText={(text) => setFormData({ ...formData, contactEmail: text })}
                                placeholder="Correo electrónico de contacto"
                                placeholderTextColor={theme.colors.gray[400]}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], ...theme.shadows.sm }}
                            />
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="py-4 rounded-xl items-center"
                            style={{
                                backgroundColor: loading ? theme.colors.gray[400] : theme.colors.primary.main,
                                ...theme.shadows.md,
                            }}
                        >
                            {loading ? (
                                <Text className="text-white font-bold text-[16px]">Creando...</Text>
                            ) : (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={22} color="white" />
                                    <Text className="text-white font-bold text-[16px] ml-2">
                                        Crear Reporte
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
