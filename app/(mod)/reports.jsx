import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import modReportsService from '../../services/modReportsService';

export default function ModReportsScreen() {
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        if (!loading) {
            loadReports();
        }
    }, [filters, search]);

    const loadReports = async () => {
        try {
            setLoading(true);
            const response = await modReportsService.getModReports({
                ...filters,
                q: search
            });
            setReports(response.data || []);
        } catch (error) {
            console.error('Failed to load reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReports();
        setRefreshing(false);
    };

    const toggleFilter = (key, value) => {
        setFilters(prev => {
            if (prev[key] === value) {
                const newFilters = { ...prev };
                delete newFilters[key];
                return newFilters;
            }
            return { ...prev, [key]: value };
        });
    };

    const renderReportCard = ({ item }) => (
        <TouchableOpacity
            className="bg-white p-4 rounded-lg mb-3 shadow-sm"
            onPress={() => router.push(`/alert/${item._id}`)}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="font-bold text-gray-900 flex-1 text-base">
                    {item.name}
                </Text>
                {item.priority === 'Alta' && (
                    <View className="bg-red-600 px-2 py-1 rounded ml-2">
                        <Text className="text-white text-xs font-bold">URGENTE</Text>
                    </View>
                )}
            </View>

            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {item.description}
            </Text>

            <View className="flex-row items-center flex-wrap gap-2">
                {item.activeChatCount > 0 && (
                    <View className="bg-blue-100 px-2 py-1 rounded">
                        <Text className="text-blue-700 text-xs">
                            💬 {item.activeChatCount} mensajes
                        </Text>
                    </View>
                )}
                {item.chatStatus === 'closed' && (
                    <View className="bg-gray-300 px-2 py-1 rounded">
                        <Text className="text-gray-700 text-xs">🔒 CERRADO</Text>
                    </View>
                )}
                {item.chatStatus === 'slowmode' && (
                    <View className="bg-orange-100 px-2 py-1 rounded">
                        <Text className="text-orange-700 text-xs">⏱️ LENTO</Text>
                    </View>
                )}
                <Text className="text-gray-400 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando reportes...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900 mb-3">Reportes</Text>
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-gray-900"
                        placeholder="Buscar reportes..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Filters */}
            <ScrollView
                horizontal
                className="bg-white px-4 py-2 border-b border-gray-200"
                showsHorizontalScrollIndicator={false}
            >
                <TouchableOpacity
                    className={`mr-2 px-4 py-1.5 rounded-full ${filters.urgent === 'true' ? 'bg-red-500' : 'bg-gray-200'
                        }`}
                    onPress={() => toggleFilter('urgent', 'true')}
                >
                    <Text
                        className={`text-sm font-medium ${filters.urgent === 'true' ? 'text-white' : 'text-gray-700'
                            }`}
                    >
                        Urgentes
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`mr-2 px-4 py-1.5 rounded-full ${filters.status === 'Abierto' ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                    onPress={() => toggleFilter('status', 'Abierto')}
                >
                    <Text
                        className={`text-sm font-medium ${filters.status === 'Abierto' ? 'text-white' : 'text-gray-700'
                            }`}
                    >
                        Abiertos
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className={`mr-2 px-4 py-1.5 rounded-full ${filters.status === 'Cerrado' ? 'bg-gray-600' : 'bg-gray-200'
                        }`}
                    onPress={() => toggleFilter('status', 'Cerrado')}
                >
                    <Text
                        className={`text-sm font-medium ${filters.status === 'Cerrado' ? 'text-white' : 'text-gray-700'
                            }`}
                    >
                        Cerrados
                    </Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Reports List */}
            <FlatList
                data={reports}
                renderItem={renderReportCard}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-400 mt-4 text-center">
                            No hay reportes
                        </Text>
                    </View>
                }
                contentContainerStyle={{ padding: 16, flexGrow: 1 }}
            />
        </View>
    );
}
