import { ScrollView, View } from 'react-native';
import ContactCard from '../../components/cards/ContactCard';
import PageHeader from '../../components/shared/PageHeader';
import SectionTitle from '../../components/shared/SectionTitle';

const EMERGENCY_CONTACTS = [
  {
    id: '1',
    title: 'Emergencias Nacionales',
    description: 'Atención inmediata a situaciones de riesgo.',
    phone: '911',
    icon: 'alert-circle',
    color: '#D32F2F'
  },
  {
    id: '2',
    title: 'Denuncia Anónima',
    description: 'Reporta delitos de forma segura y confidencial.',
    phone: '089',
    icon: 'shield-checkmark',
    color: '#1976D2'
  },
  {
    id: '3',
    title: 'Locatel',
    description: 'Búsqueda de personas y servicios informativos.',
    phone: '5658-1111',
    icon: 'search',
    color: '#FBC02D'
  },
  {
    id: '4',
    title: 'Cruz Roja',
    description: 'Atención médica de urgencia y ambulancias.',
    phone: '065',
    icon: 'medkit',
    color: '#C62828'
  },
  {
    id: '5',
    title: 'Bomberos',
    description: 'Incendios, rescates y emergencias mayores.',
    phone: '068',
    icon: 'flame',
    color: '#E64A19'
  }
];

export default function ResourceScreen() {
  return (
    <View className="flex-1 bg-white">
      <PageHeader
        title="Recursos de Ayuda"
        subtitle="Contactos de emergencia y soporte"
      />

      <ScrollView
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <SectionTitle title="Números de Emergencia" />

        {EMERGENCY_CONTACTS.map((contact) => (
          <ContactCard
            key={contact.id}
            {...contact}
          />
        ))}
      </ScrollView>
    </View>
  );
}
