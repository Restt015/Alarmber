import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RegisterForm from '../../components/auth/RegisterForm';
import RegisterHeader from '../../components/auth/RegisterHeader';
import SocialButtons from '../../components/auth/SocialButtons';

export default function RegisterScreen() {
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
                    <RegisterHeader />
                    <RegisterForm />
                    <SocialButtons />

                    <View className="flex-row justify-center mt-8 pb-4">
                        <Text className="text-gray-500">¿Ya tienes cuenta? </Text>
                        <TouchableOpacity onPress={() => router.push('/auth/login')}>
                            <Text className="text-red-700 font-bold">Inicia Sesión</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
