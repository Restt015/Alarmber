import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { VALIDATION_COLORS, VALIDATION_LABELS } from '../../constants';

export default function ValidationBadge({ validated, size = 'medium' }) {
    const colors = VALIDATION_COLORS[validated] || VALIDATION_COLORS[false];
    const label = VALIDATION_LABELS[validated] || 'Pendiente';

    const sizeClasses = {
        small: 'px-2 py-0.5',
        medium: 'px-3 py-1',
        large: 'px-4 py-1.5'
    };

    const textSizeClasses = {
        small: 'text-[10px]',
        medium: 'text-[12px]',
        large: 'text-[14px]'
    };

    const iconSizes = {
        small: 12,
        medium: 14,
        large: 16
    };

    return (
        <View
            className={`${sizeClasses[size]} rounded-full flex-row items-center`}
            style={{
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border
            }}
        >
            <Ionicons
                name={validated ? 'checkmark-circle' : 'time'}
                size={iconSizes[size]}
                color={colors.text}
                style={{ marginRight: 4 }}
            />
            <Text
                className={`${textSizeClasses[size]} font-bold uppercase tracking-wide`}
                style={{ color: colors.text }}
            >
                {label}
            </Text>
        </View>
    );
}
