import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

export default function RoundedButton({
    label,
    onPress,
    loading = false,
    variant = 'primary',
    icon,
    style
}) {
    const bg = variant === 'primary' ? 'bg-red-700' : 'bg-gray-100';
    const text = variant === 'primary' ? 'text-white' : 'text-gray-900';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
            className={`w-full py-3.5 rounded-full items-center justify-center flex-row shadow-sm ${bg}`}
            style={style}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? 'white' : 'black'} />
            ) : (
                <>
                    {icon}
                    <Text className={`text-[16px] font-bold ${text} ${icon ? 'ml-2' : ''}`}>
                        {label}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}
