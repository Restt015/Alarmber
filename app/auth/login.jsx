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

export default function LoginScreen() {
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
        if (!validateInputs()) return;

        setLoading(true);
        try {
            const response = await login(email, password);

            // Redirect based on role
            const role = response.user?.role;

            Alert.alert(
                '¡Bienvenido!',
                `Hola ${response.user.name}`,
                [{
                    text: 'Continuar',
                    onPress: () => {
                        if (role === 'moderator' || role === 'admin') {
                            router.replace('/(mod)/inbox');
                        } else {
                            router.replace('/(tabs)');
                        }
                    }
                }]
            );
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión');
            Alert.alert('Error', err.message || 'No se pudo iniciar sesión', [{ text: 'Entendido' }]);
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
                            <Text style={styles.title}>Bienvenido</Text>
                            <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
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
                                placeholderTextColor="rgba(255,255,255,0.5)"
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

                            {error ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{error}</Text>
                                </View>
                            ) : null}

                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                            </TouchableOpacity>

                            <Button
                                mode="contained"
                                onPress={handleLogin}
                                loading={loading}
                                disabled={loading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                                labelStyle={styles.buttonLabel}
                                buttonColor="white"
                            >
                                Iniciar Sesión
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
                            <Text style={styles.footerText}>¿No tienes cuenta? </Text>
                            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                                <Text style={styles.footerLink}>Regístrate</Text>
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
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 60,
        height: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: 16,
        borderRadius: 12,
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
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 13,
        fontWeight: '500',
    },
    button: {
        borderRadius: 30,
        elevation: 4,
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
        marginVertical: 32,
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
        marginTop: 32,
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
