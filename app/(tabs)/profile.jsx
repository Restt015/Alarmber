import { useState } from "react";
import { ScrollView, View, TouchableOpacity } from "react-native";
import { Avatar, Card, List, Text, useTheme } from "react-native-paper";
import { BlurView } from "expo-blur";

const SectionTitle = ({ title }) => (
  <View className="px-6 mt-8 mb-3">
    <Text className="text-[20px] font-semibold text-onSurface tracking-tight">
      {title}
    </Text>
  </View>
);

export default function ProfileScreen() {
  const theme = useTheme();
  const [reportsCount] = useState(3);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >

      {/* TOP HEADER */}
      <BlurView intensity={35} tint="light" className="px-6 pt-14 pb-10 items-center">
        <Avatar.Icon
          size={110}
          icon="account"
          color={theme.colors.primary}
          style={{
            backgroundColor: theme.colors.primaryContainer,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 6,
          }}
        />

        <Text className="mt-4 text-[22px] font-bold text-gray-900 text-center">
          Usuario
        </Text>

        <Text className="text-[14px] text-gray-600 mt-1 text-center">
          usuario@ejemplo.com
        </Text>

        <TouchableOpacity activeOpacity={0.8} className="mt-4">
          <View className="px-5 py-2 rounded-full bg-primaryContainer">
            <Text className="text-primary font-semibold text-[14px]">
              Editar Perfil
            </Text>
          </View>
        </TouchableOpacity>
      </BlurView>

      {/* STATS CARD */}
      <View className="px-6 mt-6">
        <Card
          mode="elevated"
          className="rounded-2xl bg-surface border border-surfaceVariant shadow-sm"
        >
          <Card.Content className="py-5 items-center">
            <Text
              className="text-[36px] font-extrabold"
              style={{ color: theme.colors.primary }}
            >
              {reportsCount}
            </Text>
            <Text className="mt-1 text-[15px] text-gray-600">
              Reportes enviados
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* TITLE */}
      <SectionTitle title="Configuración" />

      {/* SETTINGS GRID 2×2 */}
      <View className="px-5 flex-row flex-wrap justify-between">

        {/* PRIVACIDAD */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-[48%] bg-surface rounded-2xl mb-4 border border-surfaceVariant p-6 items-center justify-center"
        >
          <List.Icon icon="shield-check" color={theme.colors.primary} />
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 text-center">
            Privacidad
          </Text>
        </TouchableOpacity>

        {/* ELIMINAR DATOS */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-[48%] bg-surface rounded-2xl mb-4 border border-surfaceVariant p-6 items-center justify-center"
        >
          <List.Icon icon="delete" color={theme.colors.error} />
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 text-center">
            Eliminar Datos
          </Text>
        </TouchableOpacity>

        {/* ACERCA DE */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-[48%] bg-surface rounded-2xl mb-4 border border-surfaceVariant p-6 items-center justify-center"
        >
          <List.Icon icon="information" color={theme.colors.primary} />
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 text-center">
            Acerca de
          </Text>
        </TouchableOpacity>

        {/* PERMISOS */}
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-[48%] bg-surface rounded-2xl mb-4 border border-surfaceVariant p-6 items-center justify-center"
        >
          <List.Icon icon="account-cog" color={theme.colors.primary} />
          <Text className="mt-2 text-[15px] font-semibold text-gray-900 text-center">
            Permisos
          </Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <View className="px-5 mt-2">
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-full bg-surface rounded-2xl border border-surfaceVariant px-6 py-6 items-center justify-center"
        >
          <List.Icon icon="logout" color={theme.colors.error} />
          <Text className="text-center text-gray-900 font-semibold text-[16px]">
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
