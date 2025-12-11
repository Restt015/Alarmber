import { router } from "expo-router";
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View } from 'react-native';
import AlertCard from '../../components/cards/AlertCard';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import SearchBar from '../../components/shared/SearchBar';
import reportService from '../../services/reportService';

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAlerts = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const params = {
        status: 'active'
      };

      if (searchQuery.trim()) {
        params.search = searchQuery;
      }

      const response = await reportService.getReports(params);
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() || searchQuery === '') {
      const delaySearch = setTimeout(() => {
        loadAlerts();
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

  if (loading) {
    return (
      <View className="flex-1 bg-white">
        <PageHeader
          title="Alertas Activas"
          subtitle="Personas desaparecidas recientemente"
        />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#D32F2F" />
        </View>
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
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Buscar por nombre o ubicación..."
        />
      </View>

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
