import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Image, View } from 'react-native';

/**
 * ImageWithFallback - Image component with loading indicator and fallback
 * Shows a placeholder while loading and an icon if the image fails
 * 
 * @param {string} uri - The image URI to load
 * @param {string} fallbackIcon - Ionicons name for fallback (default: 'person-outline')
 * @param {number} fallbackIconSize - Size of the fallback icon
 * @param {string} fallbackIconColor - Color of the fallback icon
 * @param {object} style - Additional styles for the container
 * @param {string} className - NativeWind classes for the container
 */
export default function ImageWithFallback({
    uri,
    fallbackIcon = 'person-outline',
    fallbackIconSize = 32,
    fallbackIconColor = '#9CA3AF',
    style,
    className = '',
    resizeMode = 'cover',
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // No URI provided - show fallback immediately
    if (!uri) {
        return (
            <View
                className={`bg-gray-200 items-center justify-center ${className}`}
                style={style}
            >
                <Ionicons name={fallbackIcon} size={fallbackIconSize} color={fallbackIconColor} />
            </View>
        );
    }

    // Error loading image - show fallback
    if (error) {
        return (
            <View
                className={`bg-gray-200 items-center justify-center ${className}`}
                style={style}
            >
                <Ionicons name={fallbackIcon} size={fallbackIconSize} color={fallbackIconColor} />
            </View>
        );
    }

    return (
        <View className={`${className}`} style={style}>
            {/* Loading indicator */}
            {loading && (
                <View className="absolute inset-0 bg-gray-100 items-center justify-center z-10">
                    <ActivityIndicator size="small" color="#9CA3AF" />
                </View>
            )}

            {/* Actual image */}
            <Image
                source={{ uri }}
                className="w-full h-full"
                resizeMode={resizeMode}
                onLoadStart={() => setLoading(true)}
                onLoadEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
        </View>
    );
}
