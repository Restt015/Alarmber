import { Text, View } from 'react-native';
import { REPORT_STATUS_COLORS, REPORT_STATUS_LABELS } from '../../constants';

export default function ReportStatusBadge({ status, size = 'medium' }) {
    const colors = REPORT_STATUS_COLORS[status] || REPORT_STATUS_COLORS.active;
    const label = REPORT_STATUS_LABELS[status] || status;

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

    return (
        <View
            className={`${sizeClasses[size]} rounded-full`}
            style={{
                backgroundColor: colors.bg,
                borderWidth: 1,
                borderColor: colors.border
            }}
        >
            <Text
                className={`${textSizeClasses[size]} font-bold uppercase tracking-wide`}
                style={{ color: colors.text }}
            >
                {label}
            </Text>
        </View>
    );
}
