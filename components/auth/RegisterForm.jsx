import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import PasswordRequirements from './PasswordRequirements';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleRegister = () => {
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
                label="Nombre Completo"
                value={name}
                onChangeText={setName}
                className="mb-4 bg-white"
                outlineColor="#E0E0E0"
                activeOutlineColor="#D32F2F"
                left={<TextInput.Icon icon="account-outline" color="#9E9E9E" />}
            />

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
            />

            <PasswordRequirements password={password} />

            <Button
                mode="contained"
                onPress={handleRegister}
                loading={loading}
                buttonColor="#D32F2F"
                className="rounded-full py-1.5 shadow-none mt-6"
                labelStyle={{ fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }}
            >
                Registrarse
            </Button>
        </View>
    );
}
