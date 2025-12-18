import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await login(email, password);
      const role = response.user?.role;

      if (role === "admin") router.replace("/admin");
      else if (role === "moderator") router.replace("/(mod)/inbox");
      else router.replace("/(tabs)");
    } catch (err) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0F172A]">
      <StatusBar style="light" />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* HERO */}
            <View className="flex-1 items-center justify-center px-6 pt-16">
              <Image
                source={require("../../assets/images/logo3.png")}
                className="w-40 h-40 mb-6"
                resizeMode="contain"
              />

              <Text className="text-white text-3xl font-extrabold mb-2 text-center">
                Bienvenido a ALARMBER
              </Text>
              <Text className="text-gray-300 text-center text-base px-6">
                Reporta, monitorea y mantente alerta desde cualquier lugar
              </Text>
            </View>

            {/* CARD */}
            <View
              className="bg-white px-6 pt-8 pb-10"
              style={{
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: -6 },
                elevation: 20,
              }}
            >
              {error ? (
                <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center">
                  <Ionicons name="alert-circle" size={18} color="#DC2626" />
                  <Text className="text-red-700 text-sm ml-2 flex-1">
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* EMAIL */}
              <View className="mb-4">
                <View
                  className="flex-row items-center rounded-2xl px-4 border border-gray-200"
                  style={{ height: 56, backgroundColor: "#F9FAFB" }}
                >
                  <Ionicons name="mail-outline" size={22} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 px-3 text-gray-900 text-base"
                    placeholder="Correo electrónico"
                    placeholderTextColor="#9CA3AF"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View className="mb-6">
                <View
                  className="flex-row items-center rounded-2xl px-4 border border-gray-200"
                  style={{ height: 56, backgroundColor: "#F9FAFB" }}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={22}
                    color="#9CA3AF"
                  />
                  <TextInput
                    className="flex-1 px-3 text-gray-900 text-base"
                    placeholder="Contraseña"
                    placeholderTextColor="#9CA3AF"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={secureTextEntry}
                  />
                  <TouchableOpacity
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  >
                    <Ionicons
                      name={
                        secureTextEntry
                          ? "eye-off-outline"
                          : "eye-outline"
                      }
                      size={22}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* BUTTON */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="rounded-2xl items-center justify-center mb-4"
                style={{
                  height: 56,
                  backgroundColor: "#D32F2F",
                  shadowColor: "#D32F2F",
                  shadowOpacity: 0.45,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 10,
                }}
                activeOpacity={0.9}
              >
                <Text className="text-white font-extrabold text-base">
                  {loading ? "Ingresando..." : "Iniciar sesión"}
                </Text>
              </TouchableOpacity>

              {/* REGISTER */}
              <TouchableOpacity
                onPress={() => router.push("/auth/register")}
                className="rounded-2xl items-center justify-center border border-gray-300"
                style={{ height: 56 }}
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Crear cuenta
                </Text>
              </TouchableOpacity>

              <Text className="text-gray-400 text-xs text-center mt-6 px-6">
                Al continuar aceptas nuestros Términos y Política de Privacidad
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
