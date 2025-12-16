import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

/**
 * Badge that shows "Tu reporte" when the user is the owner of a report
 */
export default function OwnershipBadge({ isOwner, size = 'normal' }) {
    if (!isOwner) return null;

    const isSmall = size === 'small';

    return (
        <View
            className={`flex-row items-center bg-blue-50 border border-blue-200 rounded-full ${isSmall ? 'px-2 py-0.5' : 'px-3 py-1'}`}
        >
            <Ionicons
                name="checkmark-circle"
                size={isSmall ? 12 : 14}
                color="#1976D2"
            />
            <Text className={`text-blue-700 font-bold ml-1 ${isSmall ? 'text-[10px]' : 'text-[11px]'}`}>
                Tu reporte
            </Text>
        </View>
    );
}
