import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import reportService from '../../services/reportService';

export default function MyReportsModal({ visible, onClose }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentFilter, setCurrentFilter] = useState('all');

    useEffect(() => {
        if (visible) loadMyReports();
    }, [visible]);

    const loadMyReports = async () => {
        try {
            setLoading(true);
            const response = await reportService.getMyReports();
            setReports(response.data || []);
        } catch (error) {
            console.error('❌ Error loading my reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filters = {
        all: reports,
        active: reports.filter(r => r.validated && (r.status === 'active' || r.status === 'investigating')),
        finished: reports.filter(r => r.status === 'resolved' || r.status === 'closed'),
    };

    const filteredReports = filters[currentFilter];

    const stats = {
        all: reports.length,
        active: filters.active.length,
        finished: filters.finished.length,
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getBorderColor = (report) => {
        if (!report.validated) return '#FFB74D'; 
        if (report.status === 'active') return '#E53935';
        if (report.status === 'investigating') return '#FB8C00';
        if (report.status === 'resolved') return '#43A047';
        if (report.status === 'closed') return '#9E9E9E';
        return '#1976D2';
    };

    const getStatusText = (r) => {
        if (!r.validated) return 'Pendiente validación';
        return r.status === 'active' ? 'Activo'
            : r.status === 'investigating' ? 'En búsqueda'
            : r.status === 'resolved' ? 'Resuelto'
            : 'Cerrado';
    };

    const ReportCard = ({ report }) => (
        <TouchableOpacity
            onPress={() => {
                onClose();
                router.push(`/alert/${report._id}`);
            }}
            activeOpacity={0.75}
            className="bg-white rounded-3xl mb-4"
            style={{
                ...styles.card,
                borderLeftWidth: 4,
                borderLeftColor: getBorderColor(report),
            }}
        >
            <View className="flex-row p-4">
                {/* IMAGE */}
                <View className="w-[72px] h-[72px] bg-gray-100 rounded-2xl overflow-hidden mr-4">
                    {report.photo ? (
                        <Image
                            source={{
                                uri: report.photo.startsWith('http')
                                    ? report.photo
                                    : `http://192.168.0.3:5000/${report.photo.replace(/\\/g, '/')}`
                            }}
                            className="w-full h-full"
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center bg-gray-200">
                            <Ionicons name="person-outline" size={34} color="#BDBDBD" />
                        </View>
                    )}
                </View>

                {/* INFO */}
                <View className="flex-1 justify-center">
                    <Text className="text-[16px] font-semibold text-gray-900" numberOfLines={1}>
                        {report.name}
                    </Text>

                    <Text className="text-gray-400 text-[12px] mb-2">
                        Reporte #{report._id?.slice(-6)}
                    </Text>

                    <Text className="text-[13px] font-semibold text-gray-600">
                        {getStatusText(report)}
                    </Text>

                    <Text className="text-gray-500 text-[11px] mt-1">
                        Creado: {formatDate(report.createdAt)}
                    </Text>
                </View>

                {/* ARROW */}
                <View className="justify-center pl-2">
                    <Ionicons name="chevron-forward" size={20} color="#C0C0C0" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView className="flex-1 bg-[#F7F7F7]">

                {/* TOP BAR / HANDLE */}
                <View className="items-center py-3 bg-white border-b border-gray-100">
                    <View className="w-10 h-1.5 rounded-full bg-gray-300" />
                </View>

                {/* HEADER */}
                <View className="bg-white px-5 pt-1 pb-4 border-b border-gray-100">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-[24px] font-bold text-gray-900">Mis Reportes</Text>
                            <Text className="text-gray-500 text-[12px] mt-1">
                                {stats.all} en total — {stats.active} activos
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={onClose}
                            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
                            activeOpacity={0.7}
                            style={styles.closeButtonShadow}
                        >
                            <Ionicons name="close" size={22} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* FILTER TABS */}
                <View className="bg-white px-5 py-3 border-b border-gray-100">
                    <View className="bg-gray-100 rounded-full p-1 flex-row">

                        {/* TAB COMPONENT */}
                        {['all', 'active', 'finished'].map((f) => (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setCurrentFilter(f)}
                                className={`flex-1 py-2 rounded-full ${
                                    currentFilter === f ? 'bg-white' : ''
                                }`}
                                activeOpacity={0.7}
                                style={currentFilter === f ? styles.activeTabShadow : {}}
                            >
                                <Text
                                    className={`text-center font-semibold text-[13px] ${
                                        currentFilter === f ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                >
                                    {f === 'all' && `Todos (${stats.all})`}
                                    {f === 'active' && `Activos (${stats.active})`}
                                    {f === 'finished' && `Finalizados (${stats.finished})`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* CONTENT */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#000" />
                        <Text className="text-gray-500 mt-3">Cargando...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={filteredReports}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View className="px-5">
                                <ReportCard report={item} />
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingTop: 15,
                            paddingBottom: 40,
                            flexGrow: filteredReports.length === 0 ? 1 : 0
                        }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center px-6">
                                <Ionicons name="document-text-outline" size={40} color="#C7C7C7" />

                                <Text className="mt-4 text-[18px] font-bold text-gray-900">
                                    {currentFilter === 'all' && 'Sin reportes'}
                                    {currentFilter === 'active' && 'No hay reportes activos'}
                                    {currentFilter === 'finished' && 'No hay finalizados'}
                                </Text>

                                <Text className="text-gray-500 text-[13px] mt-2 text-center leading-5">
                                    {currentFilter === 'all' &&
                                        'Crea tu primer reporte con el botón "+" en el menú inferior.'}
                                </Text>
                            </View>
                        }
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    card: {
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    activeTabShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 1 },
        elevation: 3,
    },
    closeButtonShadow: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
});
