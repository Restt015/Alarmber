import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import adminService from '../../../services/adminService';

export default function UsersManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('all'); // all, user, admin

    useEffect(() => {
        loadUsers(1, true);
    }, [filterRole, search]);

    const loadUsers = async (pageNum = 1, shouldReset = false) => {
        try {
            if (shouldReset) setLoading(true);

            const queryParams = {
                page: pageNum,
                limit: 15
            };

            if (filterRole !== 'all') {
                queryParams.role = filterRole;
            }

            if (search.trim()) {
                queryParams.search = search.trim();
            }

            const response = await adminService.getAllUsers(queryParams);
            const newUsers = response.data || [];
            const pagination = response.pagination || { totalPages: 1 };

            if (shouldReset) {
                setUsers(newUsers);
            } else {
                setUsers(prev => [...prev, ...newUsers]);
            }

            setHasMore(pageNum < pagination.totalPages);
            setPage(pageNum);

        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        loadUsers(1, true);
    }, [filterRole, search]);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadUsers(page + 1, false);
        }
    }, [loading, hasMore, page]);

    const UserCard = ({ user }) => {
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        return (
            <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,0,0.04)'
                }}
                activeOpacity={0.7}
            >
                <View className="flex-row items-start">
                    {/* Avatar */}
                    <View className="w-14 h-14 bg-purple-100 rounded-full items-center justify-center mr-3">
                        <Text className="text-purple-600 font-bold text-[20px]">
                            {user.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text
                                className="text-gray-900 font-bold flex-1"
                                style={{ fontSize: 17, letterSpacing: -0.3 }}
                            >
                                {user.name}
                            </Text>
                            {user.role === 'admin' && (
                                <View className="bg-purple-100 px-2 py-1 rounded-full">
                                    <Text className="text-purple-700 text-[10px] font-bold uppercase">
                                        Admin
                                    </Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center mb-1">
                            <Ionicons name="mail-outline" size={14} color="#8E8E93" />
                            <Text className="text-gray-600 text-[14px] ml-1 flex-1" numberOfLines={1}>
                                {user.email}
                            </Text>
                        </View>

                        {user.phone && (
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="call-outline" size={14} color="#8E8E93" />
                                <Text className="text-gray-600 text-[13px] ml-1">
                                    {user.phone}
                                </Text>
                            </View>
                        )}

                        <View className="flex-row items-center">
                            <Ionicons name="calendar-outline" size={12} color="#8E8E93" />
                            <Text className="text-gray-400 text-[11px] ml-1">
                                {formatDate(user.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Status Indicator */}
                    <View className={`w-3 h-3 rounded-full ml-2 ${user.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                </View>
            </TouchableOpacity>
        );
    };

    const stats = {
        total: users.length,
        admins: users.filter(u => u.role === 'admin').length,
        users: users.filter(u => u.role === 'user').length,
        active: users.filter(u => u.isActive).length
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* iOS-Style Native Header */}
            <View
                className="bg-white border-b border-gray-100"
                style={{
                    paddingTop: Platform.OS === 'ios' ? 50 : 12,
                    paddingBottom: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 2
                }}
            >
                {/* Top Bar with Back Button */}
                <View className="px-4 flex-row items-center mb-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-9 h-9 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: 'rgba(0,0,0,0.04)' }}
                        activeOpacity={0.6}
                    >
                        <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    </TouchableOpacity>

                    <View className="flex-1">
                        <Text className="text-gray-500 text-[11px] font-medium uppercase tracking-wide">
                            Control de Acceso
                        </Text>
                        <Text
                            className="text-gray-900 font-semibold"
                            style={{ fontSize: 28, letterSpacing: -0.5, fontWeight: '700' }}
                        >
                            Usuarios
                        </Text>
                    </View>
                </View>

                {/* Search Bar - iOS Style */}
                <View className="px-4 mb-3">
                    <View
                        className="flex-row items-center rounded-xl px-3 py-2"
                        style={{ backgroundColor: 'rgba(142, 142, 147, 0.12)' }}
                    >
                        <Ionicons name="search" size={18} color="#8E8E93" />
                        <TextInput
                            className="flex-1 ml-2 text-[16px]"
                            placeholder="Buscar usuarios..."
                            value={search}
                            onChangeText={setSearch}
                            placeholderTextColor="#8E8E93"
                            style={{ color: '#000' }}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color="#8E8E93" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Tabs - iOS Style */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-4"
                    contentContainerStyle={{ paddingRight: 16 }}
                >
                    {[
                        { label: 'Todos', value: 'all', icon: 'list' },
                        { label: 'Usuarios', value: 'user', icon: 'person' },
                        { label: 'Admins', value: 'admin', icon: 'shield-checkmark' },
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.value}
                            onPress={() => setFilterRole(filter.value)}
                            className="mr-2 px-4 py-2 rounded-full flex-row items-center"
                            style={{
                                backgroundColor: filterRole === filter.value ? '#9C27B0' : 'rgba(142, 142, 147, 0.12)'
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name={filter.icon}
                                size={16}
                                color={filterRole === filter.value ? '#FFF' : '#8E8E93'}
                                style={{ marginRight: 6 }}
                            />
                            <Text
                                className="font-semibold text-[14px]"
                                style={{
                                    color: filterRole === filter.value ? '#FFF' : '#8E8E93'
                                }}
                            >
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Stats Badge */}
            <View className="px-4 py-2 bg-purple-50">
                <View className="flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-purple-600 mr-2" />
                    <Text className="text-purple-700 text-[13px] font-semibold">
                        {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
                    </Text>
                </View>
            </View>

            {loading && page === 1 ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#9C27B0" />
                    <Text className="mt-3 text-gray-500 text-[14px]">Cargando...</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View className="px-4">
                            <UserCard user={item} />
                        </View>
                    )}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.2}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <View className="w-20 h-20 rounded-full bg-purple-50 items-center justify-center mb-4">
                                <Ionicons name="people" size={40} color="#9C27B0" />
                            </View>
                            <Text className="text-gray-400 text-[16px] font-medium">
                                No se encontraron usuarios
                            </Text>
                        </View>
                    }
                    ListFooterComponent={
                        loading && page > 1 ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" color="#9C27B0" />
                            </View>
                        ) : null
                    }
                    contentContainerStyle={{ paddingTop: 12, paddingBottom: 20 }}
                />
            )}
        </View>
    );
}
