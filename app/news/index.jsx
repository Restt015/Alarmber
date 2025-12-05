import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Image, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';

const mockNews = [
    {
        id: '1',
        title: 'Nueva estrategia de búsqueda implementada en la ciudad',
        source: 'Seguridad Pública',
        time: 'Hace 2 horas',
        image: 'https://via.placeholder.com/300',
        content: 'Las autoridades han desplegado un nuevo operativo con drones para agilizar la búsqueda de personas en zonas de difícil acceso.'
    },
    {
        id: '2',
        title: 'Resultados del operativo de fin de semana',
        source: 'Policía Municipal',
        time: 'Hace 5 horas',
        image: 'https://via.placeholder.com/300',
        content: 'Gracias a la colaboración ciudadana, se lograron localizar a 3 personas reportadas como desaparecidas en las últimas 48 horas.'
    },
    {
        id: '3',
        title: 'Consejos de seguridad para la comunidad',
        source: 'Prevención del Delito',
        time: 'Ayer',
        image: 'https://via.placeholder.com/300',
        content: 'Expertos recomiendan mantener actualizados los datos de contacto de familiares y establecer palabras clave de emergencia.'
    },
    {
        id: '4',
        title: 'Voluntarios se unen a las brigadas de búsqueda',
        source: 'Organización Civil',
        time: 'Hace 2 días',
        image: 'https://via.placeholder.com/300',
        content: 'Más de 50 voluntarios se han sumado a las labores de rastreo en el sector norte de la ciudad.'
    },
    {
        id: '5',
        title: 'Actualización de la App Alerta Ciudadana',
        source: 'Soporte Técnico',
        time: 'Hace 3 días',
        image: 'https://via.placeholder.com/300',
        content: 'La nueva versión incluye mejoras en el sistema de notificaciones y un mapa interactivo más preciso.'
    },
];

const NewsItem = ({ item }) => (
    <TouchableOpacity
        activeOpacity={0.9}
        className="bg-surface mb-5 rounded-2xl overflow-hidden shadow-sm border border-surfaceVariant"
    >
        <View className="h-[180px] w-full relative">
            <Image
                source={{ uri: item.image }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute top-3 left-3 bg-surface/90 px-2 py-1 rounded-md">
                <Text className="text-[10px] font-bold text-primary uppercase">{item.source}</Text>
            </View>
        </View>

        <View className="p-4">
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-[18px] font-bold text-text flex-1 mr-2 leading-6">{item.title}</Text>
                <Text className="text-[12px] text-textSecondary mt-1">{item.time}</Text>
            </View>

            <Text className="text-[14px] text-textSecondary leading-5" numberOfLines={3}>
                {item.content}
            </Text>

            <View className="flex-row items-center mt-3">
                <Text className="text-primary font-semibold text-[14px]">Leer más</Text>
                <Ionicons name="arrow-forward" size={16} color="#D32F2F" style={{ marginLeft: 4 }} />
            </View>
        </View>
    </TouchableOpacity>
);

import AppHeader from '../../components/AppHeader';

export default function NewsScreen() {
    return (
        <View className="flex-1 bg-background">
            <AppHeader title="Noticias" showBack={true} />
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-surfaceVariant bg-surface">
                <Text className="text-[20px] font-bold text-text">Últimas Actualizaciones</Text>
            </View>

            <FlatList
                data={mockNews}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <NewsItem item={item} />}
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
