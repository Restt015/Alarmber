import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { getActivityColors, theme } from '../../constants/theme';

const RELATIONSHIP_LABELS = {
    family: 'Familiar',
    friend: 'Amigo/a',
    partner: 'Pareja',
    neighbor: 'Vecino/a',
    coworker: 'Colega',
    other: 'Conocido'
};

export default function ReporterBox({ name, profileImage, relationship, time, activityStatus, isOwner = false }) {
    const relationshipLabel = RELATIONSHIP_LABELS[relationship] || 'Reportero';

    // Get activity colors from theme
    const activityColors = activityStatus?.isOnline
        ? getActivityColors('online')
        : getActivityColors('recent');

    return (
        <View
            style={{
                padding: theme.spacing.lg,
                borderRadius: theme.borderRadius.lg,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                backgroundColor: isOwner ? theme.colors.secondary.light : theme.colors.gray[100],
                borderColor: isOwner ? theme.colors.secondary.main + '30' : theme.colors.gray[200],
            }}
        >
            {/* Avatar */}
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: theme.borderRadius.full,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderWidth: 1,
                    marginRight: theme.spacing.md,
                    backgroundColor: isOwner ? theme.colors.secondary.light : theme.colors.white,
                    borderColor: isOwner ? theme.colors.secondary.main + '50' : theme.colors.gray[300],
                }}
            >
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={{ width: 48, height: 48 }}
                        resizeMode="cover"
                    />
                ) : (
                    <Ionicons
                        name={isOwner ? "person-circle" : "person"}
                        size={24}
                        color={isOwner ? theme.colors.secondary.main : theme.colors.gray[400]}
                    />
                )}
            </View>

            {/* Name, relationship and activity status */}
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: isOwner ? theme.colors.secondary.dark : theme.colors.gray[900],
                    }}
                >
                    {isOwner ? 'Creado por ti' : name}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: isOwner ? theme.colors.secondary.main : theme.colors.gray[600],
                        marginTop: 2,
                    }}
                >
                    {relationshipLabel} • {time}
                </Text>

                {/* Activity Status - Only show for other users */}
                {!isOwner && activityStatus && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: activityColors.dot,
                                marginRight: 6,
                            }}
                        />
                        <Text
                            style={{
                                fontSize: 11,
                                color: activityColors.text,
                                fontWeight: '500',
                            }}
                        >
                            {activityStatus.label}
                        </Text>
                    </View>
                )}
            </View>

            {/* Action buttons */}
            {!isOwner && (
                <TouchableOpacity
                    style={{
                        backgroundColor: theme.colors.white,
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.full,
                        borderWidth: 1,
                        borderColor: theme.colors.gray[200],
                    }}
                >
                    <Ionicons name="chatbubble-outline" size={20} color={theme.colors.gray[600]} />
                </TouchableOpacity>
            )}
            {isOwner && (
                <View
                    style={{
                        backgroundColor: theme.colors.secondary.light,
                        paddingHorizontal: theme.spacing.md,
                        paddingVertical: theme.spacing.xs,
                        borderRadius: theme.borderRadius.full,
                    }}
                >
                    <Text
                        style={{
                            color: theme.colors.secondary.dark,
                            fontSize: 11,
                            fontWeight: '700',
                        }}
                    >
                        Tu reporte
                    </Text>
                </View>
            )}
        </View>
    );
}
