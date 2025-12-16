import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import PageHeader from '../../components/shared/PageHeader';
import userService from '../../services/userService';

// PasswordInput component OUTSIDE of main component to prevent re-creation on each render
const PasswordInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    onToggleShow,
    error
}) => (
    <View className="px-4 py-4 border-b border-gray-50">
        <Text className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
            {label}
        </Text>
        <View className="flex-row items-center">
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#BDBDBD"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-[16px] text-gray-900 font-medium ml-3"
            />
            <TouchableOpacity onPress={onToggleShow} className="p-2">
                <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                />
            </TouchableOpacity>
        </View>
        {error && (
            <View className="flex-row items-center mt-2">
                <Ionicons name="alert-circle" size={14} color="#D32F2F" />
                <Text className="text-red-600 text-[12px] ml-1">{error}</Text>
            </View>
        )}
    </View>
);

export default function ChangePasswordScreen() {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});

    const toggleShow = useCallback((field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    }, []);

    const clearError = useCallback((field) => {
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};

        if (!currentPassword) {
            newErrors.current = 'Ingresa tu contraseña actual';
        }

        if (!newPassword) {
            newErrors.new = 'Ingresa la nueva contraseña';
        } else if (newPassword.length < 6) {
            newErrors.new = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!confirmPassword) {
            newErrors.confirm = 'Confirma tu nueva contraseña';
        } else if (newPassword !== confirmPassword) {
            newErrors.confirm = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            await userService.changePassword({
                currentPassword,
                newPassword
            });

            Alert.alert(
                '¡Contraseña Actualizada!',
                'Tu contraseña ha sido cambiada exitosamente.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo cambiar la contraseña'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <PageHeader title="Cambiar Contraseña" showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Security Icon */}
                    <View className="items-center py-8 bg-white border-b border-gray-100">
                        <View className="w-20 h-20 bg-purple-100 rounded-full items-center justify-center mb-4">
                            <Ionicons name="shield-checkmark" size={40} color="#9C27B0" />
                        </View>
                        <Text className="text-gray-900 font-bold text-[18px]">
                            Actualiza tu contraseña
                        </Text>
                        <Text className="text-gray-500 text-[14px] text-center mt-1 px-8">
                            Ingresa tu contraseña actual y elige una nueva contraseña segura
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="px-5 mt-6">
                        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            <PasswordInput
                                label="Contraseña actual"
                                value={currentPassword}
                                onChangeText={(t) => {
                                    setCurrentPassword(t);
                                    clearError('current');
                                }}
                                placeholder="Ingresa tu contraseña actual"
                                showPassword={showPasswords.current}
                                onToggleShow={() => toggleShow('current')}
                                error={errors.current}
                            />
                            <PasswordInput
                                label="Nueva contraseña"
                                value={newPassword}
                                onChangeText={(t) => {
                                    setNewPassword(t);
                                    clearError('new');
                                }}
                                placeholder="Mínimo 6 caracteres"
                                showPassword={showPasswords.new}
                                onToggleShow={() => toggleShow('new')}
                                error={errors.new}
                            />
                            <PasswordInput
                                label="Confirmar contraseña"
                                value={confirmPassword}
                                onChangeText={(t) => {
                                    setConfirmPassword(t);
                                    clearError('confirm');
                                }}
                                placeholder="Repite la nueva contraseña"
                                showPassword={showPasswords.confirm}
                                onToggleShow={() => toggleShow('confirm')}
                                error={errors.confirm}
                            />
                        </View>
                    </View>

                    {/* Password Requirements */}
                    <View className="px-5 mt-4">
                        <View className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                            <Text className="text-gray-700 font-semibold text-[13px] mb-2">
                                Requisitos de seguridad:
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Ionicons
                                    name={newPassword.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={newPassword.length >= 6 ? '#4CAF50' : '#9CA3AF'}
                                />
                                <Text className={`text-[13px] ml-2 ${newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                                    Mínimo 6 caracteres
                                </Text>
                            </View>
                            <View className="flex-row items-center mt-1">
                                <Ionicons
                                    name={newPassword === confirmPassword && confirmPassword ? 'checkmark-circle' : 'ellipse-outline'}
                                    size={16}
                                    color={newPassword === confirmPassword && confirmPassword ? '#4CAF50' : '#9CA3AF'}
                                />
                                <Text className={`text-[13px] ml-2 ${newPassword === confirmPassword && confirmPassword ? 'text-green-600' : 'text-gray-500'}`}>
                                    Las contraseñas coinciden
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View className="px-5 mt-8">
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`py-4 rounded-2xl items-center ${loading ? 'bg-gray-300' : 'bg-purple-600'}`}
                        >
                            <Text className="text-white font-bold text-[16px]">
                                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
