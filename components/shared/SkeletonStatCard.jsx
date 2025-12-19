import { View } from 'react-native';

/**
 * SkeletonStatCard - Skeleton loading placeholder for stat cards in admin dashboard
 */
export default function SkeletonStatCard({ color = '#E0E0E0' }) {
    return (
        <View
            className="flex-1 rounded-3xl p-5 justify-between"
            style={{
                height: 140,
                backgroundColor: color,
                opacity: 0.5,
            }}
        >
            {/* Icon skeleton */}
            <View className="flex-row justify-between">
                <View className="w-12 h-12 bg-white/30 rounded-2xl animate-pulse" />
                <View className="w-6 h-6 bg-white/20 rounded animate-pulse" />
            </View>

            {/* Number skeleton */}
            <View className="h-10 bg-white/30 rounded w-16 animate-pulse mt-2" />

            {/* Label skeleton */}
            <View className="h-4 bg-white/30 rounded w-24 animate-pulse" />
        </View>
    );
}

/**
 * SkeletonStatRow - Two skeleton stat cards side by side
 */
export function SkeletonStatRow() {
    return (
        <View className="flex-row mb-6" style={{ height: 140 }}>
            <View className="flex-1 mr-3">
                <SkeletonStatCard color="#FFCDD2" />
            </View>
            <View className="flex-1">
                <SkeletonStatCard color="#BBDEFB" />
            </View>
        </View>
    );
}
