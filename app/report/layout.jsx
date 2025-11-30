import { Stack } from 'expo-router';

export default function ReportLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#121212',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="create"
        options={{
          title: 'Crear Reporte',
        }}
      />
      <Stack.Screen
        name="success"
        options={{
          title: 'Reporte Enviado',
          headerLeft: () => null,
        }}
      />
    </Stack>
  );
}

