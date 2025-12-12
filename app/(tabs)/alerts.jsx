import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import AlertCard from '../../components/cards/AlertCard';
import EmptyState from '../../components/shared/EmptyState';
import ErrorState from '../../components/shared/ErrorState';
import PageHeader from '../../components/shared/PageHeader';
import SearchBar from '../../components/shared/SearchBar';
import { SkeletonList } from '../../components/shared/SkeletonCard';
import reportService from '../../services/reportService';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAlerts = async (isRefresh = false, isSearch = false) => {
    try {
      if (!isRefresh && !isSearch) setLoading(true);
      if (isSearch) setSearching(true);
      setError(null);

      const params = {
        status: 'active'
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await reportService.getReports(params);
      console.log('✅ Alerts loaded:', response.data?.length || 0);
      setAlerts(response.data || []);
    } catch (err) {
      console.error('❌ Error loading alerts:', err);
      setError(err.message || 'Error al cargar las alertas');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadAlerts(true);
    }, [searchQuery])
  );

  useEffect(() => {
    if (searchQuery.trim() || searchQuery === '') {
      const delaySearch = setTimeout(() => {
        loadAlerts(false, true);
      }, 300);

      return () => clearTimeout(delaySearch);
    }
  }, [searchQuery]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlerts(true);
  };

  const formatAlertForCard = (report) => ({
    id: report._id,
    name: report.name,
    age: report.age,
    lastSeen: report.lastLocation,
    date: formatDate(report.createdAt),
    status: getStatusLabel(report.status),
    photo: report.photo
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Urgente',
      investigating: 'En Búsqueda',
      resolved: 'Encontrado',
      closed: 'Cerrado'
    };
    return labels[status] || 'Activo';
  };

  // Initial loading state with skeletons
  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader
          title="Alertas Activas"
          subtitle="Personas desaparecidas recientemente"
        />
        <View className="px-5 mt-4 mb-4">
          <View className="h-12 bg-gray-100 rounded-xl" />
        </View>
        <SkeletonList count={4} style={{ paddingHorizontal: 20 }} />
      </View>
    );
  }

  // Error state with retry
  if (error && alerts.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader
          title="Alertas Activas"
          subtitle="Personas desaparecidas recientemente"
        />
        <ErrorState
          title="Error al cargar alertas"
          message={error}
          onRetry={() => loadAlerts()}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Alertas Activas"
        subtitle="Personas desaparecidas recientemente"
      />

      <View className="px-5 mt-4">
        <View className="relative">
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onClear={() => setSearchQuery('')}
            placeholder="Buscar por nombre o ubicación..."
          />
          {/* Search loading indicator */}
          {searching && (
            <View className="absolute right-12 top-3">
              <ActivityIndicator size="small" color="#D32F2F" />
            </View>
          )}
        </View>
      </View>

      {/* Results count when searching */}
      {searchQuery.trim() && !searching && (
        <View className="px-5 py-2">
          <Text className="text-gray-500 text-sm">
            {alerts.length} resultado{alerts.length !== 1 ? 's' : ''} para "{searchQuery}"
          </Text>
        </View>
      )}

      <FlatList
        data={alerts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <AlertCard
            alert={formatAlertForCard(item)}
            onPress={() => router.push(`/alert/${item._id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#D32F2F']}
            tintColor="#D32F2F"
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No se encontraron alertas"
            message={searchQuery ? "Intenta buscar con otro nombre o ubicación." : "No hay reportes activos en este momento."}
          />
        }
      />
    </View>
  );
}

