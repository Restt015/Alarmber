import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export default function ReportListItem({ report, onPress, onValidate, showActions = false }) {
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return '#4CAF50';
            case 'investigating':
                return '#FBC02D';
            case 'resolved':
                return '#1976D2';
            case 'closed':
                return '#757575';
            default:
                return '#9E9E9E';
        }
    };

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

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className="bg-white rounded-xl border border-gray-100 p-4 mb-3"
        >
            <View className="flex-row items-start">
                {/* Photo */}
                {report.photo ? (
                    <Image
                        source={{ uri: report.photo }}
                        className="w-16 h-16 rounded-lg bg-gray-200 mr-3"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-16 h-16 rounded-lg bg-gray-200 mr-3 items-center justify-center">
                        <Ionicons name="person" size={28} color="#9E9E9E" />
                    </View>
                )}

                {/* Info */}
                <View className="flex-1">
                    {/* Name and Age */}
                    <Text className="text-[16px] font-bold text-gray-900 mb-1">
                        {report.name}, {report.age} años
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="location-outline" size={14} color="#757575" />
                        <Text className="text-[13px] text-gray-600 ml-1 flex-1" numberOfLines={1}>
                            {report.lastLocation}
                        </Text>
                    </View>

                    {/* Reporter */}
                    {report.reportedBy && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="person-circle-outline" size={14} color="#757575" />
                            <Text className="text-[12px] text-gray-500 ml-1">
                                Por: {report.reportedBy.name}
                            </Text>
                        </View>
                    )}

                    {/* Date and Status */}
                    <View className="flex-row items-center justify-between mt-2">
                        <Text className="text-[11px] text-gray-400">
                            {formatDate(report.createdAt)}
                        </Text>

                        <View className="flex-row items-center space-x-2">
                            {/* Validation Badge */}
                            {!report.validated && (
                                <View className="bg-orange-50 px-2 py-1 rounded-md mr-2">
                                    <Text className="text-[10px] font-bold text-orange-600">
                                        Sin validar
                                    </Text>
                                </View>
                            )}

                            {/* Status Badge */}
                            <View
                                className="px-2 py-1 rounded-md"
                                style={{ backgroundColor: `${getStatusColor(report.status)}15` }}
                            >
                                <Text
                                    className="text-[10px] font-bold capitalize"
                                    style={{ color: getStatusColor(report.status) }}
                                >
                                    {report.status}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Actions (Admin Only) */}
                    {showActions && !report.validated && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation();
                                onValidate?.(report._id);
                            }}
                            className="mt-3 bg-green-50 px-3 py-2 rounded-lg self-start"
                        >
                            <Text className="text-green-700 font-bold text-[12px]">
                                ✓ Validar Reporte
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
