import { Text, View } from 'react-native';

export default function StatusBadge({ status }) {
    let bg = "bg-gray-100";
    let text = "text-gray-600";
    let label = status;

    switch (status?.toLowerCase()) {
        case 'urgente':
        case 'critical':
            bg = "bg-red-50";
            text = "text-red-700";
            break;
        case 'en búsqueda':
        case 'active':
            bg = "bg-blue-50";
            text = "text-blue-700";
            break;
        case 'reciente':
        case 'new':
            bg = "bg-green-50";
            text = "text-green-700";
            break;
        case 'pendiente':
            bg = "bg-orange-50";
            text = "text-orange-700";
            break;
        default:
            bg = "bg-gray-100";
            text = "text-gray-600";
    }

    return (
        <View className={`px-2.5 py-1 rounded-md ${bg} self-start`}>
            <Text className={`text-[11px] font-bold uppercase tracking-wide ${text}`}>
                {label}
            </Text>
        </View>
    );
}
