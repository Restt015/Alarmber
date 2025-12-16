import { Text, View } from 'react-native';
import { getStatusColors, theme } from '../../constants/theme';

// Status label translations
const STATUS_LABELS = {
    active: 'Activo',
    investigating: 'En Búsqueda',
    resolved: 'Resuelto',
    closed: 'Cerrado',
    critical: 'Urgente',
    new: 'Nuevo',
    pending: 'Pendiente',
};

export default function StatusBadge({ status }) {
    // Normalize status to lowercase
    const normalizedStatus = status?.toLowerCase() || 'closed';

    // Map various status names to theme keys
    let themeKey = 'closed';
    switch (normalizedStatus) {
        case 'active':
        case 'urgente':
        case 'critical':
        case 'nuevo':
            themeKey = 'active';
            break;
        case 'investigating':
        case 'en búsqueda':
        case 'en busqueda':
        case 'buscando':
            themeKey = 'investigating';
            break;
        case 'resolved':
        case 'resuelto':
        case 'encontrado':
        case 'new':
        case 'reciente':
            themeKey = 'resolved';
            break;
        case 'closed':
        case 'cerrado':
        case 'pendiente':
        default:
            themeKey = 'closed';
    }

    // Get colors from theme
    const colors = getStatusColors(themeKey);

    // Get display label
    const label = STATUS_LABELS[normalizedStatus] || status || 'Desconocido';

    return (
        <View
            style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                borderWidth: 1,
                paddingHorizontal: theme.spacing.sm + 2,
                paddingVertical: theme.spacing.xs,
                borderRadius: theme.borderRadius.sm,
                alignSelf: 'flex-start',
            }}
        >
            <Text
                style={{
                    color: colors.text,
                    fontSize: 11,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                }}
            >
                {label}
            </Text>
        </View>
    );
}
