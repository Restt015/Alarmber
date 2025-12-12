import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text className="mt-4 text-gray-600">Cargando perfil...</Text>
      </View>
    );
  }

  // If not authenticated and not loading, don't render (will redirect)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <Text className="text-[24px] font-bold text-gray-900">
          Mi Perfil
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Profile Header */}
        <View className="items-center pt-8 pb-6 px-6 bg-white">
          <Avatar.Text
            size={100}
            label={user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            style={{ backgroundColor: '#D32F2F' }}
            color="white"
            labelStyle={{ fontSize: 40, fontWeight: 'bold' }}
          />

          <Text className="mt-4 text-[24px] font-bold text-gray-900 text-center">
            {user.name || 'Usuario'}
          </Text>
          <Text className="text-[15px] text-gray-500 mt-1 text-center">
            {user.email || 'email@example.com'}
          </Text>
        </View>

        {/* User Information Card */}
        <View className="px-5 mt-6">
          <Text className="text-[16px] font-bold text-gray-900 mb-3 px-1">
            Información Personal
          </Text>
          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            {/* Name */}
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="person-outline" size={20} color="#666" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-[12px] mb-1">Nombre</Text>
                <Text className="text-gray-900 font-semibold text-[15px]">{user.name}</Text>
              </View>
            </View>

            <View className="border-t border-gray-100" />

            {/* Email */}
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="mail-outline" size={20} color="#666" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-[12px] mb-1">Correo Electrónico</Text>
                <Text className="text-gray-900 font-semibold text-[15px]">{user.email}</Text>
              </View>
            </View>

            {user.phone && (
              <>
                <View className="border-t border-gray-100" />
                <View className="flex-row items-center py-3">
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="call-outline" size={20} color="#666" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-500 text-[12px] mb-1">Teléfono</Text>
                    <Text className="text-gray-900 font-semibold text-[15px]">{user.phone}</Text>
                  </View>
                </View>
              </>
            )}

            <View className="border-t border-gray-100" />

            {/* Role */}
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-[12px] mb-1">Rol</Text>
                <Text className="text-gray-900 font-semibold text-[15px] capitalize">{user.role}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="px-5 mt-6">
          <Text className="text-[16px] font-bold text-gray-900 mb-3 px-1">
            Acciones
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
          >
            <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="create-outline" size={20} color="#1976D2" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-[15px]">Editar Perfil</Text>
              <Text className="text-gray-500 text-[12px] mt-0.5">Actualizar información personal</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
          >
            <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="lock-closed-outline" size={20} color="#9C27B0" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-[15px]">Cambiar Contraseña</Text>
              <Text className="text-gray-500 text-[12px] mt-0.5">Actualizar tu contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 flex-row items-center"
          >
            <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-3">
              <Ionicons name="notifications-outline" size={20} color="#FF9800" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-[15px]">Notificaciones</Text>
              <Text className="text-gray-500 text-[12px] mt-0.5">Configurar preferencias</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View className="px-5 mt-6">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="bg-red-50 rounded-2xl border border-red-100 py-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={22} color="#D32F2F" style={{ marginRight: 8 }} />
            <Text className="text-red-600 font-bold text-[16px]">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
