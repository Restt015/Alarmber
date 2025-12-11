import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoginForm from '../../components/auth/LoginForm';
import LoginHeader from '../../components/auth/LoginHeader';
import SocialButtons from '../../components/auth/SocialButtons';

export default function LoginScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}
                    showsVerticalScrollIndicator={false}
                >
                    <LoginHeader />
                    <LoginForm />
                    <SocialButtons />

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-500">¿No tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/register')}>
                            <Text className="text-red-700 font-bold">Regístrate</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
