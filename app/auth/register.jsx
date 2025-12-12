import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { Button, Surface, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
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
        if (!validateInputs()) return;

        setLoading(true);
        try {
            const response = await register(name, email, password);
            Alert.alert(
                '¡Registro Exitoso!',
                `Bienvenido ${response.user.name}`,
                [{
                    text: 'Continuar',
                    onPress: () => {
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
            Alert.alert('Error', err.message || 'No se pudo crear la cuenta', [{ text: 'Entendido' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <LinearGradient
                colors={['#D32F2F', '#B71C1C', '#121212']}
                style={styles.background}
            />

            <SafeAreaView style={styles.safeArea}>
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Surface style={styles.logoContainer} elevation={4}>
                                <Image
                                    source={require('../../assets/images/logo.png')}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </Surface>
                            <Text style={styles.title}>Crear Cuenta</Text>
                            <Text style={styles.subtitle}>Únete a la comunidad</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <TextInput
                                mode="flat"
                                label="Nombre Completo"
                                value={name}
                                onChangeText={(text) => { setName(text); setError(''); }}
                                autoCapitalize="words"
                                style={styles.input}
                                underlineColor="rgba(255,255,255,0.3)"
                                activeUnderlineColor="white"
                                textColor="white"
                                theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.7)' } }}
                                left={<TextInput.Icon icon="account-outline" color="rgba(255,255,255,0.7)" />}
                            />

                            <TextInput
                                mode="flat"
                                label="Correo Electrónico"
                                value={email}
                                onChangeText={(text) => { setEmail(text); setError(''); }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                underlineColor="rgba(255,255,255,0.3)"
                                activeUnderlineColor="white"
                                textColor="white"
                                theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.7)' } }}
                                left={<TextInput.Icon icon="email-outline" color="rgba(255,255,255,0.7)" />}
                            />

                            <TextInput
                                mode="flat"
                                label="Contraseña"
                                value={password}
                                onChangeText={(text) => { setPassword(text); setError(''); }}
                                secureTextEntry={secureTextEntry}
                                style={styles.input}
                                underlineColor="rgba(255,255,255,0.3)"
                                activeUnderlineColor="white"
                                textColor="white"
                                theme={{ colors: { onSurfaceVariant: 'rgba(255,255,255,0.7)' } }}
                                left={<TextInput.Icon icon="lock-outline" color="rgba(255,255,255,0.7)" />}
                                right={
                                    <TextInput.Icon
                                        icon={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                                        onPress={() => setSecureTextEntry(!secureTextEntry)}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                }
                            />

                            {/* Password Requirements */}
                            <View style={styles.requirements}>
                                <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                                    • Mínimo 6 caracteres
                                </Text>
                            </View>

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <Button
                                mode="contained"
                                onPress={handleRegister}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                buttonColor="white"
                            >
                                Registrarse
                            </Button>
                        </View>

                        {/* Social Divider */}
                        <View style={styles.dividerContainer}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>O continúa con</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Buttons */}
                        <View style={styles.socialContainer}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>G</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}></Text>
                                <Text style={styles.socialText}>Apple</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                                <Text style={styles.footerLink}>Inicia Sesión</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    backIcon: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 80,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 50,
        height: 50,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 6,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 14,
        borderRadius: 12,
    },
    requirements: {
        marginBottom: 16,
    },
    requirementText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 13,
    },
    requirementMet: {
        color: '#81C784',
    },
    errorContainer: {
        backgroundColor: 'rgba(255, 100, 100, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    errorText: {
        color: '#FFB4AB',
        fontSize: 13,
        textAlign: 'center',
    },
    button: {
        borderRadius: 30,
        elevation: 4,
        marginTop: 8,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 28,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    dividerText: {
        marginHorizontal: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 13,
    },
    socialContainer: {
        flexDirection: 'row',
        gap: 16,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginRight: 8,
    },
    socialText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 15,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28,
        marginBottom: 20,
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 15,
    },
    footerLink: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
    },
});
