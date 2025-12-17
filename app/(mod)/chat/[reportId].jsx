import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import ReportChat from '../../../components/reports/ReportChat';
import { useAuth } from '../../../context/AuthContext';
import modChatsService from '../../../services/modChatsService';

export default function ModChatScreen() {
    const { reportId, highlight } = useLocalSearchParams();
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mark chat as read when opening
        const markRead = async () => {
            try {
                await modChatsService.markChatRead(reportId);
            } catch (error) {
                console.error('Failed to mark chat as read:', error);
            } finally {
                setLoading(false);
            }
        };

        markRead();
    }, [reportId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50">
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text className="text-gray-500 mt-4">Cargando chat...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1">
            <ReportChat
                reportId={reportId}
                currentUserId={user._id}
                token={token}
                highlightMessageId={highlight}
            />
        </View>
    );
}
