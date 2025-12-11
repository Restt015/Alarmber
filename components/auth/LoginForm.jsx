import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput, } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateInputs = () => {
        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Por favor ingresa un correo válido');
            return false;
        }

        if (!password.trim()) {
            setError('Por favor ingresa tu contraseña');
            return false;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    };

    const handleLogin = async () => {
        setError('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            const response = await login(email, password);

            // Login exitoso
            Alert.alert(
                '¡Bienvenido!',
                `Hola ${response.user.name}`,
                [{ text: 'Continuar', onPress: () => router.replace('/(tabs)') }]
            );
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
            Alert.alert(
                'Error',
                err.message || 'No se pudo iniciar sesión',
                [{ text: 'Entendido' }]
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="w-full">
            <TextInput
                mode="outlined"
                label="Correo Electrónico"
                value={email}
                onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                className="mb-4 bg-white"
                outlineColor="#E0E0E0"
                activeOutlineColor="#D32F2F"
                left={<TextInput.Icon icon="email-outline" color="#9E9E9E" />}
                error={!!error && !email.trim()}
            />

            <TextInput
                mode="outlined"
                label="Contraseña"
                value={password}
                onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                }}
                secureTextEntry={secureTextEntry}
                className="mb-2 bg-white"
                outlineColor="#E0E0E0"
                activeOutlineColor="#D32F2F"
                left={<TextInput.Icon icon="lock-outline" color="#9E9E9E" />}
                right={
                    <TextInput.Icon
                        icon={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                        color="#9E9E9E"
                    />
                }
                error={!!error && !password.trim()}
            />

            {error ? (
                <Text className="text-red-600 text-[13px] mb-3 mt-1">
                    {error}
                </Text>
            ) : null}

            <View className="items-end mb-6">
                <Text className="text-gray-500 font-medium text-[13px]">
                    ¿Olvidaste tu contraseña?
                </Text>
            </View>

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                buttonColor="#D32F2F"
                className="rounded-full py-1.5 shadow-none"
                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}
            >
                Iniciar Sesión
            </Button>
        </View>
    );
}
