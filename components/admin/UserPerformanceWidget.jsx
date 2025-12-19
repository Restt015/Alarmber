import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function UserPerformanceWidget({ topReporters = [] }) {
    return (
        <View className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-3">
                        <Ionicons name="people" size={20} color="#1976D2" />
                    </View>
                    <Text className="text-[16px] font-bold text-gray-900">
                        Reportadores Activos
                    </Text>
                </View>
            </View>

            {/* List */}
            {topReporters.length > 0 ? (
                topReporters.slice(0, 5).map((reporter, index) => (
                    <View
                        key={reporter._id}
                        className="flex-row items-center justify-between py-3 border-b border-gray-100"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center mr-3">
                                <Text className="text-gray-700 font-bold text-[12px]">
                                    {reporter.name.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] font-semibold text-gray-900" numberOfLines={1}>
                                    {reporter.name}
                                </Text>
                                <Text className="text-[11px] text-gray-500">
                                    {reporter.email}
                                </Text>
                            </View>
                        </View>

                        <View className="items-end ml-3">
                            <Text className="text-[16px] font-bold text-blue-600">
                                {reporter.reportCount}
                            </Text>
                            <Text className="text-[10px] text-gray-400">
                                reportes
                            </Text>
                        </View>
                    </View>
                ))
            ) : (
                <View className="py-8 items-center">
                    <Ionicons name="people-outline" size={32} color="#BDBDBD" />
                    <Text className="text-gray-400 text-[13px] mt-2">
                        No hay datos disponibles
                    </Text>
                </View>
            )}
        </View>
    );
}
