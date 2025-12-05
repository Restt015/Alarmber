import { FlatList, View } from 'react-native';
import NewsCard from '../../components/cards/NewsCard';
import PageHeader from '../../components/shared/PageHeader';

const NEWS_DATA = [
    {
        id: "1",
        title: "Aumentan operativos de búsqueda en la zona centro",
        source: "Policía Nacional",
        time: "Hace 2 horas",
        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd81?w=500&auto=format&fit=crop&q=60",
    },
    {
        id: "2",
        title: "Nueva tecnología ayuda a localizar personas en tiempo récord",
        source: "Tecnología",
        time: "Hace 5 horas",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500&auto=format&fit=crop&q=60",
    },
    {
        id: "3",
        title: "Consejos de seguridad para niños en parques públicos",
        source: "Prevención",
        time: "Ayer",
        image: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=500&auto=format&fit=crop&q=60",
    },
    {
        id: "4",
        title: "Voluntarios se unen para búsqueda masiva este fin de semana",
        source: "Comunidad",
        time: "Hace 2 días",
        image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=500&auto=format&fit=crop&q=60",
    },
];

export default function NewsScreen() {
    return (
        <View className="flex-1 bg-white">
            <PageHeader
                title="Noticias"
                subtitle="Actualidad y prevención"
                showBack={true}
            />

            <FlatList
                data={NEWS_DATA}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View className="px-5">
                        <NewsCard
                            {...item}
                            fullWidth={true}
                            onPress={() => { }}
                        />
                    </View>
                )}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
