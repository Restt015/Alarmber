import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';
import chatService from '../../services/chatService';

export default function ReportChat({ reportId, currentUserId, token }) {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [errorBanner, setErrorBanner] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const flatListRef = useRef(null);

    // Initial Load & Connect
    useEffect(() => {
        loadHistory();

        // Subscribe to real-time events
        const unsubscribe = chatService.subscribe((event) => {
            switch (event.type) {
                case 'connected':
                    setConnectionStatus('connected');
                    break;
                case 'disconnected':
                    setConnectionStatus('disconnected');
                    break;
                case 'connecting':
                    setConnectionStatus('connecting');
                    break;
                case 'message':
                    addMessage(event.payload);
                    break;
                case 'message:deleted':
                    handleMessageDeleted(event.payload);
                    break;
                case 'error':
                    handleError(event.payload);
                    break;
            }
        });

        // Initialize connection
        chatService.connect(reportId, token);

        return () => {
            unsubscribe();
            chatService.disconnect();
        };
    }, [reportId, token]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await api.get(`/reports/${reportId}/messages?limit=50`);
            if (data.success) {
                setMessages(data.data);
                // Scroll to bottom after loading
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const addMessage = (newMsg) => {
        setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
        });
        // Scroll to bottom on new message
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    };

    const handleMessageDeleted = (payload) => {
        const { messageId } = payload;
        setMessages(prev => prev.map(msg =>
            msg._id === messageId
                ? { ...msg, status: 'deleted', moderation: payload }
                : msg
        ));
    };

    const handleError = (errorMsg) => {
        setErrorBanner(errorMsg);
        setTimeout(() => setErrorBanner(null), 5000);

        // Check if it's a mute error
        if (errorMsg && errorMsg.includes('silenciado')) {
            setIsMuted(true);
            setTimeout(() => setIsMuted(false), 60000);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const content = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            // Send via WS
            chatService.send(content);
            // We rely on the server broadcasting it back to us ('message:new') 
            // to add it to the list, confirming receipt. 
            // Alternatively, we could optimistically add it here.
        } catch (error) {
            console.error('Send error:', error);
            setErrorBanner('Error al enviar mensaje. Verifica tu conexión.');
            setTimeout(() => setErrorBanner(null), 3000);
        } finally {
            setSending(false);
        }
    };

    const handleReportMessage = (message) => {
        if (message.sender._id === currentUserId || message.sender === currentUserId) {
            return; // Can't report own messages
        }

        Alert.alert(
            'Reportar mensaje',
            '¿Por qué quieres reportar este mensaje?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Spam',
                    onPress: () => submitReport(message._id, 'spam')
                },
                {
                    text: 'Ofensivo',
                    onPress: () => submitReport(message._id, 'offensive')
                },
                {
                    text: 'Acoso',
                    onPress: () => submitReport(message._id, 'harassment')
                },
                {
                    text: 'Otro',
                    onPress: () => submitReport(message._id, 'other')
                }
            ]
        );
    };

    const submitReport = async (messageId, reason) => {
        try {
            await moderationService.reportMessage(messageId, reportId, reason);
            Alert.alert('✅ Reportado', 'Los moderadores revisarán este mensaje.');
        } catch (error) {
            console.error('Failed to report message:', error);
            Alert.alert('Error', 'No se pudo reportar el mensaje. Inténtalo de nuevo.');
        }
    };

    const renderMessage = ({ item }) => {
        const isOwn = item.sender._id === currentUserId || item.sender === currentUserId;
        const isDeleted = item.status === 'deleted';
        const isModerator = ['moderator', 'admin'].includes(item.senderRole);

        // Deleted message placeholder
        if (isDeleted) {
            return (
                <View className="mb-3 items-center">
                    <View className="bg-gray-200 px-4 py-2 rounded-lg">
                        <Text className="text-gray-500 text-xs italic">
                            🚫 Mensaje eliminado por moderación
                        </Text>
                    </View>
                </View>
            );
        }

        return (
            <View className={`mb-3 flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
                {!isOwn && (
                    <View className="mr-2 justify-end">
                        {/* Avatar placeholder or image */}
                        <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center overflow-hidden">
                            <Ionicons name="person" size={16} color="#666" />
                        </View>
                    </View>
                )}

                <TouchableOpacity
                    onLongPress={() => handleReportMessage(item)}
                    activeOpacity={0.8}
                    className={`px-4 py-2.5 rounded-2xl max-w-[75%] ${isOwn
                        ? 'bg-[#1976D2] rounded-tr-none'
                        : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                        }`}
                >
                    {!isOwn && (
                        <View className="flex-row items-center mb-1">
                            <Text className="text-[11px] text-gray-500 font-semibold">
                                {item.sender.name || 'Usuario'}
                            </Text>
                            {isModerator && (
                                <View className="ml-2 px-1.5 py-0.5 rounded bg-red-600">
                                    <Text className="text-white text-[10px] font-bold">
                                        {item.senderRole === 'admin' ? 'ADMIN' : 'MOD'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                    <Text className={`text-[15px] ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                        {item.content}
                    </Text>
                    <Text className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Error Banner */}
            {errorBanner && (
                <View className="bg-red-100 px-4 py-3 border-b border-red-200">
                    <Text className="text-red-800 text-sm text-center">
                        ⚠️ {errorBanner}
                    </Text>
                </View>
            )}

            {/* Status Bar */}
            <View className="bg-white px-4 py-2 border-b border-gray-100 flex-row items-center justify-center">
                <View className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                <Text className="text-xs text-gray-500">
                    {connectionStatus === 'connected' ? 'En línea' :
                        connectionStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
                </Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item._id}
                    renderItem={renderMessage}
                    contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Text className="text-gray-400">No hay mensajes aún. ¡Di hola!</Text>
                        </View>
                    }
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
            >
                <View className="p-3 bg-white border-t border-gray-100 flex-row items-center">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2.5 mr-3 text-gray-800 text-[15px] max-h-24"
                        placeholder={isMuted ? "Estás silenciado..." : "Escribe un mensaje..."}
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        editable={!isMuted && connectionStatus === 'connected'}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!inputText.trim() || connectionStatus !== 'connected' || isMuted}
                        className={`w-10 h-10 rounded-full items-center justify-center ${!inputText.trim() || connectionStatus !== 'connected' || isMuted
                            ? 'bg-gray-200'
                            : 'bg-[#1976D2]'
                            }`}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={!inputText.trim() || connectionStatus !== 'connected' || isMuted ? '#999' : 'white'}
                            style={{ marginLeft: 2 }}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
