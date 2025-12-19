import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
import Loader from '../../../components/shared/Loader';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import newsService from '../../../services/newsService';
import { resolveAssetUrl } from '../../../utils/assetUrl';

const CATEGORIES = [
    { value: 'alert', label: 'Alerta', color: '#EF4444', bg: '#FEE2E2' },
    { value: 'update', label: 'Actualización', color: '#3B82F6', bg: '#DBEAFE' },
    { value: 'success', label: 'Éxito', color: '#10B981', bg: '#D1FAE5' },
    { value: 'prevention', label: 'Prevención', color: '#F59E0B', bg: '#FEF3C7' },
    { value: 'general', label: 'General', color: '#6B7280', bg: '#F3F4F6' },
];

export default function EditNews() {
    const { id } = useLocalSearchParams();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('alert');
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [isPublished, setIsPublished] = useState(false);
    const [dates, setDates] = useState({ created: null, updated: null });

    const loadNews = useCallback(async () => {
        try {
            console.log('📝 [EditNews] Loading news with ID:', id);
            const response = await newsService.getNewsById(id);

            console.log('📝 [EditNews] Response received structure:', Object.keys(response));

            // Logic check: verify where the 'data' is
            // Service fix: response IS the data object now (or contains it directly)
            // But checking for safety if it comes nested
            const news = response.data || response;

            if (!news || !news.title) {
                console.error('❌ [EditNews] News data is missing/invalid:', news);
                throw new Error('Datos de la noticia incompletos');
            }

            console.log('📝 [EditNews] Setting state with news:', news.title);

            setTitle(news.title || '');
            setSummary(news.summary || '');
            setContent(news.content || '');
            setCategory(news.category || 'alert');
            setIsPublished(news.isPublished || false);
            setDates({
                created: news.createdAt,
                updated: news.updatedAt
            });

            if (news.image) {
                setExistingImage(resolveAssetUrl(news.image));
            }
        } catch (err) {
            console.error('❌ [EditNews] Error loading news:', err);
            Alert.alert('Error', err.message || 'No se pudo cargar la noticia', [
                { text: 'OK', onPress: () => router.back() }
            ]);
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

    const checkImageBeforePublish = () => {
        return new Promise((resolve, reject) => {
            if (!isPublished) {
                resolve(true);
                return;
            }
            if (isPublished && (image || existingImage)) {
                resolve(true);
                return;
            }
            Alert.alert(
                'Sin imagen',
                'Estás a punto de publicar sin imagen. ¿Deseas continuar?',
                [
                    { text: 'Cancelar', style: 'cancel', onPress: () => reject('cancelled') },
                    {
                        text: 'Seleccionar imagen',
                        onPress: async () => {
                            try {
                                await pickImage();
                                resolve(true);
                            } catch (err) {
                                reject('image_picker_failed');
                            }
                        }
                    },
                    { text: 'Publicar sin imagen', style: 'destructive', onPress: () => resolve(true) }
                ],
                { cancelable: false }
            );
        });
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
            await checkImageBeforePublish();
            setSaving(true);

            console.log('📝 [EditNews] Submitting update...');

            const formData = new FormData();
            formData.append('title', title);
            formData.append('summary', summary);
            formData.append('content', content);
            formData.append('category', category);
            formData.append('isPublished', String(isPublished));

            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const extension = match ? match[1] : 'jpg';
                const type = `image/${extension}`;

                formData.append('image', {
                    uri: image,
                    name: filename,
                    type: type,
                });
            }

            await newsService.updateNews(id, formData);
            console.log('✅ [EditNews] Update successful');

            Alert.alert('✅ Actualizado', 'La noticia ha sido actualizada.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err) {
            console.error('❌ [EditNews] Error updating:', err);
            // Don't alert if user cancelled image check
            if (err !== 'cancelled') {
                Alert.alert('Error', err.message || 'No se pudo actualizar');
            }
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

    if (!isAuthenticated || user?.role !== 'admin') return null;

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Cargando..." showBack />
                <Loader fullScreen message="Obteniendo expediente..." />
            </View>
        );
    }

    const currentImage = image || existingImage;
    const CategoryIcon = () => {
        const cat = CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
        return <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color, marginRight: 6 }} />;
    };

    return (
        <View className="flex-1 bg-[#F9FAFB]">
            <AdminHeader
                title="Editar Expediente"
                subtitle={`ID: ${id.substring(0, 8)}...`}
                showBack
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {/* Header Image Section */}
                    <View className="w-full h-64 bg-gray-200 relative mb-6">
                        {currentImage ? (
                            <Image
                                source={{ uri: currentImage }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <View className="w-full h-full items-center justify-center bg-gray-200">
                                <Ionicons name="image-outline" size={64} color="#9CA3AF" />
                                <Text className="text-gray-400 mt-2 font-medium">Sin imagen de portada</Text>
                            </View>
                        )}

                        {/* Overlay Gradient/Button */}
                        <View className="absolute inset-0 bg-black/10 justify-end p-4">
                            <TouchableOpacity
                                onPress={pickImage}
                                className="bg-white/90 self-end px-4 py-2 rounded-full flex-row items-center backdrop-blur-sm"
                                style={theme.shadows.sm}
                            >
                                <Ionicons name="camera" size={18} color="#374151" />
                                <Text className="ml-2 font-bold text-gray-700 text-xs uppercase">
                                    {currentImage ? 'Cambiar Foto' : 'Subir Foto'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="px-5 space-y-5">
                        {/* Status Badge & Dates */}
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-row gap-2">
                                <View className={`px-3 py-1 rounded-full flex-row items-center border ${isPublished ? 'bg-green-50 border-green-200' : 'bg-gray-100 border-gray-200'}`}>
                                    <View className={`w-2 h-2 rounded-full mr-2 ${isPublished ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <Text className={`text-xs font-bold uppercase ${isPublished ? 'text-green-700' : 'text-gray-600'}`}>
                                        {isPublished ? 'Publicado' : 'Borrador'}
                                    </Text>
                                </View>
                                {!currentImage && isPublished && (
                                    <View className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 flex-row items-center">
                                        <Ionicons name="warning" size={12} color="#F59E0B" />
                                        <Text className="ml-1 text-xs font-bold text-orange-700 uppercase">Sin Imagen</Text>
                                    </View>
                                )}
                            </View>
                            {dates.updated && (
                                <Text className="text-[10px] text-gray-400 text-right">
                                    Act. {new Date(dates.updated).toLocaleDateString()}
                                </Text>
                            )}
                        </View>

                        {/* General Info Card */}
                        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
                                <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary.main} />
                                <Text className="ml-2 font-bold text-gray-800 text-sm uppercase">Información General</Text>
                            </View>

                            {/* Title Input */}
                            <View className="mb-4">
                                <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Título del Caso *</Text>
                                <TextInput
                                    value={title}
                                    onChangeText={setTitle}
                                    placeholder="Escribe un título descriptivo..."
                                    className="text-lg font-bold text-gray-900 border-b border-gray-200 py-2"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>

                            {/* Category Selector */}
                            <View className="mb-4">
                                <Text className="text-xs font-bold text-gray-500 uppercase mb-3">Categoría</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2 px-2">
                                    {CATEGORIES.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.value}
                                            onPress={() => setCategory(cat.value)}
                                            className="mr-2 px-4 py-2 rounded-lg border flex-row items-center"
                                            style={{
                                                backgroundColor: category === cat.value ? cat.bg : 'white',
                                                borderColor: category === cat.value ? cat.color : '#E5E7EB',
                                            }}
                                        >
                                            <View
                                                className="w-2 h-2 rounded-full mr-2"
                                                style={{ backgroundColor: cat.color }}
                                            />
                                            <Text
                                                className="text-xs font-bold"
                                                style={{ color: category === cat.value ? '#1F2937' : '#6B7280' }}
                                            >
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Summary Input */}
                            <View>
                                <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Resumen Ejecutivo</Text>
                                <TextInput
                                    value={summary}
                                    onChangeText={setSummary}
                                    placeholder="Breve descripción para listados..."
                                    multiline
                                    className="bg-gray-50 p-3 rounded-xl text-gray-700 text-sm leading-5"
                                    style={{ minHeight: 80, textAlignVertical: 'top' }}
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        {/* Content Card */}
                        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <View className="flex-row items-center mb-4 pb-2 border-b border-gray-100">
                                <Ionicons name="document-text-outline" size={20} color={theme.colors.primary.main} />
                                <Text className="ml-2 font-bold text-gray-800 text-sm uppercase">Detalle del Reporte</Text>
                            </View>

                            <TextInput
                                value={content}
                                onChangeText={setContent}
                                placeholder="Escribe el contenido detallado de la noticia aquí..."
                                multiline
                                className="text-gray-800 text-base leading-6"
                                style={{ minHeight: 250, textAlignVertical: 'top' }}
                                placeholderTextColor="#D1D5DB"
                            />
                        </View>

                        {/* Visibility Card */}
                        <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-row items-center justify-between">
                            <View className="flex-row items-center flex-1 mr-4">
                                <View className={`w-10 h-10 rounded-full items-center justify-center ${isPublished ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <Ionicons
                                        name={isPublished ? "eye" : "eye-off"}
                                        size={20}
                                        color={isPublished ? "#10B981" : "#9CA3AF"}
                                    />
                                </View>
                                <View className="ml-3">
                                    <Text className="font-bold text-gray-900">Visibilidad Pública</Text>
                                    <Text className="text-xs text-gray-500">
                                        {isPublished
                                            ? 'Visible para todos los usuarios en Home'
                                            : 'Oculto (Solo visible para Administradores)'}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsPublished(!isPublished)}
                                className={`w-12 h-7 rounded-full p-1 transition-all ${isPublished ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <View className={`w-5 h-5 bg-white rounded-full shadow-sm transform ${isPublished ? 'translate-x-5' : 'translate-x-0'}`} />
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>

                {/* Sticky Action Footer */}
                <View
                    className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-5 pt-4 pb-8 flex-row items-center gap-3 shadow-lg"
                    style={{ shadowColor: '#000', shadowOffset: { height: -4 }, shadowOpacity: 0.05 }}
                >
                    <TouchableOpacity
                        onPress={handleDelete}
                        className="w-12 h-12 items-center justify-center rounded-xl bg-red-50 border border-red-100"
                    >
                        <Ionicons name="trash-outline" size={24} color="#EF4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={saving}
                        className={`flex-1 h-12 rounded-xl flex-row items-center justify-center ${saving ? 'bg-gray-400' : 'bg-indigo-600'}`}
                        style={theme.shadows.md}
                    >
                        {saving ? (
                            <Loader size="small" color="white" />
                        ) : (
                            <>
                                <Ionicons name="save-outline" size={20} color="white" />
                                <Text className="text-white font-bold text-base ml-2">Guardar Cambios</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </KeyboardAvoidingView>
        </View>
    );
}
