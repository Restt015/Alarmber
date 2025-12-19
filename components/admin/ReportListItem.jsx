import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../constants/theme';

export default function ReportListItem({
    report,
    onPress,
    onValidate,
    onReject,
    onStatusChange,
    currentFilter = 'all',
    showActions = false,
}) {
    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    };

    // Get single relevant badge based on context
    const getBadgeForContext = () => {
        if (currentFilter === 'pending' && !report.validated) {
            return { label: 'SIN VALIDAR', color: theme.colors.warning.main, bg: theme.colors.warning.light };
        }
        if (currentFilter === 'active' && report.status === 'active') {
            return { label: 'ACTIVO', color: theme.colors.primary.main, bg: theme.colors.primary.light };
        }
        if (currentFilter === 'followup') {
            return { label: 'SEGUIMIENTO', color: '#9C27B0', bg: '#F3E5F5' };
        }
        if (currentFilter === 'closed' && (report.status === 'closed' || report.status === 'resolved')) {
            return { label: 'CERRADO', color: theme.colors.gray[600], bg: theme.colors.gray[200] };
        }
        // Default: show status
        if (report.status === 'active') {
            return { label: 'ACTIVO', color: theme.colors.primary.main, bg: theme.colors.primary.light };
        }
        return null;
    };

    // Get priority indicator
    const getPriorityDisplay = () => {
        const priority = report.priority || 'media';
        const priorityConfig = {
            alta: { icon: 'alert-circle', color: theme.colors.primary.main, label: 'Alta' },
            media: { icon: 'radio-button-on', color: theme.colors.warning.main, label: 'Media' },
            baja: { icon: 'ellipse-outline', color: theme.colors.gray[400], label: 'Baja' },
        };
        return priorityConfig[priority] || priorityConfig.media;
    };

    const badge = getBadgeForContext();
    const priority = getPriorityDisplay();

    // Quick actions based on current filter
    const getQuickActions = () => {
        if (!showActions) return null;

        switch (currentFilter) {
            case 'pending':
                return (
                    <>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                Alert.alert(
                                    'Rechazar Reporte',
                                    '¿Estás seguro de rechazar este reporte?',
                                    [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Rechazar',
                                            style: 'destructive',
                                            onPress: () => onReject && onReject(report._id)
                                        }
                                    ]
                                );
                            }}
                            className="flex-1 py-3 items-center justify-center"
                            style={{ borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.06)' }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="close-circle" size={18} color={theme.colors.primary.main} />
                                <Text className="text-[14px] font-semibold ml-1" style={{ color: theme.colors.primary.main }}>
                                    Rechazar
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onValidate && onValidate(report._id);
                            }}
                            className="flex-1 py-3 items-center justify-center"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="checkmark-circle" size={18} color={theme.colors.success.main} />
                                <Text className="text-[14px] font-semibold ml-1" style={{ color: theme.colors.success.main }}>
                                    Validar
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </>
                );

            case 'active':
                return (
                    <>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onStatusChange && onStatusChange(report._id, 'followup');
                            }}
                            className="flex-1 py-3 items-center justify-center"
                            style={{ borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.06)' }}
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="trending-up" size={18} color="#9C27B0" />
                                <Text className="text-[14px] font-semibold ml-1" style={{ color: '#9C27B0' }}>
                                    Seguimiento
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onStatusChange && onStatusChange(report._id, 'closed');
                            }}
                            className="flex-1 py-3 items-center justify-center"
                        >
                            <View className="flex-row items-center">
                                <Ionicons name="close-circle" size={18} color={theme.colors.gray[600]} />
                                <Text className="text-[14px] font-semibold ml-1" style={{ color: theme.colors.gray[600] }}>
                                    Cerrar
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </>
                );

            case 'followup':
                return (
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onStatusChange && onStatusChange(report._id, 'closed');
                        }}
                        className="flex-1 py-3 items-center justify-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-done-circle" size={18} color={theme.colors.success.main} />
                            <Text className="text-[14px] font-semibold ml-1" style={{ color: theme.colors.success.main }}>
                                Finalizar
                            </Text>
                        </View>
                    </TouchableOpacity>
                );

            default:
                return null;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPress}
            className="bg-white rounded-2xl overflow-hidden"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 3,
                borderWidth: 1,
                borderColor: 'rgba(0,0,0,0.04)'
            }}
        >
            <View className="flex-row items-start p-4">
                {/* Photo */}
                {report.photo ? (
                    <Image
                        source={{
                            uri: report.photo.startsWith('http')
                                ? report.photo
                                : `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000'}/${report.photo.replace(/\\/g, '/')}`
                        }}
                        className="w-20 h-20 rounded-xl bg-gray-200 mr-4"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-20 h-20 rounded-xl bg-gray-100 mr-4 items-center justify-center">
                        <Ionicons name="person" size={32} color="#BDBDBD" />
                    </View>
                )}

                {/* Info */}
                <View className="flex-1">
                    {/* Name and Age - Hierarchy Level 1 */}
                    <View className="flex-row items-center justify-between mb-1">
                        <Text
                            className="text-gray-900 font-bold flex-1"
                            style={{ fontSize: 17, letterSpacing: -0.3 }}
                            numberOfLines={1}
                        >
                            {report.name}, {report.age} años
                        </Text>
                        {/* Priority Indicator */}
                        <View className="ml-2">
                            <Ionicons name={priority.icon} size={16} color={priority.color} />
                        </View>
                    </View>

                    {/* Location - Hierarchy Level 2 */}
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="location" size={14} color="#8E8E93" />
                        <Text
                            className="text-gray-600 ml-1 flex-1"
                            style={{ fontSize: 14 }}
                            numberOfLines={1}
                        >
                            {report.lastLocation}
                        </Text>
                    </View>

                    {/* Audit Info - Creator */}
                    {report.reportedBy && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="person-circle-outline" size={14} color="#8E8E93" />
                            <Text className="text-gray-500 text-[12px] ml-1">
                                Creado por: {report.reportedBy.name || 'Desconocido'}
                                {report.createdByAdmin && ' (Admin)'}
                            </Text>
                        </View>
                    )}

                    {/* Date - Hierarchy Level 3 */}
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="time-outline" size={14} color="#8E8E93" />
                        <Text className="text-gray-400 text-[12px] ml-1">
                            {formatDate(report.createdAt)}
                        </Text>
                    </View>

                    {/* Single Relevant Badge */}
                    {badge && (
                        <View
                            className="px-2 py-1 rounded-md self-start"
                            style={{ backgroundColor: badge.bg }}
                        >
                            <Text
                                className="text-[10px] font-bold uppercase"
                                style={{ color: badge.color, letterSpacing: 0.5 }}
                            >
                                {badge.label}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Quick Actions */}
            {showActions && (
                <View
                    className="border-t flex-row"
                    style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}
                >
                    {getQuickActions()}
                </View>
            )}
        </TouchableOpacity>
    );
}
