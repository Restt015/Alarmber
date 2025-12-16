import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import ErrorState from '../../../components/shared/ErrorState';
import SkeletonCard from '../../../components/shared/SkeletonCard';
import { theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import newsService from '../../../services/newsService';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function AdminNewsList() {
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [news, setNews] = useState([]);

    const loadNews = useCallback(async () => {
        try {
            setError(null);
            const response = await newsService.getAllNews({ limit: 50 });
            setNews(response.data || []);
        } catch (err) {
            console.error('Error loading news:', err);
            setError(err.message || 'Error al cargar noticias');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            loadNews();
        }
    }, [isAuthenticated, user, loadNews]);

    const handleRefresh = () => {
        setRefreshing(true);
        loadNews();
    };

    const handleDelete = (id, title) => {
        Alert.alert(
            'Eliminar Noticia',
            `¿Estás seguro de eliminar "${title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await newsService.deleteNews(id);
                            setNews(prev => prev.filter(n => n._id !== id));
                            Alert.alert('Eliminado', 'La noticia ha sido eliminada.');
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await newsService.togglePublish(id, !currentStatus);
            setNews(prev => prev.map(n =>
                n._id === id ? { ...n, isPublished: !currentStatus } : n
            ));
        } catch (err) {
            Alert.alert('Error', err.message || 'No se pudo cambiar el estado');
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Sin fecha';
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}/${imagePath.replace(/\\/g, '/')}`;
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Noticias" showBack />
                <View className="px-5 pt-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            </View>
        );
    }

    if (error && news.length === 0) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Noticias" showBack />
                <ErrorState
                    title="Error al cargar"
                    message={error}
                    onRetry={loadNews}
                />
            </View>
        );
    }

    if (!isAuthenticated || user?.role !== 'admin') {
        return null;
    }

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Noticias Policiales" showBack />

            {/* FAB Create Button */}
            <TouchableOpacity
                onPress={() => router.push('/admin/news/create')}
                style={{
                    position: 'absolute',
                    bottom: 30,
                    right: 20,
                    zIndex: 100,
                    backgroundColor: theme.colors.primary.main,
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...theme.shadows.lg,
                }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary.main]}
                        tintColor={theme.colors.primary.main}
                    />
                }
            >
                {/* Stats Banner */}
                <View
                    className="mx-5 mt-4 p-4 rounded-2xl flex-row items-center"
                    style={{ backgroundColor: theme.colors.secondary.light }}
                >
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: theme.colors.secondary.main }}
                    >
                        <Ionicons name="newspaper" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[28px] font-black" style={{ color: theme.colors.secondary.main }}>
                            {news.length}
                        </Text>
                        <Text className="text-[14px]" style={{ color: theme.colors.gray[600] }}>
                            Noticias en el sistema
                        </Text>
                    </View>
                </View>

                {/* News List */}
                <View className="px-5 mt-6">
                    {news.length > 0 ? (
                        news.map((item) => (
                            <View
                                key={item._id}
                                className="bg-white rounded-2xl mb-4 overflow-hidden"
                                style={theme.shadows.card}
                            >
                                {/* Image */}
                                {item.image && (
                                    <Image
                                        source={{ uri: getImageUrl(item.image) }}
                                        style={{ width: '100%', height: 150 }}
                                        resizeMode="cover"
                                    />
                                )}

                                {/* Content */}
                                <TouchableOpacity
                                    onPress={() => router.push(`/admin/news/${item._id}`)}
                                    className="p-4"
                                >
                                    {/* Status Badge */}
                                    <View className="flex-row items-center mb-2">
                                        <View
                                            className="px-2 py-1 rounded-full"
                                            style={{
                                                backgroundColor: item.isPublished
                                                    ? theme.colors.success.light
                                                    : theme.colors.gray[200]
                                            }}
                                        >
                                            <Text
                                                className="text-[10px] font-bold uppercase"
                                                style={{
                                                    color: item.isPublished
                                                        ? theme.colors.success.main
                                                        : theme.colors.gray[600]
                                                }}
                                            >
                                                {item.isPublished ? 'Publicado' : 'Borrador'}
                                            </Text>
                                        </View>
                                        {item.category && (
                                            <Text
                                                className="text-[11px] ml-2 uppercase font-medium"
                                                style={{ color: theme.colors.gray[500] }}
                                            >
                                                {item.category}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Title */}
                                    <Text
                                        className="text-[16px] font-bold mb-2"
                                        style={{ color: theme.colors.gray[900] }}
                                        numberOfLines={2}
                                    >
                                        {item.title}
                                    </Text>

                                    {/* Summary */}
                                    {item.summary && (
                                        <Text
                                            className="text-[13px] mb-3"
                                            style={{ color: theme.colors.gray[600] }}
                                            numberOfLines={2}
                                        >
                                            {item.summary}
                                        </Text>
                                    )}

                                    {/* Meta */}
                                    <View className="flex-row items-center">
                                        <Ionicons name="calendar-outline" size={14} color={theme.colors.gray[400]} />
                                        <Text className="text-[12px] ml-1" style={{ color: theme.colors.gray[500] }}>
                                            {formatDate(item.publishedAt || item.createdAt)}
                                        </Text>
                                        <Text className="mx-2" style={{ color: theme.colors.gray[300] }}>•</Text>
                                        <Ionicons name="eye-outline" size={14} color={theme.colors.gray[400]} />
                                        <Text className="text-[12px] ml-1" style={{ color: theme.colors.gray[500] }}>
                                            {item.views || 0} vistas
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Actions */}
                                <View
                                    className="flex-row p-3 border-t"
                                    style={{
                                        borderTopColor: theme.colors.gray[200],
                                        backgroundColor: theme.colors.gray[50]
                                    }}
                                >
                                    {/* Toggle Publish */}
                                    <TouchableOpacity
                                        onPress={() => handleTogglePublish(item._id, item.isPublished)}
                                        className="flex-1 flex-row items-center justify-center py-2"
                                    >
                                        <Ionicons
                                            name={item.isPublished ? "eye-off-outline" : "eye-outline"}
                                            size={18}
                                            color={theme.colors.gray[600]}
                                        />
                                        <Text className="ml-2 text-[13px]" style={{ color: theme.colors.gray[600] }}>
                                            {item.isPublished ? 'Ocultar' : 'Publicar'}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Edit */}
                                    <TouchableOpacity
                                        onPress={() => router.push(`/admin/news/${item._id}`)}
                                        className="flex-1 flex-row items-center justify-center py-2"
                                    >
                                        <Ionicons name="create-outline" size={18} color={theme.colors.secondary.main} />
                                        <Text className="ml-2 text-[13px]" style={{ color: theme.colors.secondary.main }}>
                                            Editar
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Delete */}
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item._id, item.title)}
                                        className="flex-1 flex-row items-center justify-center py-2"
                                    >
                                        <Ionicons name="trash-outline" size={18} color={theme.colors.primary.main} />
                                        <Text className="ml-2 text-[13px]" style={{ color: theme.colors.primary.main }}>
                                            Eliminar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="py-16 items-center">
                            <View
                                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                                style={{ backgroundColor: theme.colors.gray[200] }}
                            >
                                <Ionicons name="newspaper-outline" size={40} color={theme.colors.gray[400]} />
                            </View>
                            <Text className="text-[18px] font-bold" style={{ color: theme.colors.gray[900] }}>
                                Sin noticias
                            </Text>
                            <Text className="text-[14px] mt-2 mb-4" style={{ color: theme.colors.gray[500] }}>
                                Crea tu primera noticia policial
                            </Text>
                            <TouchableOpacity
                                onPress={() => router.push('/admin/news/create')}
                                className="px-6 py-3 rounded-full"
                                style={{ backgroundColor: theme.colors.primary.main }}
                            >
                                <Text className="text-white font-bold">Crear Noticia</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
