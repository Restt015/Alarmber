import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActionSheetIOS,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Avatar } from 'react-native-paper';
import PageHeader from '../../components/shared/PageHeader';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';

export default function EditProfileScreen() {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState(user?.profileImage || null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Launch camera to take a photo
    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permisos necesarios', 'Necesitas permitir acceso a la cámara.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            setPhoto(result.assets[0].uri);
        }
    };

    // Pick image from gallery
    const pickFromGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permisos necesarios', 'Necesitas permitir acceso a la galería.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.[0]) {
            setPhoto(result.assets[0].uri);
        }
    };

    // Show image source options
    const showImageOptions = () => {
        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancelar', 'Tomar foto', 'Elegir de galería', 'Eliminar foto'],
                    destructiveButtonIndex: 3,
                    cancelButtonIndex: 0,
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) {
                        takePhoto();
                    } else if (buttonIndex === 2) {
                        pickFromGallery();
                    } else if (buttonIndex === 3) {
                        setPhoto(null);
                    }
                }
            );
        } else {
            // Android fallback
            Alert.alert(
                'Cambiar foto de perfil',
                'Elige una opción',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Tomar foto', onPress: takePhoto },
                    { text: 'Elegir de galería', onPress: pickFromGallery },
                    {
                        text: 'Eliminar foto',
                        onPress: () => setPhoto(null),
                        style: 'destructive'
                    },
                ]
            );
        }
    };

    const handleSave = async () => {
        if (!formData.name.trim()) {
            Alert.alert('Error', 'El nombre es requerido');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
            };

            // Include photo if it's a new local file (not already a server URL)
            if (photo && !photo.startsWith('http')) {
                updateData.profileImage = photo;
            } else if (photo === null) {
                // User removed photo
                updateData.profileImage = '';
            }

            const response = await userService.updateProfile(updateData);

            // Update user state in context immediately with the response data
            if (response.data) {
                await updateUser({
                    name: response.data.name,
                    phone: response.data.phone,
                    profileImage: response.data.profileImage,
                });
            } else {
                // Fallback: update with form data if no response data
                await updateUser({
                    name: formData.name.trim(),
                    phone: formData.phone.trim(),
                    profileImage: photo,
                });
            }

            Alert.alert(
                '¡Perfil Actualizado!',
                'Tus cambios han sido guardados correctamente.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo actualizar el perfil'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <PageHeader title="Editar Perfil" showBack={true} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Photo Section */}
                    <View className="items-center py-8 bg-white border-b border-gray-100">
                        <TouchableOpacity onPress={showImageOptions} activeOpacity={0.8}>
                            <View className="relative">
                                {photo ? (
                                    <Avatar.Image
                                        size={120}
                                        source={{ uri: photo }}
                                    />
                                ) : (
                                    <Avatar.Text
                                        size={120}
                                        label={formData.name?.charAt(0).toUpperCase() || 'U'}
                                        style={{ backgroundColor: '#D32F2F' }}
                                        labelStyle={{ fontSize: 48, fontWeight: 'bold' }}
                                    />
                                )}
                                <View className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full items-center justify-center border-4 border-white">
                                    <Ionicons name="camera" size={18} color="white" />
                                </View>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={showImageOptions} activeOpacity={0.7}>
                            <Text className="text-blue-600 font-semibold text-[15px] mt-4">
                                Cambiar foto
                            </Text>
                        </TouchableOpacity>
                        {photo && (
                            <Text className="text-gray-400 text-[12px] mt-1">
                                Toca para cambiar o eliminar
                            </Text>
                        )}
                    </View>

                    {/* Form Section */}
                    <View className="px-5 mt-6">
                        <Text className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-4 ml-1">
                            Información Personal
                        </Text>

                        <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                            {/* Name */}
                            <View className="px-4 py-4 border-b border-gray-50">
                                <Text className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                                    Nombre completo
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                                    <TextInput
                                        value={formData.name}
                                        onChangeText={(t) => setFormData({ ...formData, name: t })}
                                        placeholder="Tu nombre"
                                        placeholderTextColor="#BDBDBD"
                                        className="flex-1 text-[16px] text-gray-900 font-medium ml-3"
                                    />
                                </View>
                            </View>

                            {/* Email (read-only) */}
                            <View className="px-4 py-4 border-b border-gray-50 bg-gray-50">
                                <Text className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                                    Correo electrónico
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                                    <Text className="flex-1 text-[16px] text-gray-500 font-medium ml-3">
                                        {formData.email}
                                    </Text>
                                    <Ionicons name="lock-closed" size={16} color="#BDBDBD" />
                                </View>
                            </View>

                            {/* Phone */}
                            <View className="px-4 py-4">
                                <Text className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">
                                    Teléfono
                                </Text>
                                <View className="flex-row items-center">
                                    <Ionicons name="call-outline" size={20} color="#9CA3AF" />
                                    <TextInput
                                        value={formData.phone}
                                        onChangeText={(t) => setFormData({ ...formData, phone: t })}
                                        placeholder="Tu número de teléfono"
                                        placeholderTextColor="#BDBDBD"
                                        keyboardType="phone-pad"
                                        className="flex-1 text-[16px] text-gray-900 font-medium ml-3"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Save Button */}
                    <View className="px-5 mt-8">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`py-4 rounded-2xl items-center ${loading ? 'bg-gray-300' : 'bg-blue-600'}`}
                        >
                            <Text className="text-white font-bold text-[16px]">
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Info Note */}
                    <View className="px-5 mt-4">
                        <View className="flex-row items-start bg-blue-50 rounded-xl p-4">
                            <Ionicons name="information-circle" size={20} color="#1976D2" />
                            <Text className="flex-1 text-blue-700 text-[13px] ml-2 leading-5">
                                El correo electrónico no puede ser modificado ya que está vinculado a tu cuenta.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
