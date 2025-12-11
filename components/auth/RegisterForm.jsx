import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import PasswordRequirements from './PasswordRequirements';

export default function RegisterForm() {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateInputs = () => {
        if (!name.trim()) {
            setError('Por favor ingresa tu nombre completo');
            return false;
        }

        if (name.trim().length < 3) {
            setError('El nombre debe tener al menos 3 caracteres');
            return false;
        }

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
            setError('Por favor ingresa una contraseña');
            return false;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        setError('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);

        try {
            const response = await register(name, email, password);

            // Registro exitoso
            Alert.alert(
                '¡Registro Exitoso!',
                `Bienvenido ${response.user.name}`,
                [{
                    text: 'Continuar',
                    onPress: () => {
                        // Redirect admin to dashboard, regular users to home
                        if (response.user.role === 'admin') {
                            router.replace('/admin');
                        } else {
                            router.replace('/(tabs)');
                        }
                    }
                }]
            );
        } catch (err) {
            setError(err.message || 'Error al registrarse');
            Alert.alert(
                'Error',
                err.message || 'No se pudo crear la cuenta. Por favor intenta de nuevo.',
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
                label="Nombre Completo"
                value={name}
                onChangeText={(text) => {
                    setName(text);
                    setError('');
                }}
                autoCapitalize="words"
                className="mb-4 bg-white"
                outlineColor="#E0E0E0"
                activeOutlineColor="#D32F2F"
                left={<TextInput.Icon icon="account-outline" color="#9E9E9E" />}
                error={!!error && !name.trim()}
            />

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
                className="mb-4 bg-white"
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
                <Text className="text-red-600 text-[13px] mb-3">
                    {error}
                </Text>
            ) : null}

            <PasswordRequirements password={password} />

            <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                buttonColor="#D32F2F"
                className="rounded-full py-1.5 shadow-none mt-6"
                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}
            >
                Registrarse
            </Button>
        </View>
    );
}
