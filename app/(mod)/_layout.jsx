import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, Platform, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function ModLayout() {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Loading
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text className="text-gray-500 mt-4">Cargando...</Text>
      </View>
    );
  }

  // Guard
  if (!user || !['moderator', 'admin'].includes(role)) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } finally {
            router.replace('/auth/login');
          }
        }
      }
    ]);
  };

  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: 'white',
      borderTopColor: '#E5E7EB',
      borderTopWidth: 1,
      paddingBottom: Math.max(insets.bottom, 8),
      paddingTop: 8,
      height: 60 + Math.max(insets.bottom, 8),
      ...(Platform.OS === 'web'
        ? {
            // Web: make it feel less "mobile tall"
            height: 64,
            paddingBottom: 10,
            paddingTop: 10
          }
        : {})
    }),
    [insets.bottom]
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#D32F2F',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarStyle
      }}
    >
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              size={size}
              color={color}
            />
          )
        }}
      />

      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={size}
              color={color}
            />
          )
        }}
      />

      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={size}
              color={color}
            />
          )
        }}
      />

      {/* Hidden route (navegación interna) */}
      <Tabs.Screen
        name="chat/[reportId]"
        options={{
          href: null
        }}
      />

      {/* Logout action tab */}
      <Tabs.Screen
        name="logout"
        options={{
          title: 'Salir',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleLogout();
          }
        }}
      />
    </Tabs>
  );
}
