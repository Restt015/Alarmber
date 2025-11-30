import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Avatar, Card, List, Text, useTheme } from 'react-native-paper';

const SectionTitle = ({ title }) => {
  return (
    <View className="px-5 mt-2.5 mb-4">
      <Text variant="titleLarge" className="font-semibold text-white">
        {title}
      </Text>
    </View>
  );
};

export default function ProfileScreen() {
  const theme = useTheme();
  const [reportsCount] = useState(3);

  const handlePrivacy = () => {};
  const handleDeleteData = () => {};
  const handleAbout = () => {};

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      <View className="items-center py-8 px-5">
        <Avatar.Icon
          size={100}
          icon="account"
          className="mb-4 bg-surface"
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />
        <Text variant="headlineSmall" className="mb-1.5 text-white">
          Usuario
        </Text>
        <Text variant="bodyMedium" className="text-muted">
          usuario@ejemplo.com
        </Text>
      </View>

      <View className="flex-row justify-center px-5 mb-5">
        <Card className="min-w-[150px] bg-surface border border-surfaceMuted">
          <Card.Content className="items-center">
            <Text variant="displaySmall" className="mb-1.5 font-bold" style={{ color: theme.colors.primary }}>
              {reportsCount}
            </Text>
            <Text variant="bodySmall" className="text-muted">
              Reportes Enviados
            </Text>
          </Card.Content>
        </Card>
      </View>

      <SectionTitle title="Configuración" />

      <List.Item
        title="Privacidad"
        left={(props) => <List.Icon {...props} icon="shield-check" color={theme.colors.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handlePrivacy}
        className="mx-5 mb-2.5 bg-surface rounded-xl border border-surfaceMuted"
        titleStyle={{ color: theme.colors.onSurface }}
      />

      <List.Item
        title="Eliminar Datos"
        left={(props) => <List.Icon {...props} icon="delete" color={theme.colors.error} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleDeleteData}
        className="mx-5 mb-2.5 bg-surface rounded-xl border border-surfaceMuted"
        titleStyle={{ color: theme.colors.error }}
      />

      <List.Item
        title="Acerca de"
        left={(props) => <List.Icon {...props} icon="information" color={theme.colors.primary} />}
        right={(props) => <List.Icon {...props} icon="chevron-right" />}
        onPress={handleAbout}
        className="mx-5 mb-2.5 bg-surface rounded-xl border border-surfaceMuted"
        titleStyle={{ color: theme.colors.onSurface }}
      />

      <View className="h-5" />
    </ScrollView>
  );
}
