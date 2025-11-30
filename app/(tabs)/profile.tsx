import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, List, Text, useTheme } from 'react-native-paper';

// Componente SectionTitle
const SectionTitle = ({ title }: { title: string }) => {
  return (
    <View className="px-5 mt-2.5 mb-4">
      <Text variant="titleLarge" className="font-semibold">{title}</Text>
    </View>
  );
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [reportsCount] = useState(3); // Mock: contador de reportes enviados

  const handlePrivacy = () => {
    // Alert.alert('Privacidad', 'Configuración de privacidad');
  };

  const handleDeleteData = () => {
    // Alert.alert(
    //   'Eliminar Datos',
    //   '¿Estás seguro de que deseas eliminar todos tus datos? Esta acción no se puede deshacer.',
    //   [
    //     { text: 'Cancelar', style: 'cancel' },
    //     {
    //       text: 'Eliminar',
    //       style: 'destructive',
    //       onPress: () => Alert.alert('Datos eliminados', 'Tus datos han sido eliminados.'),
    //     },
    //   ]
    // );
  };

  const handleAbout = () => {
    // Alert.alert('Acerca de', 'Alerta Ciudadana v1.0.0\n\nApp de reportes de personas desaparecidas.');
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <View className="items-center py-8 px-5">
        <Avatar.Icon
          size={100}
          icon="account"
          className="mb-4"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />
        <Text variant="headlineSmall" className="mb-1.5">Usuario</Text>
        <Text variant="bodyMedium" className="opacity-70">usuario@ejemplo.com</Text>
      </View>

      <View className="flex-row justify-center px-5 mb-5">
        <Card className="min-w-[150px]">
          <Card.Content className="items-center">
            <Text variant="displaySmall" className="mb-1.5 font-bold" style={{ color: theme.colors.primary }}>
              {reportsCount}
            </Text>
            <Text variant="bodySmall" className="opacity-70">Reportes Enviados</Text>
          </Card.Content>
        </Card>
      </View>

      <SectionTitle title="Configuración" />

      <List.Item
        title="Privacidad"
        left={(props) => <List.Icon {...props} icon="shield-check" color={theme.colors.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handlePrivacy}
        className="mx-5 mb-2.5"
      />

      <List.Item
        title="Eliminar Datos"
        left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleDeleteData}
        className="mx-5 mb-2.5"
        titleStyle={{ color: theme.colors.error }}
      />

      <List.Item
        title="Acerca de"
        left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleAbout}
        className="mx-5 mb-2.5"
      />

      <View className="h-5" />
    </ScrollView>
  );
}


