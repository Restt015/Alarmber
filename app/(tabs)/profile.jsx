import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useEffect } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Avatar, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SkeletonProfile from '../../components/shared/SkeletonProfile';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth/login");
    }
  }, [loading, isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading) return <SkeletonProfile />;
  if (!isAuthenticated || !user) return null;

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Administrador', color: '#D32F2F', bg: '#FFEBEE' },
      moderator: { label: 'Moderador', color: '#1976D2', bg: '#E3F2FD' },
      user: { label: 'Usuario', color: '#757575', bg: '#F5F5F5' }
    };
    return roles[role] || roles.user;
  };

  const roleBadge = getRoleBadge(user.role);

  const menuItems = [
    {
      icon: "create-outline",
      color: "#1976D2",
      bg: "bg-blue-50",
      title: "Editar Perfil",
      desc: "Actualizar información personal",
      route: "/settings/edit-profile",
    },
    {
      icon: "lock-closed-outline",
      color: "#9C27B0",
      bg: "bg-purple-50",
      title: "Cambiar Contraseña",
      desc: "Seguridad de la cuenta",
      route: "/settings/change-password",
    },
    {
      icon: "notifications-outline",
      color: "#FF9800",
      bg: "bg-orange-50",
      title: "Notificaciones",
      desc: "Preferencias del sistema",
      route: "/settings/notifications",
    },
    {
      icon: "help-circle-outline",
      color: "#00BCD4",
      bg: "bg-cyan-50",
      title: "Ayuda y Soporte",
      desc: "Centro de ayuda",
    },
    {
      icon: "log-out-outline",
      color: "#D32F2F",
      bg: "bg-red-50",
      title: "Cerrar Sesión",
      desc: "Salir de la cuenta",
      action: handleLogout,
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header con Avatar Centrado - iOS Style */}
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        {/* Top Bar Simple */}
        <View className="flex-row justify-center items-center px-5 py-3">
          <Text className="text-[15px] text-gray-500 font-semibold">Mi Perfil</Text>
        </View>

        {/* Avatar Centrado */}
        <View className="items-center pb-6">
          <View className="relative">
            {user.profileImage ? (
              <Avatar.Image
                size={100}
                source={{ uri: user.profileImage }}
                style={{
                  elevation: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                }}
              />
            ) : (
              <Avatar.Text
                size={100}
                label={user.name?.charAt(0).toUpperCase() || 'U'}
                style={{
                  backgroundColor: '#D32F2F',
                  elevation: 8,
                  shadowColor: '#D32F2F',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
                color="white"
                labelStyle={{ fontSize: 42, fontWeight: '700' }}
              />
            )}
            {/* Edit Avatar Button */}
            <TouchableOpacity
              className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full items-center justify-center border-2 border-gray-100"
              activeOpacity={0.7}
              onPress={() => router.push('/settings/edit-profile')}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="camera" size={16} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Nombre */}
          <Text className="text-[24px] font-bold text-gray-900 mt-4 text-center">
            {user.name || 'Usuario'}
          </Text>

          {/* Rol Badge */}
          <View
            className="mt-2 px-3 py-1 rounded-full"
            style={{ backgroundColor: roleBadge.bg }}
          >
            <Text
              className="text-[12px] font-semibold"
              style={{ color: roleBadge.color }}
            >
              {roleBadge.label}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Tarjeta de Información Personal */}
        <View className="px-5 mt-6">
          <Text className="text-[15px] font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">
            Información de Cuenta
          </Text>

          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {/* Email */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-50">
              <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="mail-outline" size={20} color="#1976D2" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Correo Electrónico
                </Text>
                <Text className="text-gray-900 font-semibold text-[15px] mt-0.5">
                  {user.email}
                </Text>
              </View>
            </View>

            {/* Teléfono */}
            {user.phone && (
              <View className="flex-row items-center px-4 py-4 border-b border-gray-50">
                <View className="w-10 h-10 bg-green-50 rounded-full items-center justify-center">
                  <Ionicons name="call-outline" size={20} color="#4CAF50" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                    Teléfono
                  </Text>
                  <Text className="text-gray-900 font-semibold text-[15px] mt-0.5">
                    {user.phone}
                  </Text>
                </View>
              </View>
            )}

            {/* Miembro desde */}
            <View className="flex-row items-center px-4 py-4">
              <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center">
                <Ionicons name="calendar-outline" size={20} color="#9C27B0" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-[11px] text-gray-400 font-medium uppercase tracking-wide">
                  Miembro Desde
                </Text>
                <Text className="text-gray-900 font-semibold text-[15px] mt-0.5">
                  {new Date(user.createdAt || Date.now()).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Menú de Opciones */}
        <View className="px-5 mt-6">
          <Text className="text-[15px] font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">
            Configuración
          </Text>

          <View
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.route) {
                    router.push(item.route);
                  } else if (item.action) {
                    item.action();
                  }
                }}
                className={`flex-row items-center px-4 py-4 ${index < menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <View className={`w-10 h-10 ${item.bg} rounded-full items-center justify-center`}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className={`font-semibold text-[15px] ${item.action === handleLogout ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.title}
                  </Text>
                  <Text className="text-gray-400 text-[12px] mt-0.5">
                    {item.desc}
                  </Text>
                </View>
                {item.action !== handleLogout && (
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* App Version */}
        <View className="items-center mt-6">
          <Text className="text-gray-300 text-[12px]">
            ALARMBER v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
