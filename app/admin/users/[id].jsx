import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import AdminHeader from '../../../components/admin/AdminHeader';
import Loader from '../../../components/shared/Loader';
import { getActivityColors, theme } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function UserDetail() {
    const { id } = useLocalSearchParams();
    const { user: currentUser, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUser = useCallback(async () => {
        try {
            const response = await api.get(`/users/${id}`);
            setUser(response.data.data);
        } catch (err) {
            console.error('Error loading user:', err);
            Alert.alert('Error', err.message || 'No se pudo cargar el usuario');
            router.back();
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && currentUser?.role === 'admin') {
            loadUser();
        }
    }, [isAuthenticated, currentUser, loadUser]);

    const handleChangeRole = async () => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const message = newRole === 'admin'
            ? `¿Convertir a "${user.name}" en administrador?`
            : `¿Remover permisos de administrador de "${user.name}"?`;

        Alert.alert(
            'Cambiar Rol',
            message,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await api.patch(`/users/${id}/role`, { role: newRole });
                            setUser(prev => ({ ...prev, role: newRole }));
                            Alert.alert('✅ Actualizado', `El rol ha sido cambiado a ${newRole}.`);
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo cambiar el rol');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleActive = async () => {
        const newStatus = !user.isActive;
        const message = newStatus
            ? `¿Reactivar la cuenta de "${user.name}"?`
            : `¿Desactivar la cuenta de "${user.name}"? No podrá acceder a la app.`;

        Alert.alert(
            newStatus ? 'Reactivar Cuenta' : 'Desactivar Cuenta',
            message,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    style: newStatus ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            setActionLoading(true);
                            await api.patch(`/users/${id}/status`, { isActive: newStatus });
                            setUser(prev => ({ ...prev, isActive: newStatus }));
                            Alert.alert('✅ Actualizado', newStatus ? 'Cuenta reactivada.' : 'Cuenta desactivada.');
                        } catch (err) {
                            Alert.alert('Error', err.message || 'No se pudo actualizar');
                        } finally {
                            setActionLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${API_URL}/${imagePath.replace(/\\/g, '/')}`;
    };

    const formatDate = (date) => {
        if (!date) return 'Sin fecha';
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAuthenticated || currentUser?.role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Usuario" showBack />
                <Loader fullScreen message="Cargando usuario..." />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 bg-gray-50">
                <AdminHeader title="Usuario" showBack />
                <View className="flex-1 items-center justify-center">
                    <Text style={{ color: theme.colors.gray[500] }}>Usuario no encontrado</Text>
                </View>
            </View>
        );
    }

    const activityStatus = user.activityStatus || { status: 'offline', label: 'Sin actividad' };
    const activityColors = getActivityColors(activityStatus.isOnline ? 'online' : 'recent');

    return (
        <View className="flex-1 bg-gray-50">
            <AdminHeader title="Detalle de Usuario" showBack />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Profile Card */}
                <View
                    className="mx-5 mt-4 bg-white rounded-2xl overflow-hidden"
                    style={theme.shadows.card}
                >
                    {/* Header with gradient */}
                    <View
                        className="h-24"
                        style={{ backgroundColor: user.role === 'admin' ? theme.colors.secondary.main : theme.colors.primary.main }}
                    />

                    {/* Avatar */}
                    <View className="items-center" style={{ marginTop: -50 }}>
                        <View
                            className="w-24 h-24 rounded-full overflow-hidden border-4 border-white"
                            style={{ backgroundColor: theme.colors.gray[200], ...theme.shadows.md }}
                        >
                            {user.profileImage ? (
                                <Image
                                    source={{ uri: getImageUrl(user.profileImage) }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="w-full h-full items-center justify-center">
                                    <Ionicons name="person" size={40} color={theme.colors.gray[400]} />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Info */}
                    <View className="items-center px-5 py-4 pb-6">
                        <Text className="text-[22px] font-black" style={{ color: theme.colors.gray[900] }}>
                            {user.name}
                        </Text>
                        <Text className="text-[14px] mt-1" style={{ color: theme.colors.gray[600] }}>
                            {user.email}
                        </Text>

                        {/* Role Badge */}
                        <View
                            className="px-4 py-1.5 rounded-full mt-3"
                            style={{
                                backgroundColor: user.role === 'admin'
                                    ? theme.colors.secondary.light
                                    : theme.colors.gray[200]
                            }}
                        >
                            <Text
                                className="text-[12px] font-bold uppercase"
                                style={{
                                    color: user.role === 'admin'
                                        ? theme.colors.secondary.main
                                        : theme.colors.gray[700]
                                }}
                            >
                                {user.role === 'admin' ? '👑 Administrador' : 'Usuario'}
                            </Text>
                        </View>

                        {/* Activity Status */}
                        <View className="flex-row items-center mt-3">
                            <View
                                className="w-3 h-3 rounded-full mr-2"
                                style={{ backgroundColor: activityColors.dot }}
                            />
                            <Text className="text-[13px]" style={{ color: activityColors.text }}>
                                {activityStatus.label || 'Sin actividad reciente'}
                            </Text>
                        </View>

                        {/* Account Status */}
                        {!user.isActive && (
                            <View
                                className="mt-3 px-3 py-1 rounded-full"
                                style={{ backgroundColor: theme.colors.primary.light }}
                            >
                                <Text className="text-[12px] font-bold" style={{ color: theme.colors.primary.main }}>
                                    ⚠️ Cuenta Desactivada
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Details Card */}
                <View
                    className="mx-5 mt-4 bg-white rounded-2xl p-5"
                    style={theme.shadows.card}
                >
                    <Text className="text-[16px] font-bold mb-4" style={{ color: theme.colors.gray[900] }}>
                        Información
                    </Text>

                    {/* Phone */}
                    <View className="flex-row items-center py-3 border-b" style={{ borderBottomColor: theme.colors.gray[200] }}>
                        <Ionicons name="call-outline" size={20} color={theme.colors.gray[500]} />
                        <Text className="flex-1 ml-3" style={{ color: theme.colors.gray[700] }}>
                            {user.phone || 'Sin teléfono'}
                        </Text>
                    </View>

                    {/* Created At */}
                    <View className="flex-row items-center py-3 border-b" style={{ borderBottomColor: theme.colors.gray[200] }}>
                        <Ionicons name="calendar-outline" size={20} color={theme.colors.gray[500]} />
                        <View className="flex-1 ml-3">
                            <Text style={{ color: theme.colors.gray[500], fontSize: 12 }}>Registrado</Text>
                            <Text style={{ color: theme.colors.gray[700] }}>{formatDate(user.createdAt)}</Text>
                        </View>
                    </View>

                    {/* Last Active */}
                    <View className="flex-row items-center py-3">
                        <Ionicons name="time-outline" size={20} color={theme.colors.gray[500]} />
                        <View className="flex-1 ml-3">
                            <Text style={{ color: theme.colors.gray[500], fontSize: 12 }}>Última actividad</Text>
                            <Text style={{ color: theme.colors.gray[700] }}>{formatDate(user.lastActive)}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions Card */}
                <View
                    className="mx-5 mt-4 bg-white rounded-2xl p-5"
                    style={theme.shadows.card}
                >
                    <Text className="text-[16px] font-bold mb-4" style={{ color: theme.colors.gray[900] }}>
                        Acciones
                    </Text>

                    {/* Change Role */}
                    <TouchableOpacity
                        onPress={handleChangeRole}
                        disabled={actionLoading || user._id === currentUser._id}
                        className="flex-row items-center justify-between py-4 border-b"
                        style={{
                            borderBottomColor: theme.colors.gray[200],
                            opacity: user._id === currentUser._id ? 0.5 : 1
                        }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="shield-outline" size={22} color={theme.colors.secondary.main} />
                            <View className="ml-3">
                                <Text className="font-medium" style={{ color: theme.colors.gray[900] }}>
                                    {user.role === 'admin' ? 'Remover Admin' : 'Hacer Admin'}
                                </Text>
                                <Text className="text-[12px]" style={{ color: theme.colors.gray[500] }}>
                                    {user.role === 'admin' ? 'Convertir en usuario normal' : 'Dar permisos de administrador'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
                    </TouchableOpacity>

                    {/* Toggle Active */}
                    <TouchableOpacity
                        onPress={handleToggleActive}
                        disabled={actionLoading || user._id === currentUser._id}
                        className="flex-row items-center justify-between py-4"
                        style={{ opacity: user._id === currentUser._id ? 0.5 : 1 }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons
                                name={user.isActive ? "close-circle-outline" : "checkmark-circle-outline"}
                                size={22}
                                color={user.isActive ? theme.colors.primary.main : theme.colors.success.main}
                            />
                            <View className="ml-3">
                                <Text className="font-medium" style={{ color: theme.colors.gray[900] }}>
                                    {user.isActive ? 'Desactivar Cuenta' : 'Reactivar Cuenta'}
                                </Text>
                                <Text className="text-[12px]" style={{ color: theme.colors.gray[500] }}>
                                    {user.isActive ? 'El usuario no podrá acceder' : 'Permitir acceso nuevamente'}
                                </Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.colors.gray[400]} />
                    </TouchableOpacity>

                    {user._id === currentUser._id && (
                        <Text className="text-[12px] mt-2 text-center" style={{ color: theme.colors.gray[500] }}>
                            No puedes modificar tu propia cuenta
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
