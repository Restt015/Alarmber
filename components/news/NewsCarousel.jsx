import { Dimensions, ScrollView } from 'react-native';
import NewsCard from '../cards/NewsCard';

const { width } = Dimensions.get('window');

export default function NewsCarousel({ news, onNewsPress }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}
        >
            {news.map((item) => (
                <NewsCard
                    key={item.id}
                    {...item}
                    onPress={() => onNewsPress(item.id)}
                />
            ))}
        </ScrollView>
    );
}
