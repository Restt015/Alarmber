import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import ReportStatusBadge from '../shared/ReportStatusBadge';
import ValidationBadge from '../shared/ValidationBadge';

export default function ReportListItem({
    report,
    onPress,
    onValidate,
    showActions = false,
    showStatus = true,
    accentColor = '#9C27B0'
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
                                : `http://192.168.0.3:5000/${report.photo.replace(/\\/g, '/')}`
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
                    <Text
                        className="text-gray-900 font-bold mb-1"
                        style={{ fontSize: 17, letterSpacing: -0.3 }}
                        numberOfLines={1}
                    >
                        {report.name}, {report.age} años
                    </Text>

                    {/* Location - Hierarchy Level 2 */}
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location" size={14} color="#8E8E93" />
                        <Text
                            className="text-gray-600 ml-1 flex-1"
                            style={{ fontSize: 14 }}
                            numberOfLines={1}
                        >
                            {report.lastLocation}
                        </Text>
                    </View>

                    {/* Date - Hierarchy Level 3 */}
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time-outline" size={14} color="#8E8E93" />
                        <Text className="text-gray-400 text-[12px] ml-1">
                            {formatDate(report.createdAt)}
                        </Text>
                    </View>

                    {/* Badges - Hierarchy Level 4 */}
                    {showStatus && (
                        <View className="flex-row items-center flex-wrap">
                            <View className="mr-2 mb-1">
                                <ValidationBadge validated={report.validated} size="small" />
                            </View>
                            <View className="mb-1">
                                <ReportStatusBadge status={report.status} size="small" />
                            </View>
                        </View>
                    )}
                </View>

                {/* Accent Indicator */}
                <View
                    className="w-1 h-full rounded-full absolute right-0 top-0"
                    style={{ backgroundColor: accentColor }}
                />
            </View>

            {/* Actions for non-validated reports */}
            {showActions && !report.validated && (
                <View
                    className="border-t flex-row"
                    style={{ borderTopColor: 'rgba(0,0,0,0.06)' }}
                >
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            onValidate && onValidate(report._id);
                        }}
                        className="flex-1 py-3 items-center justify-center"
                        style={{ borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.06)' }}
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                            <Text className="text-green-600 text-[14px] font-semibold ml-1">
                                Validar
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation();
                            // Handle view details
                        }}
                        className="flex-1 py-3 items-center justify-center"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="eye" size={18} color="#1976D2" />
                            <Text className="text-blue-600 text-[14px] font-semibold ml-1">
                                Ver detalle
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </TouchableOpacity>
    );
}
