import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import StatusBadge from '../shared/StatusBadge';

export default function ReportCard({ report, onPress }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="bg-white p-4 rounded-2xl border border-gray-100 mb-3 shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-[16px] font-bold text-gray-900">
                        {report.type || "Reporte General"}
                    </Text>
                    <Text className="text-[13px] text-gray-500 mt-0.5">
                        ID: {report.id}
                    </Text>
                </View>
                <StatusBadge status={report.status} />
            </View>

            <Text className="text-gray-600 text-[14px] leading-5 mb-3" numberOfLines={2}>
                {report.description}
            </Text>

            <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={14} color="#9E9E9E" />
                    <Text className="text-gray-400 text-[12px] ml-1">
                        {report.date}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    <Text className="text-red-700 text-[13px] font-semibold mr-1">
                        Ver detalles
                    </Text>
                    <Ionicons name="arrow-forward" size={14} color="#D32F2F" />
                </View>
            </View>
        </TouchableOpacity>
    );
}
