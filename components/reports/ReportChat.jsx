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
                case 'error':
                    // alert('Chat Error: ' + event.payload);
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
            alert('Error al enviar mensaje. Verifica tu conexión.');
        } finally {
            setSending(false);
        }
    };

    const renderMessage = ({ item }) => {
        const isOwn = item.sender._id === currentUserId || item.sender === currentUserId;

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

                <View
                    className={`px-4 py-2.5 rounded-2xl max-w-[75%] ${isOwn
                        ? 'bg-[#1976D2] rounded-tr-none'
                        : 'bg-white border border-gray-100 rounded-tl-none shadow-sm'
                        }`}
                >
                    {!isOwn && (
                        <Text className="text-[11px] text-gray-500 mb-1 font-semibold">
                            {item.sender.name || 'Usuario'}
                        </Text>
                    )}
                    <Text className={`text-[15px] ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                        {item.content}
                    </Text>
                    <Text className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-400'}`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
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
                        placeholder="Escribe un mensaje..."
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!inputText.trim() || connectionStatus !== 'connected'}
                        className={`w-10 h-10 rounded-full items-center justify-center ${!inputText.trim() || connectionStatus !== 'connected'
                            ? 'bg-gray-200'
                            : 'bg-[#1976D2]'
                            }`}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={!inputText.trim() || connectionStatus !== 'connected' ? '#999' : 'white'}
                            style={{ marginLeft: 2 }}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
