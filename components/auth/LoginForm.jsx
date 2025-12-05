import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            router.replace('/(tabs)');
        }, 1500);
    };

    return (
        <View className="w-full">
            <TextInput
                mode="outlined"
                label="Correo Electrónico"
                value={email}
                onChangeText={setEmail}
                className="mb-4 bg-white"
                outlineColor="#E0E0E0"
                activeOutlineColor="#D32F2F"
                left={<TextInput.Icon icon="email-outline" color="#9E9E9E" />}
            />

            <TextInput
                mode="outlined"
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
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
            />

            <View className="items-end mb-6">
                <Text className="text-gray-500 font-medium text-[13px]">
                    ¿Olvidaste tu contraseña?
                </Text>
            </View>

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                buttonColor="#D32F2F"
                className="rounded-full py-1.5 shadow-none"
                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}
            >
                Iniciar Sesión
            </Button>
        </View>
    );
}
