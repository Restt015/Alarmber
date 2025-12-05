import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Image, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockPendingReports = [
    { id: '101', name: 'Juanito Pérez', age: 10, location: 'Parque Central', time: 'Hace 30 min', photo: 'https://via.placeholder.com/150', status: 'Pendiente' },
    { id: '102', name: 'Sra. Martha', age: 75, location: 'Mercado Municipal', time: 'Hace 1 hora', photo: 'https://via.placeholder.com/150', status: 'Pendiente' },
    { id: '103', name: 'Desconocido', age: '30-40', location: 'Av. Reforma', time: 'Hace 2 horas', photo: 'https://via.placeholder.com/150', status: 'Pendiente' },
];

const AdminReportCard = ({ report, onApprove, onReject }) => (
    <Card className="mx-5 mb-4 bg-surface shadow-sm border border-surfaceVariant" mode="elevated">
        <Card.Content className="p-0">
            <View className="flex-row p-3">
                <Image source={{ uri: report.photo }} className="w-20 h-20 rounded-xl bg-surfaceVariant" />
                <View className="flex-1 ml-3">
                    <View className="flex-row justify-between items-start">
                        <Text className="text-base font-bold text-text flex-1 mr-2">{report.name}</Text>
                        <View className="bg-warning px-2 py-0.5 rounded">
                            <Text className="text-[10px] font-bold text-text">PENDIENTE</Text>
                        </View>
                    </View>
                    <Text className="text-sm text-textSecondary mt-1">Edad: {report.age}</Text>
                    <Text className="text-xs text-textSecondary mt-1">{report.location}</Text>
                    <Text className="text-xs text-textSecondary mt-1 font-medium">{report.time}</Text>
                </View>
            </View>

            <View className="flex-row border-t border-surfaceVariant">
                <TouchableOpacity
                    onPress={() => onReject(report.id)}
                    className="flex-1 py-3 items-center justify-center border-r border-surfaceVariant active:bg-surfaceVariant"
                >
                    <Text className="text-textSecondary font-bold">Rechazar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onApprove(report.id)}
                    className="flex-1 py-3 items-center justify-center active:bg-surfaceVariant"
                >
                    <Text className="text-primary font-bold">Validar & Publicar</Text>
                </TouchableOpacity>
            </View>
        </Card.Content>
    </Card>
);

export default function AdminDashboard() {
    const [reports, setReports] = useState(mockPendingReports);

    const handleApprove = (id) => {
        Alert.alert(
            'Confirmar Validación',
            '¿Estás seguro de que deseas validar y publicar este reporte?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Publicar',
                    onPress: () => {
                        setReports(reports.filter(r => r.id !== id));
                        // In a real app, this would make an API call
                    }
                }
            ]
        );
    };

    const handleReject = (id) => {
        Alert.alert(
            'Rechazar Reporte',
            '¿Estás seguro de que deseas rechazar este reporte?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Rechazar',
                    style: 'destructive',
                    onPress: () => {
                        setReports(reports.filter(r => r.id !== id));
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="px-5 py-3 border-b border-surfaceVariant bg-surface flex-row items-center justify-between">
                <View>
                    <Text variant="titleLarge" className="font-bold text-text">Panel de Admin</Text>
                    <Text variant="bodySmall" className="text-textSecondary">Gestión de Reportes</Text>
                </View>
                <IconButton icon="logout" size={24} iconColor="#757575" onPress={() => router.replace('/(tabs)')} />
            </View>

            <View className="px-5 py-4">
                <View className="flex-row gap-3 mb-2">
                    <Card className="flex-1 bg-surface border border-surfaceVariant p-3 items-center">
                        <Text variant="displaySmall" className="font-bold text-warning mb-1">{reports.length}</Text>
                        <Text variant="labelSmall" className="text-textSecondary text-center">Pendientes</Text>
                    </Card>
                    <Card className="flex-1 bg-surface border border-surfaceVariant p-3 items-center">
                        <Text variant="displaySmall" className="font-bold text-primary mb-1">12</Text>
                        <Text variant="labelSmall" className="text-textSecondary text-center">Urgentes</Text>
                    </Card>
                    <Card className="flex-1 bg-surface border border-surfaceVariant p-3 items-center">
                        <Text variant="displaySmall" className="font-bold text-green-600 mb-1">45</Text>
                        <Text variant="labelSmall" className="text-textSecondary text-center">Resueltos</Text>
                    </Card>
                </View>
            </View>

            <View className="px-5 mb-2">
                <Text variant="titleMedium" className="font-bold text-text">Reportes por Validar</Text>
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <AdminReportCard
                        report={item}
                        onApprove={handleApprove}
                        onReject={handleReject}
                    />
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-10 px-10">
                        <Ionicons name="checkmark-done-circle-outline" size={64} color="#E0E0E0" />
                        <Text className="text-textSecondary text-center mt-4">¡Todo al día! No hay reportes pendientes de validación.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
