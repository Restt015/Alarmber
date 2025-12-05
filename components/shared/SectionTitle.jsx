import { Text, View } from 'react-native';

export default function SectionTitle({ title, subtitle, rightAction }) {
    return (
        <View className="flex-row justify-between items-end mb-4 px-1">
            <View>
                <Text className="text-[18px] font-bold text-gray-900 tracking-tight">
                    {title}
                </Text>
                {subtitle && (
                    <Text className="text-[13px] text-gray-500 mt-0.5">
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightAction}
        </View>
    );
}
