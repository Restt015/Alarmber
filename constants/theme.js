// Design System Tokens
export const theme = {
    colors: {
        primary: {
            main: '#D32F2F',
            light: '#FFEBEE',
            dark: '#B71C1C',
        },
        secondary: {
            main: '#1976D2',
            light: '#E3F2FD',
            dark: '#0D47A1',
        },
        success: {
            main: '#4CAF50',
            light: '#E8F5E9',
        },
        warning: {
            main: '#FF9800',
            light: '#FFF3E0',
        },
        gray: {
            50: '#FAFAFA',
            100: '#F5F5F5',
            200: '#EEEEEE',
            400: '#BDBDBD',
            600: '#757575',
            900: '#424242',
        },
        black: '#212121',
        white: '#FFFFFF',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        '2xl': 24,
        '3xl': 32,
    },

    typography: {
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
        caption: {
            fontSize: 11,
            fontWeight: '500',
            textTransform: 'uppercase',
        },
        label: {
            fontSize: 13,
            fontWeight: '600',
        },
        displayNumber: {
            fontSize: 32,
            fontWeight: '900',
        },
        statsNumber: {
            fontSize: 24,
            fontWeight: '900',
        },
    },

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
    },

    borderRadius: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        full: 999,
    },
};
