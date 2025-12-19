import { Ionicons } from '@expo/vector-icons';
import { Modal, Platform, Text, TouchableOpacity, View } from 'react-native';

/**
 * Custom Alert component compatible with web, iOS, and Android
 * Replacement for React Native's Alert which doesn't work on web
 */
export default function CustomAlert({
    visible,
    title,
    message,
    buttons = [],
    onDismiss
}) {
    if (!visible) return null;

    const handleButtonPress = (button) => {
        if (button.onPress) {
            button.onPress();
        }
        if (onDismiss) {
            onDismiss();
        }
    };

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onDismiss}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                    {/* Header */}
                    <View className="bg-red-600 px-6 py-4 flex-row items-center">
                        <Ionicons name="alert-circle" size={24} color="white" />
                        <Text className="text-white text-[18px] font-bold ml-3">
                            {title}
                        </Text>
                    </View>

                    {/* Message */}
                    <View className="px-6 py-6">
                        <Text className="text-gray-700 text-[15px] leading-6">
                            {message}
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View className="border-t border-gray-200 flex-row">
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleButtonPress(button)}
                                className={`flex-1 py-4 items-center justify-center ${index > 0 ? 'border-l border-gray-200' : ''
                                    } ${button.style === 'destructive' ? 'bg-red-50' : ''}`}
                                style={{
                                    ...(Platform.OS === 'web' && {
                                        cursor: 'pointer'
                                    })
                                }}
                            >
                                <Text
                                    className={`text-[15px] font-bold ${button.style === 'cancel'
                                            ? 'text-gray-500'
                                            : button.style === 'destructive'
                                                ? 'text-red-600'
                                                : 'text-red-600'
                                        }`}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

/**
 * Hook to use CustomAlert similar to Alert.alert()
 */
export function useCustomAlert() {
    const [alertConfig, setAlertConfig] = React.useState({
        visible: false,
        title: '',
        message: '',
        buttons: []
    });

    const showAlert = (title, message, buttons = [{ text: 'OK' }]) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            buttons
        });
    };

    const hideAlert = () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
    };

    const AlertComponent = () => (
        <CustomAlert
            visible={alertConfig.visible}
            title={alertConfig.title}
            message={alertConfig.message}
            buttons={alertConfig.buttons}
            onDismiss={hideAlert}
        />
    );

    return { showAlert, AlertComponent };
}
