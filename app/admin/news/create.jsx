import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import newsService from '../../../services/newsService';

const CATEGORIES = [
    { value: 'alert', label: 'Alerta' },
    { value: 'update', label: 'Actualización' },
    { value: 'prevention', label: 'Prevención' },
    { value: 'success', label: 'Éxito' },
    { value: 'general', label: 'General' },
];

export default function CreateNews() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('alert');
    const [image, setImage] = useState(null);
    const [isPublished, setIsPublished] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'El título es requerido');
            return;
        }
        if (!content.trim()) {
            Alert.alert('Error', 'El contenido es requerido');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('title', title);
            formData.append('summary', summary);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('isPublished', isPublished);

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                formData.append('image', {
                    uri: image,
                    name: filename,
                    type,
                });
            }

            await newsService.createNews(formData);
            Alert.alert(
                '✅ Noticia Creada',
                isPublished ? 'La noticia ha sido publicada.' : 'La noticia ha sido guardada como borrador.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (err) {
            console.error('Error creating news:', err);
            Alert.alert('Error', err.message || 'No se pudo crear la noticia');
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Nueva Noticia" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Image Picker */}
                    <TouchableOpacity
                        onPress={pickImage}
                        className="mx-5 mt-4 h-48 rounded-2xl overflow-hidden items-center justify-center"
                        style={{
                            backgroundColor: theme.colors.gray[200],
                            borderWidth: 2,
                            borderColor: theme.colors.gray[300],
                            borderStyle: 'dashed',
                        }}
                    >
                        {image ? (
                            <Image
                                source={{ uri: image }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="items-center">
                                <Ionicons name="image-outline" size={48} color={theme.colors.gray[400]} />
                                <Text className="mt-2" style={{ color: theme.colors.gray[500] }}>
                                    Toca para agregar imagen
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Form */}
                    <View className="px-5 mt-6">
                        {/* Title */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Título *
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Título de la noticia"
                                placeholderTextColor={theme.colors.gray[400]}
                                className="bg-white p-4 rounded-xl"
                                style={{
                                    fontSize: 16,
                                    color: theme.colors.gray[900],
                                    ...theme.shadows.sm,
                                }}
                            />
                        </View>

                        {/* Summary */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Resumen
                            </Text>
                            <TextInput
                                value={summary}
                                onChangeText={setSummary}
                                placeholder="Breve descripción (opcional)"
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={2}
                                className="bg-white p-4 rounded-xl"
                                style={{
                                    fontSize: 14,
                                    color: theme.colors.gray[900],
                                    minHeight: 80,
                                    textAlignVertical: 'top',
                                    ...theme.shadows.sm,
                                }}
                            />
                        </View>

                        {/* Category */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Categoría
                            </Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row">
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.value}
                                            onPress={() => setCategory(cat.value)}
                                            className="mr-2 px-4 py-2 rounded-full"
                                            style={{
                                                backgroundColor: category === cat.value
                                                    ? theme.colors.primary.main
                                                    : theme.colors.white,
                                                borderWidth: 1,
                                                borderColor: category === cat.value
                                                    ? theme.colors.primary.main
                                                    : theme.colors.gray[300],
                                            }}
                                        >
                                            <Text
                                                className="font-medium"
                                                style={{
                                                    color: category === cat.value
                                                        ? 'white'
                                                        : theme.colors.gray[700],
                                                }}
                                            >
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Content */}
                        <View className="mb-4">
                            <Text className="text-[13px] font-bold mb-2 uppercase" style={{ color: theme.colors.gray[600] }}>
                                Contenido *
                            </Text>
                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Escribe el contenido completo de la noticia..."
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={8}
                                className="bg-white p-4 rounded-xl"
                                style={{
                                    fontSize: 14,
                                    color: theme.colors.gray[900],
                                    minHeight: 200,
                                    textAlignVertical: 'top',
                                    ...theme.shadows.sm,
                                }}
                            />
                        </View>

                        {/* Publish Toggle */}
                        <TouchableOpacity
                            onPress={() => setIsPublished(!isPublished)}
                            className="flex-row items-center justify-between bg-white p-4 rounded-xl mb-6"
                            style={theme.shadows.sm}
                        >
                            <View className="flex-row items-center">
                                <Ionicons
                                    name={isPublished ? "eye" : "eye-off"}
                                    size={24}
                                    color={isPublished ? theme.colors.success.main : theme.colors.gray[400]}
                                />
                                <View className="ml-3">
                                    <Text className="font-bold" style={{ color: theme.colors.gray[900] }}>
                                        Publicar inmediatamente
                                    </Text>
                                    <Text className="text-[12px]" style={{ color: theme.colors.gray[500] }}>
                                        {isPublished ? 'Los usuarios verán esta noticia' : 'Guardar como borrador'}
                                    </Text>
                                </View>
                            </View>
                            <View
                                className="w-12 h-7 rounded-full justify-center"
                                style={{
                                    backgroundColor: isPublished ? theme.colors.success.main : theme.colors.gray[300],
                                    paddingHorizontal: 2,
                                }}
                            >
                                <View
                                    className="w-6 h-6 bg-white rounded-full"
                                    style={{
                                        alignSelf: isPublished ? 'flex-end' : 'flex-start',
                                    }}
                                />
                            </View>
                        </TouchableOpacity>

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
                                <Text className="text-white font-bold text-[16px]">Guardando...</Text>
                            ) : (
                                <View className="flex-row items-center">
                                    <Ionicons name="checkmark-circle" size={22} color="white" />
                                    <Text className="text-white font-bold text-[16px] ml-2">
                                        {isPublished ? 'Publicar Noticia' : 'Guardar Borrador'}
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
