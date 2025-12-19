import { View } from 'react-native';

/**
 * SkeletonCard - Skeleton loading placeholder for alert/report cards
 * Provides a shimmering placeholder while data loads
 */
export default function SkeletonCard({ style }) {
    return (
        <View
            className="mb-4 bg-white rounded-2xl p-4 flex-row"
            style={[{
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
            }, style]}
        >
            {/* Photo skeleton */}
            <View className="w-20 h-20 rounded-xl bg-gray-200 mr-4 animate-pulse" />

            {/* Content skeleton */}
            <View className="flex-1 justify-center">
                {/* Title skeleton */}
                <View className="flex-row justify-between items-start mb-2">
                    <View className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                    <View className="h-5 bg-gray-100 rounded-md w-16 animate-pulse" />
                </View>

                {/* Location skeleton */}
                <View className="h-3 bg-gray-200 rounded w-4/5 mb-2 animate-pulse" />

                {/* Date skeleton */}
                <View className="flex-row items-center mt-2">
                    <View className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
                    <View className="h-3 bg-gray-200 rounded w-20 ml-1 animate-pulse" />
                </View>
            </View>
        </View>
    );
}

/**
 * SkeletonList - Renders multiple skeleton cards
 */
export function SkeletonList({ count = 3, style }) {
    return (
        <View style={style}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </View>
    );
}
