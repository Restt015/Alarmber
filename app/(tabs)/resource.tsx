import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Linking, ScrollView, View } from 'react-native';
import { Button, Card, Text, TextInput, useTheme } from 'react-native-paper';

// Componente SectionTitle
const SectionTitle = ({ title }: { title: string }) => {
  return (
    <View className="px-5 mt-2.5 mb-4">
      <Text variant="titleLarge" className="font-semibold">{title}</Text>
    </View>
  );
};

// Datos de contactos importantes
const importantContacts = [
  {
    id: '1',
    name: 'Emergencias',
    phone: '911',
    icon: 'call' as const,
    color: '#D32F2F',
  },
  {
    id: '2',
    name: 'Policía',
    phone: '066',
    icon: 'shield' as const,
    color: '#0D47A1',
  },
  {
    id: '3',
    name: 'Cruz Roja',
    phone: '065',
    icon: 'medical' as const,
    color: '#D32F2F',
  },
];

export default function ResourceScreen() {
  const theme = useTheme();
  const [anonymousInfo, setAnonymousInfo] = useState({
    name: '',
    location: '',
    description: '',
  });

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleSubmitInfo = () => {
    if (!anonymousInfo.name || !anonymousInfo.location || !anonymousInfo.description) {
      return;
    }
    setAnonymousInfo({ name: '', location: '', description: '' });
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: theme.colors.background }} showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-2.5">
        <Text variant="headlineMedium" className="mb-1.5">Recursos</Text>
        <Text variant="bodyMedium" className="opacity-70">
          Contactos importantes y envío de información
        </Text>
      </View>

      <SectionTitle title="Contactos de Emergencia" />

      {importantContacts.map((contact) => (
        <Card
          key={contact.id}
          className="mx-5 mb-3"
          onPress={() => handleCall(contact.phone)}
          mode="elevated"
        >
          <Card.Content className="flex-row items-center p-4">
            <View className="w-12 h-12 rounded-full justify-center items-center mr-4" style={{ backgroundColor: `${contact.color}20` }}>
              <Ionicons name={contact.icon} size={24} color={contact.color} />
            </View>
            <View className="flex-1">
              <Text variant="titleMedium" className="mb-1 font-semibold">{contact.name}</Text>
              <Text variant="bodySmall" className="opacity-70">{contact.phone}</Text>
            </View>
            <Ionicons name="call" size={20} color={contact.color} />
          </Card.Content>
        </Card>
      ))}

      <SectionTitle title="Enviar Información Anónima" />

      <View className="px-5">
        <TextInput
          label="Nombre de la persona"
          value={anonymousInfo.name}
          onChangeText={(text) => setAnonymousInfo({ ...anonymousInfo, name: text })}
          placeholder="Nombre completo"
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Ubicación"
          value={anonymousInfo.location}
          onChangeText={(text) => setAnonymousInfo({ ...anonymousInfo, location: text })}
          placeholder="¿Dónde viste a esta persona?"
          mode="outlined"
          className="mb-5"
        />

        <TextInput
          label="Descripción"
          value={anonymousInfo.description}
          onChangeText={(text) => setAnonymousInfo({ ...anonymousInfo, description: text })}
          placeholder="Describe lo que viste..."
          mode="outlined"
          multiline
          numberOfLines={4}
          className="mb-5"
        />

        <Button
          mode="contained"
          onPress={handleSubmitInfo}
          className="mt-2.5 mb-4"
          buttonColor={theme.colors.primary}
        >
          Enviar Información
        </Button>

        <Text variant="bodySmall" className="text-center mb-5 opacity-60">
          La información enviada es completamente anónima y será revisada por las autoridades.
        </Text>
      </View>

      <View className="h-5" />
    </ScrollView>
  );
}


