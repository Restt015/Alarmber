import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import Loader from '../../../components/shared/Loader';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import newsService from '../../../services/newsService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const CATEGORIES = [
    { value: 'alerta', label: 'Alerta' },
    { value: 'operativo', label: 'Operativo' },
    { value: 'prevencion', label: 'Prevención' },
    { value: 'comunidad', label: 'Comunidad' },
    { value: 'oficial', label: 'Comunicado Oficial' },
];

export default function EditNews() {
    const { id } = useLocalSearchParams();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('alerta');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [isPublished, setIsPublished] = useState(false);

    const loadNews = useCallback(async () => {
        try {
            const response = await newsService.getNewsById(id);
            const news = response.data;
            setTitle(news.title || '');
            setSummary(news.summary || '');
            setContent(news.content || '');
            setCategory(news.category || 'alerta');
            setIsPublished(news.isPublished || false);
            if (news.image) {
                const imageUrl = news.image.startsWith('http')
                    ? news.image
                    : `${API_URL}/${news.image.replace(/\\/g, '/')}`;
                setExistingImage(imageUrl);
            }
        } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo cargar la noticia');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadNews();
        }
    }, [isAuthenticated, user, loadNews]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setExistingImage(null);
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
            setSaving(true);

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

            await newsService.updateNews(id, formData);
            Alert.alert('✅ Actualizado', 'La noticia ha sido actualizada.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            console.error('Error updating news:', err);
            Alert.alert('Error', err.message || 'No se pudo actualizar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar Noticia',
            '¿Estás seguro? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await newsService.deleteNews(id);
                            Alert.alert('Eliminado', 'La noticia ha sido eliminada.');
                            router.back();
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Editar Noticia" showBack />
                <Loader fullScreen message="Cargando noticia..." />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Editar Noticia" showBack />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                >
                    {/* Image */}
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
                        {(image || existingImage) ? (
                            <Image
                                source={{ uri: image || existingImage }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="items-center">
                                <Ionicons name="image-outline" size={48} color={theme.colors.gray[400]} />
                                <Text className="mt-2" style={{ color: theme.colors.gray[500] }}>
                                    Toca para cambiar imagen
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
                                style={{ fontSize: 16, color: theme.colors.gray[900], ...theme.shadows.sm }}
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
                                placeholder="Breve descripción"
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={2}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], minHeight: 80, textAlignVertical: 'top', ...theme.shadows.sm }}
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
                                                backgroundColor: category === cat.value ? theme.colors.primary.main : theme.colors.white,
                                                borderWidth: 1,
                                                borderColor: category === cat.value ? theme.colors.primary.main : theme.colors.gray[300],
                                            }}
                                        >
                                            <Text className="font-medium" style={{ color: category === cat.value ? 'white' : theme.colors.gray[700] }}>
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
                                placeholder="Contenido completo..."
                                placeholderTextColor={theme.colors.gray[400]}
                                multiline
                                numberOfLines={8}
                                className="bg-white p-4 rounded-xl"
                                style={{ fontSize: 14, color: theme.colors.gray[900], minHeight: 200, textAlignVertical: 'top', ...theme.shadows.sm }}
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
                                        {isPublished ? 'Publicado' : 'Borrador'}
                                    </Text>
                                </View>
                            </View>
                            <View className="w-12 h-7 rounded-full justify-center" style={{ backgroundColor: isPublished ? theme.colors.success.main : theme.colors.gray[300], paddingHorizontal: 2 }}>
                                <View className="w-6 h-6 bg-white rounded-full" style={{ alignSelf: isPublished ? 'flex-end' : 'flex-start' }} />
                            </View>
                        </TouchableOpacity>

                        {/* Buttons */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={saving}
                            className="py-4 rounded-xl items-center mb-3"
                            style={{ backgroundColor: saving ? theme.colors.gray[400] : theme.colors.success.main, ...theme.shadows.md }}
                        >
                            <Text className="text-white font-bold text-[16px]">{saving ? 'Guardando...' : 'Guardar Cambios'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            className="py-4 rounded-xl items-center border"
                            style={{ borderColor: theme.colors.primary.main }}
                        >
                            <Text className="font-bold text-[16px]" style={{ color: theme.colors.primary.main }}>Eliminar Noticia</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
