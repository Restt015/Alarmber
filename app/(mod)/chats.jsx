import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import modChatsService from '../../services/modChatsService';
import modInboxService from '../../services/modInboxService';

export default function ModChatsScreen() {
    const router = useRouter();
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChats();

        // Subscribe to realtime updates
        const unsubscribe = modInboxService.subscribe((event) => {
            if (event.type === 'mod:notification:new' || event.type === 'message') {
                loadChats(); // Refresh list when new messages arrive
            }
        });

        return unsubscribe;
    }, []);

    const loadChats = async () => {
        try {
            setLoading(true);
            const response = await modChatsService.getActiveChats();
            setChats(response.data || []);
        } catch (error) {
            console.error('Failed to load chats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadChats();
        setRefreshing(false);
    };

    const handleChatPress = async (chat) => {
        try {
            // Mark as read
            await modChatsService.markChatRead(chat.reportId);

            // Navigate to report detail with chat tab active
            router.push(`/alert/${chat.reportId}`);

            // Refresh list to update unread count
            setTimeout(() => loadChats(), 500);
        } catch (error) {
            console.error('Failed to mark chat as read:', error);
            // Navigate anyway
            router.push(`/alert/${chat.reportId}`);
        }
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Ahora';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `Hace ${minutes}m`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Hace ${hours}h`;
        const days = Math.floor(hours / 24);
        return `Hace ${days}d`;
    };

    const renderChatCard = ({ item }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-lg mb-3 shadow-sm"
            onPress={() => handleChatPress(item)}
        >
            <View className="flex-row justify-between items-center mb-2">
                <Text className="font-bold text-gray-900 flex-1 text-base">
                    {item.reportTitle}
                </Text>
                {item.unreadCount > 0 && (
                    <View className="bg-red-600 w-6 h-6 rounded-full items-center justify-center ml-2">
                        <Text className="text-white text-xs font-bold">
                            {item.unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {item.lastMessagePreview}
            </Text>

            <View className="flex-row items-center justify-between">
                <Text className="text-gray-400 text-xs">
                    {formatTimeAgo(item.lastMessageAt)}
                </Text>
                <View className="flex-row gap-2">
                    {item.urgent && (
                        <View className="bg-orange-100 px-2 py-1 rounded">
                            <Text className="text-orange-700 text-xs font-bold">URGENTE</Text>
                        </View>
                    )}
                    {item.hasReports && (
                        <View className="flex-row items-center">
                            <Ionicons name="flag" size={16} color="#EF4444" />
                        </View>
                    )}
                    {item.chatStatus === 'closed' && (
                        <View className="bg-gray-300 px-2 py-1 rounded">
                            <Text className="text-gray-700 text-xs">CERRADO</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando chats...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">Chats Activos</Text>
                {chats.length > 0 && (
                    <Text className="text-sm text-gray-500 mt-1">
                        {chats.length} conversaciones
                    </Text>
                )}
            </View>

            {/* Chats List */}
            <FlatList
                data={chats}
                renderItem={renderChatCard}
                keyExtractor={(item) => item.reportId}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-4 text-center">
                            No hay chats activos
                        </Text>
                    </View>
                }
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            />
        </View>
    );
}
