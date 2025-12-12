// app/(tabs)/_layout.jsx
import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

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

      {/* CENTRAL + BUTTON */}
      <Tabs.Screen
        name="report-create"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/report/create');
          }
        }}
        options={{
          title: "",
          tabBarIcon: () => (
            <View style={styles.centralButton}>
              <Ionicons name="add" size={28} color="white" />
            </View>
          ),
          tabBarLabel: () => null,
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

      {/* Hidden screens - not in tab bar */}
      <Tabs.Screen
        name="my-reports"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centralButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -25,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff'
  }
});
