import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, Surface, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
    const theme = useTheme();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#D32F2F', '#B71C1C', '#121212']}
                style={styles.background}
            />

            <SafeAreaView style={styles.content}>
                {/* Header / Logo Section */}
                <View style={styles.header}>
                    <Surface style={styles.logoContainer} elevation={4}>
                        <Text style={styles.logoIcon}>🚨</Text>
                    </Surface>
                    <Text style={styles.title}>ALARMBER</Text>
                    <Text style={styles.subtitle}>Reportes y Alertas Ciudadanas</Text>
                </View>

                {/* Info / Description */}
                <View style={styles.infoContainer}>
                    <Text style={styles.description}>
                        Mantente informado y ayuda a tu comunidad reportando incidentes en tiempo real.
                    </Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        style={styles.button}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.buttonLabel}
                        onPress={() => router.push('/auth/login')}
                        icon="login"
                    >
                        Iniciar Sesión
                    </Button>

                    <Button
                        mode="outlined"
                        style={[styles.button, styles.outlineButton]}
                        contentStyle={styles.buttonContent}
                        labelStyle={styles.outlineLabel}
                        onPress={() => router.push('/auth/register')}
                        icon="account-plus"
                    >
                        Registrarse
                    </Button>
                </View>

                <Text style={styles.footerText}>
                    Juntos hacemos una ciudad más segura
                </Text>
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
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    logoIcon: {
        fontSize: 50,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: 'white',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 8,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    infoContainer: {
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 18,
        color: 'white',
        textAlign: 'center',
        lineHeight: 28,
        fontWeight: '400',
    },
    actions: {
        width: '100%',
        gap: 16,
        marginBottom: 20,
    },
    button: {
        borderRadius: 30,
        elevation: 4,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderColor: 'white',
        borderWidth: 2,
    },
    buttonContent: {
        height: 56,
    },
    buttonLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    outlineLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    footerText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
        marginTop: 20,
    }
});
