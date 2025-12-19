import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

const NOTIFICATION_COLORS = {
    accepted: { bg: '#E8F5E9', icon: '#4CAF50', iconName: 'checkmark-circle' },
    review: { bg: '#FFF3E0', icon: '#FF9800', iconName: 'time' },
    rejected: { bg: '#FFEBEE', icon: '#F44336', iconName: 'close-circle' },
    updated: { bg: '#E3F2FD', icon: '#2196F3', iconName: 'refresh-circle' },
    comment: { bg: '#F3E5F5', icon: '#9C27B0', iconName: 'chatbubble' },
    system: { bg: '#ECEFF1', icon: '#607D8B', iconName: 'information-circle' }
};

export default function NotificationToast({ notification, onDismiss }) {
    const translateY = useRef(new Animated.Value(-100)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (notification) {
            // Animate in
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 4 seconds
            const timeout = setTimeout(() => {
                dismiss();
            }, 4000);

            return () => clearTimeout(timeout);
        }
    }, [notification]);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss?.();
        });
    };

    const handlePress = () => {
        const data = notification?.request?.content?.data;
        dismiss();

        // Navigate to report if available
        if (data?.reportId) {
            router.push(`/alert/${data.reportId}`);
        } else {
            router.push('/(tabs)/notifications');
        }
    };

    if (!notification) return null;

    const content = notification.request.content;
    const data = content.data || {};
    const type = data.type || 'system';
    const colors = NOTIFICATION_COLORS[type] || NOTIFICATION_COLORS.system;

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 50,
                left: 16,
                right: 16,
                zIndex: 9999,
                transform: [{ translateY }],
                opacity,
            }}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.9}
                style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                    borderLeftWidth: 4,
                    borderLeftColor: colors.icon,
                }}
            >
                {/* Icon */}
                <View
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        backgroundColor: colors.bg,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 12,
                    }}
                >
                    <Ionicons name={colors.iconName} size={24} color={colors.icon} />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            fontSize: 15,
                            fontWeight: '700',
                            color: '#1F2937',
                            marginBottom: 2,
                        }}
                        numberOfLines={1}
                    >
                        {content.title}
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: '#6B7280',
                            lineHeight: 18,
                        }}
                        numberOfLines={2}
                    >
                        {content.body}
                    </Text>
                </View>

                {/* Dismiss button */}
                <TouchableOpacity
                    onPress={dismiss}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{ padding: 4 }}
                >
                    <Ionicons name="close" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    );
}
