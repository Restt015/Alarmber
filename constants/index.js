// Report Status Constants
export const REPORT_STATUS = {
    ACTIVE: 'active',
    INVESTIGATING: 'investigating',
    RESOLVED: 'resolved',
    CLOSED: 'closed'
};

// Report Status Labels (Spanish)
export const REPORT_STATUS_LABELS = {
    active: 'Activo',
    investigating: 'En Investigación',
    resolved: 'Resuelto',
    closed: 'Cerrado'
};

// Report Status Colors
export const REPORT_STATUS_COLORS = {
    active: {
        bg: '#FEE2E2',
        text: '#991B1B',
        border: '#FCA5A5'
    },
    investigating: {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FCD34D'
    },
    resolved: {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#6EE7B7'
    },
    closed: {
        bg: '#E5E7EB',
        text: '#374151',
        border: '#9CA3AF'
    }
};

// Priority Levels
export const PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

// Priority Labels
export const PRIORITY_LABELS = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica'
};

// Priority Colors
export const PRIORITY_COLORS = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626'
};

// User Roles
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin'
};

// Validation Status
export const VALIDATION_STATUS = {
    PENDING: false,
    VALIDATED: true
};

// Validation Labels
export const VALIDATION_LABELS = {
    false: 'Pendiente de Validación',
    true: 'Validado'
};

// Validation Colors
export const VALIDATION_COLORS = {
    false: {
        bg: '#FEF3C7',
        text: '#92400E',
        border: '#FCD34D'
    },
    true: {
        bg: '#D1FAE5',
        text: '#065F46',
        border: '#6EE7B7'
    }
};

// API Base URL
export const API_BASE_URL = __DEV__
    ? 'http://192.168.0.3:5000/api'
    : 'https://tu-backend.com/api';

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
