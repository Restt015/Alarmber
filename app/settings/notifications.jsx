import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PageHeader from '../../components/shared/PageHeader';

export default function NotificationSettingsScreen() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        newAlerts: true,
        myReportsUpdates: true,
        importantCommunications: true,
        emailNotifications: false,
        soundEnabled: true,
        vibrationEnabled: true,
    });

    const handleToggle = (key) => {
        setSettings({ ...settings, [key]: !settings[key] });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Here you would save to AsyncStorage or API
            // await userService.updateNotificationSettings(settings);

            Alert.alert(
                '¡Preferencias Guardadas!',
                'Tus preferencias de notificación han sido actualizadas.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error) {
            Alert.alert('Error', 'No se pudieron guardar las preferencias');
        } finally {
            setLoading(false);
        }
    };

    const SettingItem = ({ icon, iconColor, iconBg, title, description, settingKey }) => (
        <View className="flex-row items-center px-4 py-4 border-b border-gray-50">
            <View className={`w-10 h-10 ${iconBg} rounded-full items-center justify-center mr-3`}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-semibold text-[15px]">{title}</Text>
                <Text className="text-gray-500 text-[12px] mt-0.5">{description}</Text>
            </View>
            <Switch
                value={settings[settingKey]}
                onValueChange={() => handleToggle(settingKey)}
                trackColor={{ false: '#E5E7EB', true: '#BBDEFB' }}
                thumbColor={settings[settingKey] ? '#1976D2' : '#9CA3AF'}
                ios_backgroundColor="#E5E7EB"
            />
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <PageHeader title="Notificaciones" showBack={true} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Notifications Icon */}
                <View className="items-center py-8 bg-white border-b border-gray-100">
                    <View className="w-20 h-20 bg-orange-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="notifications" size={40} color="#FF9800" />
                    </View>
                    <Text className="text-gray-900 font-bold text-[18px]">
                        Preferencias de Notificación
                    </Text>
                    <Text className="text-gray-500 text-[14px] text-center mt-1 px-8">
                        Configura qué notificaciones deseas recibir
                    </Text>
                </View>

                {/* Main Notifications */}
                <View className="px-5 mt-6">
                    <Text className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">
                        Alertas y Reportes
                    </Text>
                    <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        <SettingItem
                            icon="alert-circle"
                            iconColor="#D32F2F"
                            iconBg="bg-red-50"
                            title="Nuevas alertas"
                            description="Recibe notificaciones cuando se publiquen nuevas alertas"
                            settingKey="newAlerts"
                        />
                        <SettingItem
                            icon="document-text"
                            iconColor="#1976D2"
                            iconBg="bg-blue-50"
                            title="Mis reportes"
                            description="Actualizaciones sobre el estado de tus reportes"
                            settingKey="myReportsUpdates"
                        />
                        <View className="border-b-0">
                            <SettingItem
                                icon="megaphone"
                                iconColor="#9C27B0"
                                iconBg="bg-purple-50"
                                title="Comunicaciones importantes"
                                description="Avisos del sistema y actualizaciones de la app"
                                settingKey="importantCommunications"
                            />
                        </View>
                    </View>
                </View>

                {/* Delivery Settings */}
                <View className="px-5 mt-6">
                    <Text className="text-[13px] font-bold text-gray-500 uppercase tracking-wide mb-3 ml-1">
                        Preferencias de Entrega
                    </Text>
                    <View className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                        <SettingItem
                            icon="mail"
                            iconColor="#00BCD4"
                            iconBg="bg-cyan-50"
                            title="Notificaciones por email"
                            description="Recibe un resumen diario por correo electrónico"
                            settingKey="emailNotifications"
                        />
                        <SettingItem
                            icon="volume-high"
                            iconColor="#FF9800"
                            iconBg="bg-orange-50"
                            title="Sonido"
                            description="Reproducir sonido con las notificaciones"
                            settingKey="soundEnabled"
                        />
                        <View className="border-b-0">
                            <SettingItem
                                icon="phone-portrait"
                                iconColor="#4CAF50"
                                iconBg="bg-green-50"
                                title="Vibración"
                                description="Vibrar al recibir notificaciones"
                                settingKey="vibrationEnabled"
                            />
                        </View>
                    </View>
                </View>

                {/* Info Note */}
                <View className="px-5 mt-4">
                    <View className="flex-row items-start bg-orange-50 rounded-xl p-4 border border-orange-100">
                        <Ionicons name="information-circle" size={20} color="#FF9800" />
                        <Text className="flex-1 text-orange-700 text-[13px] ml-2 leading-5">
                            Las notificaciones de alertas urgentes siempre estarán activas para garantizar la seguridad de la comunidad.
                        </Text>
                    </View>
                </View>

                {/* Save Button */}
                <View className="px-5 mt-8">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.8}
                        className={`py-4 rounded-2xl items-center ${loading ? 'bg-gray-300' : 'bg-orange-500'}`}
                    >
                        <Text className="text-white font-bold text-[16px]">
                            {loading ? 'Guardando...' : 'Guardar Preferencias'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
