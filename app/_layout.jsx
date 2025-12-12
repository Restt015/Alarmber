import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

import 'react-native-reanimated';

import { useColorScheme } from '../components/useColorScheme';
import { AuthProvider } from '../context/AuthContext';
import '../global.css';
import '../nativewind-paper';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D32F2F',
    secondary: '#121212',
    error: '#D32F2F',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceVariant: '#EEEEEE',
    onSurface: '#212121',
    onSurfaceVariant: '#757575',
    outline: '#E0E0E0',
  },
};

// Component that uses push notifications hook (must be inside NotificationProvider)
// Removed notification logic

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={DefaultTheme}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F5F5F5' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="report/create" options={{ headerShown: false }} />
            <Stack.Screen name="report/success" options={{ headerShown: false }} />
            <Stack.Screen name="news/index" options={{ headerShown: false }} />
            <Stack.Screen name="alert/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
