import { Ionicons } from '@expo/vector-icons';
import { TextInput as RNTextInput, Text, TouchableOpacity, View } from 'react-native';

const CustomInput = ({ label, value, onChangeText, icon, multiline = false, keyboardType = "default", style, containerStyle }) => (
    <View className="mb-5" style={containerStyle}>
        <Text className="text-[13px] font-bold text-gray-700 mb-2 uppercase tracking-wider ml-1">
            {label}
        </Text>
        <View
            className={`flex-row bg-gray-50 border border-gray-200 rounded-2xl px-4 ${multiline ? 'h-[140px] items-start py-4' : 'h-[56px] items-center'}`}
            style={style}
        >
            <Ionicons
                name={icon}
                size={20}
                color="#9E9E9E"
                style={{ marginRight: 12, marginTop: multiline ? 4 : 0 }}
            />
            <RNTextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={`Ingresa ${label.toLowerCase()}`}
                placeholderTextColor="#BDBDBD"
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
                keyboardType={keyboardType}
                className="flex-1 text-[16px] text-gray-900 font-medium h-full"
                style={{
                    textAlignVertical: multiline ? 'top' : 'center',
                }}
            />
        </View>
    </View>
);

const RELATIONSHIP_OPTIONS = [
    { value: 'family', label: 'Familiar', icon: 'people' },
    { value: 'friend', label: 'Amigo/a', icon: 'person' },
    { value: 'partner', label: 'Pareja', icon: 'heart' },
    { value: 'neighbor', label: 'Vecino/a', icon: 'home' },
    { value: 'coworker', label: 'Colega', icon: 'briefcase' },
    { value: 'other', label: 'Otro', icon: 'ellipsis-horizontal' },
];

export default function ReportForm({ formData, setFormData }) {
    return (
        <View>
            {/* Relationship Selector */}
            <View className="mb-6">
                <Text className="text-[13px] font-bold text-gray-700 mb-3 uppercase tracking-wider ml-1">
                    ¿Cuál es tu relación con la persona?
                </Text>
                <View className="flex-row flex-wrap">
                    {RELATIONSHIP_OPTIONS.map((option) => {
                        const isSelected = formData.relationship === option.value;
                        return (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => setFormData({ ...formData, relationship: option.value })}
                                activeOpacity={0.7}
                                className={`flex-row items-center px-4 py-2.5 rounded-full mr-2 mb-2 border ${isSelected
                                        ? 'bg-red-600 border-red-600'
                                        : 'bg-gray-50 border-gray-200'
                                    }`}
                            >
                                <Ionicons
                                    name={option.icon}
                                    size={16}
                                    color={isSelected ? 'white' : '#757575'}
                                />
                                <Text className={`ml-2 font-semibold text-[14px] ${isSelected ? 'text-white' : 'text-gray-600'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <CustomInput
                label="Nombre Completo"
                value={formData.name}
                onChangeText={(t) => setFormData({ ...formData, name: t })}
                icon="person-outline"
            />

            <View className="flex-row justify-between">
                <CustomInput
                    label="Edad"
                    value={formData.age}
                    onChangeText={(t) => setFormData({ ...formData, age: t })}
                    icon="calendar-outline"
                    keyboardType="numeric"
                    containerStyle={{ width: '35%' }}
                />

                <CustomInput
                    label="Última Ubicación"
                    value={formData.lastLocation}
                    onChangeText={(t) => setFormData({ ...formData, lastLocation: t })}
                    icon="location-outline"
                    containerStyle={{ width: '60%' }}
                />
            </View>

            <CustomInput
                label="Descripción Física"
                value={formData.description}
                onChangeText={(t) => setFormData({ ...formData, description: t })}
                icon="body-outline"
                multiline={true}
            />

            <CustomInput
                label="Vestimenta"
                value={formData.clothing}
                onChangeText={(t) => setFormData({ ...formData, clothing: t })}
                icon="shirt-outline"
            />

            <CustomInput
                label="Circunstancias (Opcional)"
                value={formData.circumstances}
                onChangeText={(t) => setFormData({ ...formData, circumstances: t })}
                icon="information-circle-outline"
                multiline={true}
            />
        </View>
    );
}

