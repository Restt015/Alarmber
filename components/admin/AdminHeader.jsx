import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ title = "Dashboard Admin" }) {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        Alert.alert(
            'Cerrar Sesión',
            '¿Estás seguro que deseas salir?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Salir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            router.replace('/auth/login');
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo cerrar sesión');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View className="bg-white border-b border-gray-100 pt-12 pb-4 px-5">
            <View className="flex-row items-center justify-between">
                {/* Title */}
                <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="shield-checkmark" size={24} color="#9C27B0" />
                        <Text className="text-[11px] font-semibold text-purple-600 ml-2 uppercase tracking-wider">
                            Administrador
                        </Text>
                    </View>
                    <Text className="text-[22px] font-bold text-gray-900">
                        {title}
                    </Text>
                </View>

                {/* Profile & Logout */}
                <View className="flex-row items-center space-x-3">
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="w-10 h-10 bg-red-50 rounded-full items-center justify-center"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
                    </TouchableOpacity>

                    <Avatar.Text
                        size={40}
                        label={user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        backgroundColor="#9C27B0"
                        color="white"
                        labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    />
                </View>
            </View>
        </View>
    );
}
