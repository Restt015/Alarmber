import { View } from 'react-native';

/**
 * SkeletonProfile - Skeleton loading placeholder for profile screen
 */
export default function SkeletonProfile() {
    return (
        <View className="flex-1 bg-white">
            {/* Avatar skeleton */}
            <View className="items-center pt-8 pb-6 bg-gray-50">
                <View className="w-28 h-28 rounded-full bg-gray-200 animate-pulse mb-4" />
                <View className="h-6 bg-gray-200 rounded w-40 animate-pulse mb-2" />
                <View className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
            </View>

            {/* Stats row skeleton */}
            <View className="flex-row justify-around py-6 border-b border-gray-100">
                {[1, 2, 3].map((i) => (
                    <View key={i} className="items-center">
                        <View className="h-6 bg-gray-200 rounded w-8 animate-pulse mb-1" />
                        <View className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                    </View>
                ))}
            </View>

            {/* Menu items skeleton */}
            <View className="px-5 pt-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <View
                        key={i}
                        className="flex-row items-center py-4 border-b border-gray-100"
                    >
                        <View className="w-10 h-10 rounded-full bg-gray-100 animate-pulse mr-4" />
                        <View className="flex-1">
                            <View className="h-4 bg-gray-200 rounded w-32 animate-pulse mb-1" />
                            <View className="h-3 bg-gray-100 rounded w-48 animate-pulse" />
                        </View>
                        <View className="w-5 h-5 bg-gray-100 rounded animate-pulse" />
                    </View>
                ))}
            </View>
        </View>
    );
}
