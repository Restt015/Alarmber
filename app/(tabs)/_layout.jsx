import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0D47A1',
        tabBarInactiveTintColor: '#666666',
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#2E2E2E',
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerTitle: 'Alerta Ciudadana',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alertas',
          tabBarIcon: ({ color, size }) => <Ionicons name="alert-circle" size={size} color={color} />,
          headerTitle: 'Alertas Activas',
        }}
      />
      <Tabs.Screen
        name="resource"
        options={{
          title: 'Recursos',
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />,
          headerTitle: 'Recursos',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
          headerTitle: 'Mi Perfil',
        }}
      />
    </Tabs>
  );
}

