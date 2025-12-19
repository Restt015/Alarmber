import { Ionicons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useNotifications } from "../../context/NotificationContext";

// Tab icon with optional badge
function TabIconWithBadge({ name, color, badgeCount }) {
  return (
    <View style={{ width: 28, height: 28 }}>
      <Ionicons name={name} size={22} color={color} />
      {badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount > 99 ? '99+' : badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { unreadCount = 0 } = useNotifications() || {};

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
            <TabIconWithBadge
              name="home-outline"
              color={color}
            />
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
          title: "Contactos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="call-outline" size={22} color={color} />
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

      {/* Hidden screens */}
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hidden (moved to header dropdown)
        }}
      />

      <Tabs.Screen
        name="my-reports"
        options={{
          href: null,
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
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff'
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700'
  }
});

