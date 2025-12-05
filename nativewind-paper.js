import { cssInterop } from 'nativewind';
import { Avatar, Button, Card, FAB, List, Text, TextInput } from 'react-native-paper';

// Habilita el uso de className con NativeWind en componentes de React Native Paper.
cssInterop(Button, { className: 'style' });
cssInterop(Card, { className: 'style' });
cssInterop(Card.Content, { className: 'style' });
cssInterop(Card.Cover, { className: 'style' });
cssInterop(FAB, { className: 'style' });
cssInterop(Text, { className: 'style' });
cssInterop(TextInput, { className: 'style' });
cssInterop(Avatar.Icon, { className: 'style' });
cssInterop(List.Item, { className: 'style' });
cssInterop(List.Icon, { className: 'style' });
