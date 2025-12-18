import { router } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Index() {
    const { user, role, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;

        // If user is authenticated, redirect based on role
        if (user) {
            if (role === "admin") {
                router.replace("/admin");
            } else if (role === "moderator") {
                router.replace("/(mod)/inbox");
            } else {
                router.replace("/(tabs)");
            }
        } else {
            // Not authenticated, redirect to login
            router.replace("/auth/login");
        }
    }, [user, role, isLoading]);

    // Show nothing while redirecting
    return <View className="flex-1 bg-red-600" />;
}
