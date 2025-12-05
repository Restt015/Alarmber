import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

export default function PasswordRequirements({ password }) {
    const requirements = [
        { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
        { label: "Al menos un número", valid: /\d/.test(password) },
    ];

    return (
        <View className="flex-row flex-wrap gap-3">
            {requirements.map((req, index) => (
                <View key={index} className="flex-row items-center">
                    <Ionicons
                        name={req.valid ? "checkmark-circle" : "ellipse-outline"}
                        size={14}
                        color={req.valid ? "#4CAF50" : "#BDBDBD"}
                    />
                    <Text className={`ml-1.5 text-[12px] ${req.valid ? 'text-green-700' : 'text-gray-400'}`}>
                        {req.label}
                    </Text>
                </View>
            ))}
        </View>
    );
}
