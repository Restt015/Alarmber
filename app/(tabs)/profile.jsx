import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Text } from "react-native-paper";

import PageHeader from '../../components/shared/PageHeader';
import SectionTitle from '../../components/shared/SectionTitle';
import { useAuth } from '../../context/AuthContext';

const ProfileOption = ({ icon, label, color, onPress, isDestructive = false }) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="w-[48%] bg-white rounded-2xl mb-4 border border-gray-100 p-5 items-center justify-center shadow-sm"
  >
    <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${isDestructive ? 'bg-red-50' : 'bg-gray-50'}`}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text className={`text-[14px] font-semibold text-center ${isDestructive ? 'text-red-600' : 'text-gray-900'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, loading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.replace("/auth/login");
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
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
    <View className="flex-1 bg-white">
      <PageHeader
        title="Mi Perfil"
        rightIcon="settings-outline"
        onRightPress={() => { }}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* PROFILE HEADER */}
        <View className="items-center pt-6 pb-8 px-6">
          <View className="relative">
            <Avatar.Text
              size={100}
              label={user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              backgroundColor="#D32F2F"
              color="white"
              labelStyle={{ fontSize: 40, fontWeight: 'bold' }}
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-red-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-[24px] font-bold text-gray-900 text-center tracking-tight">
            {user.name || 'Usuario'}
          </Text>
          <Text className="text-[15px] text-gray-500 mt-1 text-center">
            {user.email || 'email@example.com'}
          </Text>
          {user.phone && (
            <Text className="text-[14px] text-gray-400 mt-1 text-center">
              {user.phone}
            </Text>
          )}

          <TouchableOpacity className="mt-5 px-6 py-2 bg-gray-100 rounded-full">
            <Text className="text-gray-900 font-semibold text-[14px]">
              Editar Información
            </Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View className="px-5 mb-8">
          <View className="bg-red-50 rounded-2xl p-5 border border-red-100 flex-row items-center justify-between">
            <View>
              <Text className="text-[32px] font-black text-red-600 leading-9">
                0
              </Text>
              <Text className="text-[14px] font-medium text-gray-800 mt-1">
                Reportes Realizados
              </Text>
            </View>
            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center">
              <Ionicons name="document-text" size={24} color="#D32F2F" />
            </View>
          </View>
        </View>

        {/* USER INFO */}
        <SectionTitle title="Información" />
        <View className="px-5 mb-6">
          <View className="bg-white rounded-2xl border border-gray-100 p-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person-outline" size={20} color="#666" />
              <Text className="ml-3 text-gray-600 text-[13px]">Nombre</Text>
              <Text className="ml-auto text-gray-900 font-semibold text-[14px]">{user.name}</Text>
            </View>
            <View className="border-t border-gray-100 my-2" />
            <View className="flex-row items-center mb-3">
              <Ionicons name="mail-outline" size={20} color="#666" />
              <Text className="ml-3 text-gray-600 text-[13px]">Email</Text>
              <Text className="ml-auto text-gray-900 font-semibold text-[14px]">{user.email}</Text>
            </View>
            <View className="border-t border-gray-100 my-2" />
            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
              <Text className="ml-3 text-gray-600 text-[13px]">Rol</Text>
              <Text className="ml-auto text-gray-900 font-semibold text-[14px] capitalize">{user.role}</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS */}
        <SectionTitle title="Configuración" />

        <View className="px-5 flex-row flex-wrap justify-between">
          <ProfileOption
            icon="shield-checkmark-outline"
            label="Privacidad"
            color="#1976D2"
          />
          <ProfileOption
            icon="notifications-outline"
            label="Notificaciones"
            color="#FBC02D"
          />
          <ProfileOption
            icon="help-circle-outline"
            label="Ayuda"
            color="#4CAF50"
          />
          <ProfileOption
            icon="trash-outline"
            label="Eliminar Datos"
            color="#D32F2F"
            isDestructive={true}
          />
        </View>

        {/* LOGOUT */}
        <View className="px-5 mt-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            className="w-full bg-gray-50 rounded-2xl border border-gray-200 py-4 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={22} color="#D32F2F" style={{ marginRight: 8 }} />
            <Text className="text-red-600 font-bold text-[16px]">
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
