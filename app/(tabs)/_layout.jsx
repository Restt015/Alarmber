// app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          position: "absolute",
          bottom: Platform.OS === "ios" ? 22 : 14,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 32,
          paddingBottom: 6,
          paddingTop: 6,
          backgroundColor: "#fff",
          borderWidth: 0.3,
          borderColor: "#e5e5e5",
          shadowColor: "#000",
          shadowOpacity: 0.07,
          shadowRadius: 12,
          shadowOffset: { height: 4 },
          elevation: 6,
        },

        tabBarActiveTintColor: "#D32F2F",
        tabBarInactiveTintColor: "#8e8e8e",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color }) => (
            <Ionicons name="alert-circle-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="my-reports"
        options={{
          title: "Mis Reportes",
          tabBarIcon: ({ color }) => (
            <Ionicons name="document-text-outline" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="resource"
        options={{
          title: "Recursos",
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
