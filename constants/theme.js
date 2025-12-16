// ALARMBER Design System Tokens
// ================================
// This is the single source of truth for all visual design tokens.
// Import this file in components to maintain consistency.

export const theme = {
    // =====================
    // COLOR PALETTE
    // =====================
    colors: {
        // Primary - Red (Alert/Urgency)
        primary: {
            main: '#D32F2F',      // Main red for alerts and CTAs
            light: '#FFEBEE',     // Light red background
            dark: '#B71C1C',      // Dark red for emphasis
            darker: '#121212',    // Almost black for gradients
        },

        // Secondary - Blue (Information)
        secondary: {
            main: '#1976D2',
            light: '#E3F2FD',
            dark: '#0D47A1',
        },

        // Success - Green (Validated/Resolved)
        success: {
            main: '#4CAF50',
            light: '#E8F5E9',
            dark: '#2E7D32',
        },

        // Warning - Orange (Caution)
        warning: {
            main: '#FF9800',
            light: '#FFF3E0',
            dark: '#E65100',
        },

        // Gray Scale
        gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            300: '#E0E0E0',
            400: '#BDBDBD',
            500: '#9E9E9E',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },

        // Base colors
        black: '#212121',
        white: '#FFFFFF',
        background: '#F5F5F5',
    },

    // =====================
    // GRADIENTS
    // =====================
    gradient: {
        // Official ALARMBER gradient (Login, Headers)
        official: ['#D32F2F', '#B71C1C', '#121212'],

        // Header gradient (shorter)
        header: ['#D32F2F', '#C62828'],

        // Success gradient
        success: ['#43A047', '#2E7D32'],

        // Dark overlay
        overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)'],
    },

    // =====================
    // REPORT STATUS COLORS
    // =====================
    status: {
        active: {
            bg: '#FFEBEE',
            text: '#D32F2F',
            icon: '#D32F2F',
            border: '#FFCDD2',
        },
        investigating: {
            bg: '#FFF3E0',
            text: '#E65100',
            icon: '#FF9800',
            border: '#FFE0B2',
        },
        resolved: {
            bg: '#E8F5E9',
            text: '#2E7D32',
            icon: '#4CAF50',
            border: '#C8E6C9',
        },
        closed: {
            bg: '#EEEEEE',
            text: '#757575',
            icon: '#9E9E9E',
            border: '#E0E0E0',
        },
    },

    // =====================
    // USER ACTIVITY STATUS
    // =====================
    activity: {
        online: {
            dot: '#4CAF50',
            text: '#4CAF50',
            label: 'En línea',
        },
        recent: {
            dot: '#9E9E9E',
            text: '#757575',
        },
        offline: {
            dot: '#BDBDBD',
            text: '#9E9E9E',
        },
    },

    // =====================
    // SPACING
    // =====================
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
        '4xl': 40,
    },

    // =====================
    // TYPOGRAPHY
    // =====================
    typography: {
        // Display - Large titles
        display: {
            fontSize: 32,
            fontWeight: '900',
            letterSpacing: -0.5,
        },

        // Headings
        h1: {
            fontSize: 28,
            fontWeight: '900',
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700',
            letterSpacing: -0.3,
        },
        h3: {
            fontSize: 20,
            fontWeight: '700',
        },
        h4: {
            fontSize: 16,
            fontWeight: '600',
        },

        // Body text
        bodyLarge: {
            fontSize: 16,
            fontWeight: '400',
            lineHeight: 24,
        },
        bodyMedium: {
            fontSize: 14,
            fontWeight: '400',
            lineHeight: 20,
        },
        bodySmall: {
            fontSize: 12,
            fontWeight: '500',
            lineHeight: 16,
        },

        // UI elements
        caption: {
            fontSize: 11,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
        },
        button: {
            fontSize: 15,
            fontWeight: '700',
        },

        // Numbers
        statsNumber: {
            fontSize: 24,
            fontWeight: '900',
        },
    },

    // =====================
    // SHADOWS
    // =====================
    shadows: {
        none: {
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
        },
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 4,
        },
        // Card shadow
        card: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
        },
    },

    // =====================
    // BORDER RADIUS
    // =====================
    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        full: 999,
    },
};

// =====================
// HELPER FUNCTIONS
// =====================

/**
 * Get status color scheme
 * @param {string} status - 'active' | 'investigating' | 'resolved' | 'closed'
 */
export const getStatusColors = (status) => {
    return theme.status[status] || theme.status.closed;
};

/**
 * Get activity status color scheme
 * @param {string} status - 'online' | 'recent' | 'offline'
 */
export const getActivityColors = (status) => {
    return theme.activity[status] || theme.activity.offline;
};

export default theme;
