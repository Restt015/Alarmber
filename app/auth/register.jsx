import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen() {
    const { register } = useAuth();
    const { height } = useWindowDimensions();

    // Dynamic sizing by screen height
    const layout = useMemo(() => {
        const heroMin = height >= 900 ? 0.35 : height >= 780 ? 0.32 : 0.28;
        const cardMin = 1 - heroMin;
        const cardMinHeight = Math.max(460, Math.floor(height * cardMin));
        const heroPaddingTop = height >= 850 ? 24 : 16;
        return { cardMinHeight, heroPaddingTop };
    }, [height]);

    // Open animation for the card
    const openAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(openAnim, {
            toValue: 1,
            duration: 520,
            useNativeDriver: true,
        }).start();
    }, [openAnim]);

    const cardTranslateY = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [28, 0],
    });
    const cardOpacity = openAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    const handleRegister = async () => {
        setError("");

        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
            setError("Completa todos los campos");
            return;
        }
        if (name.trim().length < 3) {
            setError("El nombre debe tener al menos 3 caracteres");
            return;
        }
        if (!validateEmail(email)) {
            setError("Ingresa un correo válido");
            return;
        }
        if (password.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);
        try {
            const response = await register(name, email, password);
            Alert.alert("¡Registro Exitoso!", `Bienvenido ${response.user.name}`, [
                {
                    text: "Continuar",
                    onPress: () => {
                        if (response.user.role === "admin") {
                            router.replace("/admin");
                        } else {
                            router.replace("/(tabs)");
                        }
                    },
                },
            ]);
        } catch (err) {
            const msg = err?.message || "Error al registrarse";
            setError(msg);
            Alert.alert("Error", msg, [{ text: "Entendido" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#0B1220]">
            <StatusBar style="light" />

            {/* Background */}
            <View className="absolute inset-0">
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#0B1220",
                    }}
                />
                {/* Soft red glows */}
                <View
                    style={{
                        position: "absolute",
                        top: -140,
                        left: -120,
                        width: 320,
                        height: 320,
                        borderRadius: 999,
                        backgroundColor: "rgba(211,47,47,0.35)",
                    }}
                />
                <View
                    style={{
                        position: "absolute",
                        bottom: -160,
                        right: -140,
                        width: 360,
                        height: 360,
                        borderRadius: 999,
                        backgroundColor: "rgba(211,47,47,0.18)",
                    }}
                />
            </View>

            <SafeAreaView className="flex-1" edges={["top"]}>
                {/* Back Button */}
                <Pressable
                    onPress={() => router.back()}
                    className="absolute top-4 left-5 z-10"
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: "rgba(255,255,255,0.15)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.2)",
                    }}
                >
                    <Ionicons name="chevron-back" size={26} color="white" />
                </Pressable>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "space-between",
                        }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        {/* HERO */}
                        <View className="px-6" style={{ paddingTop: layout.heroPaddingTop }}>
                            <View className="items-center">
                                <Image
                                    source={require("../../assets/images/logo3.png")}
                                    style={{ width: 140, height: 140 }}
                                    resizeMode="contain"
                                />
                                <Text className="text-white text-3xl font-extrabold mt-3">
                                    ALARMBER
                                </Text>
                                <Text className="text-gray-300 text-center mt-2 text-base px-2">
                                    Únete a la red de seguridad ciudadana
                                </Text>
                            </View>
                        </View>

                        {/* CARD (Blur / Glass) */}
                        <Animated.View
                            style={{
                                opacity: cardOpacity,
                                transform: [{ translateY: cardTranslateY }],
                                minHeight: layout.cardMinHeight,
                            }}
                            className="px-5 pb-6"
                        >
                            <BlurView
                                intensity={26}
                                tint="light"
                                style={{
                                    borderTopLeftRadius: 34,
                                    borderTopRightRadius: 34,
                                    borderBottomLeftRadius: 26,
                                    borderBottomRightRadius: 26,
                                    overflow: "hidden",
                                }}
                            >
                                <View
                                    style={{
                                        backgroundColor: "rgba(255,255,255,0.72)",
                                        paddingHorizontal: 18,
                                        paddingTop: 24,
                                        paddingBottom: 18,
                                    }}
                                >
                                    {/* Title */}
                                    <Text className="text-gray-900 text-2xl font-extrabold mb-1 text-center">
                                        Crear cuenta
                                    </Text>
                                    <Text className="text-gray-600 text-center text-sm mb-6">
                                        Completa tus datos para registrarte
                                    </Text>

                                    {/* Error Message */}
                                    {error ? (
                                        <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center">
                                            <Ionicons name="alert-circle" size={18} color="#DC2626" />
                                            <Text className="text-red-700 text-sm ml-2 flex-1">
                                                {error}
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Name */}
                                    <Text className="text-gray-800 font-semibold mb-2 text-sm">
                                        Nombre completo
                                    </Text>
                                    <View
                                        className="flex-row items-center rounded-2xl px-4 border border-gray-200 mb-4"
                                        style={{ height: 56, backgroundColor: "rgba(249,250,251,0.9)" }}
                                    >
                                        <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 px-3 text-gray-900 text-base"
                                            placeholder="Tu nombre"
                                            placeholderTextColor="#9CA3AF"
                                            value={name}
                                            onChangeText={(t) => {
                                                setName(t);
                                                setError("");
                                            }}
                                            autoCapitalize="words"
                                            autoCorrect={false}
                                        />
                                    </View>

                                    {/* Email */}
                                    <Text className="text-gray-800 font-semibold mb-2 text-sm">
                                        Correo electrónico
                                    </Text>
                                    <View
                                        className="flex-row items-center rounded-2xl px-4 border border-gray-200 mb-4"
                                        style={{ height: 56, backgroundColor: "rgba(249,250,251,0.9)" }}
                                    >
                                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 px-3 text-gray-900 text-base"
                                            placeholder="tu@email.com"
                                            placeholderTextColor="#9CA3AF"
                                            value={email}
                                            onChangeText={(t) => {
                                                setEmail(t);
                                                setError("");
                                            }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>

                                    {/* Password */}
                                    <Text className="text-gray-800 font-semibold mb-2 text-sm">
                                        Contraseña
                                    </Text>
                                    <View
                                        className="flex-row items-center rounded-2xl px-4 border border-gray-200 mb-4"
                                        style={{ height: 56, backgroundColor: "rgba(249,250,251,0.9)" }}
                                    >
                                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 px-3 text-gray-900 text-base"
                                            placeholder="Mínimo 6 caracteres"
                                            placeholderTextColor="#9CA3AF"
                                            value={password}
                                            onChangeText={(t) => {
                                                setPassword(t);
                                                setError("");
                                            }}
                                            secureTextEntry={secureTextEntry}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setSecureTextEntry(!secureTextEntry)}
                                            className="p-1"
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color="#9CA3AF"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Confirm Password */}
                                    <Text className="text-gray-800 font-semibold mb-2 text-sm">
                                        Confirmar contraseña
                                    </Text>
                                    <View
                                        className="flex-row items-center rounded-2xl px-4 border border-gray-200"
                                        style={{ height: 56, backgroundColor: "rgba(249,250,251,0.9)" }}
                                    >
                                        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 px-3 text-gray-900 text-base"
                                            placeholder="Repite tu contraseña"
                                            placeholderTextColor="#9CA3AF"
                                            value={confirmPassword}
                                            onChangeText={(t) => {
                                                setConfirmPassword(t);
                                                setError("");
                                            }}
                                            secureTextEntry={secureConfirmEntry}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
                                            className="p-1"
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons
                                                name={secureConfirmEntry ? "eye-off-outline" : "eye-outline"}
                                                size={20}
                                                color="#9CA3AF"
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {/* Match indicator */}
                                    {password && confirmPassword && password === confirmPassword ? (
                                        <View className="flex-row items-center mt-2">
                                            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                                            <Text className="text-green-600 text-xs ml-1.5">
                                                Las contraseñas coinciden
                                            </Text>
                                        </View>
                                    ) : null}

                                    {/* Primary button */}
                                    <TouchableOpacity
                                        onPress={handleRegister}
                                        disabled={loading}
                                        activeOpacity={0.9}
                                        className="rounded-2xl items-center justify-center mt-6"
                                        style={{
                                            height: 56,
                                            backgroundColor: loading ? "#9CA3AF" : "#D32F2F",
                                            shadowColor: "#D32F2F",
                                            shadowOpacity: 0.35,
                                            shadowRadius: 16,
                                            shadowOffset: { width: 0, height: 8 },
                                            elevation: 10,
                                        }}
                                    >
                                        <Text className="text-white font-extrabold text-base">
                                            {loading ? "Creando cuenta..." : "Crear cuenta"}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Link to login */}
                                    <View className="flex-row items-center justify-center mt-6">
                                        <Text className="text-gray-600 text-sm">
                                            ¿Ya tienes cuenta?{" "}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => router.push("/auth/login")}
                                            activeOpacity={0.8}
                                        >
                                            <Text className="text-red-700 font-bold text-sm">
                                                Iniciar sesión
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Text className="text-gray-500 text-xs text-center mt-6 px-4">
                                        Al continuar aceptas nuestros Términos y Política de Privacidad
                                    </Text>

                                    {/* Footer */}
                                    <View className="mt-8">
                                        <View className="h-px bg-gray-200 mb-4" />
                                        <Text className="text-gray-500 text-xs text-center">
                                            © {new Date().getFullYear()} ALARMBER · Comunidad segura
                                        </Text>
                                    </View>
                                </View>
                            </BlurView>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
