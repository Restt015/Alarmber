import { useState } from 'react';
import { FlatList, View } from 'react-native';
import AlertCard from '../../components/cards/AlertCard';
import EmptyState from '../../components/shared/EmptyState';
import PageHeader from '../../components/shared/PageHeader';
import SearchBar from '../../components/shared/SearchBar';

const ALERTS_DATA = [
  {
    id: "1",
    name: "Sofia Ramirez",
    age: "14",
    lastSeen: "Plaza Central, Ciudad de México",
    date: "Hace 2 horas",
    status: "Urgente",
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    name: "Miguel Angel Torres",
    age: "7",
    lastSeen: "Parque México, Condesa",
    date: "Hace 5 horas",
    status: "En Búsqueda",
    photo: "https://images.unsplash.com/photo-1503919545885-7f4941199540?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    name: "Lucia Mendez",
    age: "16",
    lastSeen: "Metro Insurgentes",
    date: "Ayer",
    status: "Reciente",
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    name: "Carlos Ruiz",
    age: "12",
    lastSeen: "Centro Comercial Santa Fe",
    date: "Hace 1 día",
    status: "En Búsqueda",
    photo: "https://images.unsplash.com/photo-1488161628813-99c974fc5bfe?w=400&auto=format&fit=crop&q=60",
  },
];

export default function AlertsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = ALERTS_DATA.filter(alert =>
    alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.lastSeen.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 10, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title="No se encontraron alertas"
            message="Intenta buscar con otro nombre o ubicación."
          />
        }
      />
    </View>
  );
}
