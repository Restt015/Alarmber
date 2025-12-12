import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { Avatar, Menu } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ title = "Dashboard Admin", showBack = false, onBack }) {
    const { user, logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleLogout = async () => {
        setMenuVisible(false);
        try {
            await logout();
            router.replace('/auth/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <View className="bg-white border-b border-gray-100 shadow-sm" style={{
            paddingTop: Platform.OS === 'ios' ? 50 : 12,
            paddingBottom: 12,
            paddingHorizontal: 20
        }}>
            <View className="flex-row items-center justify-between">
                {/* Left: Back Button or Logo */}
                <View className="flex-row items-center flex-1">
                    {showBack ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={20} color="#374151" />
                        </TouchableOpacity>
                    ) : (
                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="shield-checkmark" size={20} color="#9C27B0" />
                        </View>
                    )}

                    {/* Title */}
                    <View className="flex-1">
                        <Text className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider mb-0.5">
                            Administrador
                        </Text>
                        <Text className="text-[18px] font-bold text-gray-900" numberOfLines={1}>
                            {title}
                        </Text>
                    </View>
                </View>

                {/* Right: User Menu */}
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <TouchableOpacity
                            onPress={() => setMenuVisible(true)}
                            activeOpacity={0.7}
                        >
                            <Avatar.Text
                                size={40}
                                label={user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                                style={{ backgroundColor: '#9C27B0' }}
                                color="white"
                                labelStyle={{ fontSize: 16, fontWeight: 'bold' }}
                            />
                        </TouchableOpacity>
                    }
                    contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        marginTop: 8
                    }}
                >
                    {/* User Info */}
                    <View className="px-4 py-3 border-b border-gray-100">
                        <Text className="text-[14px] font-bold text-gray-900">
                            {user?.name || 'Administrador'}
                        </Text>
                        <Text className="text-[12px] text-gray-500 mt-0.5">
                            {user?.email || ''}
                        </Text>
                    </View>

                    {/* Menu Items */}
                    <Menu.Item
                        onPress={() => {
                            setMenuVisible(false);
                            router.push('/admin');
                        }}
                        title="Dashboard"
                        leadingIcon="view-dashboard"
                        titleStyle={{ fontSize: 14 }}
                    />
                    <Menu.Item
                        onPress={() => {
                            setMenuVisible(false);
                            router.push('/admin/reports');
                        }}
                        title="Reportes"
                        leadingIcon="file-document-multiple"
                        titleStyle={{ fontSize: 14 }}
                    />
                    <Menu.Item
                        onPress={() => {
                            setMenuVisible(false);
                            router.push('/admin/users');
                        }}
                        title="Usuarios"
                        leadingIcon="account-group"
                        titleStyle={{ fontSize: 14 }}
                    />

                    {/* Divider */}
                    <View className="border-t border-gray-100 my-1" />

                    {/* Logout */}
                    <Menu.Item
                        onPress={handleLogout}
                        title="Cerrar Sesión"
                        leadingIcon="logout"
                        titleStyle={{ fontSize: 14, color: '#D32F2F' }}
                    />
                </Menu>
            </View>
        </View>
    );
}
