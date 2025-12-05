import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";

import PageHeader from '../../components/shared/PageHeader';
import SectionTitle from '../../components/shared/SectionTitle';

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
  const theme = useTheme();
  const [reportsCount] = useState(3);

  const handleLogout = () => {
    router.replace("/auth/login");
  };

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
            <Avatar.Image
              size={100}
              source={{ uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop&q=60" }}
              className="bg-gray-200"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-red-600 w-8 h-8 rounded-full items-center justify-center border-2 border-white">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="mt-4 text-[24px] font-bold text-gray-900 text-center tracking-tight">
            Cesar Restrepo
          </Text>
          <Text className="text-[15px] text-gray-500 mt-1 text-center">
            cesar.restrepo@email.com
          </Text>

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
                {reportsCount}
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
