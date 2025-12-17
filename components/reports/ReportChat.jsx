import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import chatService from '../../services/chatService';
import moderationService from '../../services/moderationService';
import MessageItem from './MessageItem';

export default function ReportChat({ reportId, currentUserId, token, highlightMessageId }) {
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [errorBanner, setErrorBanner] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedMessageIds, setSelectedMessageIds] = useState(new Set());
    const flatListRef = useRef(null);

    const { user } = useAuth();
    const isModerator = user && ['moderator', 'admin'].includes(user.role);

    useEffect(() => {
        loadHistory();

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
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 120);
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const addMessage = (newMsg) => {
        setMessages((prev) => {
            if (prev.some((m) => m._id === newMsg._id)) return prev;
            return [...prev, newMsg];
        });
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    };

    const handleMessageDeleted = (payload) => {
        const { messageId } = payload;
        setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? { ...msg, status: 'deleted', moderation: payload } : msg))
        );
    };

    const handleError = (errorMsg) => {
        setErrorBanner(errorMsg);
        setTimeout(() => setErrorBanner(null), 5000);

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
            chatService.send(content);
        } catch (error) {
            console.error('Send error:', error);
            setErrorBanner('Error al enviar mensaje. Verifica tu conexión.');
            setTimeout(() => setErrorBanner(null), 3000);
        } finally {
            setSending(false);
        }
    };

    const handleReportMessage = (message) => {
        if (message.sender._id === currentUserId || message.sender === currentUserId) return;

        Alert.alert('Reportar mensaje', '¿Por qué quieres reportar este mensaje?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Spam', onPress: () => submitReport(message._id, 'spam') },
            { text: 'Ofensivo', onPress: () => submitReport(message._id, 'offensive') },
            { text: 'Acoso', onPress: () => submitReport(message._id, 'harassment') },
            { text: 'Otro', onPress: () => submitReport(message._id, 'other') }
        ]);
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

    const handleLongPress = (message) => {
        if (!isModerator) return handleReportMessage(message);

        if (!selectionMode) {
            setSelectionMode(true);
            toggleSelection(message._id);
        } else {
            toggleSelection(message._id);
        }
    };

    const toggleSelection = (messageId) => {
        setSelectedMessageIds((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) next.delete(messageId);
            else next.add(messageId);
            return next;
        });
    };

    const confirmDelete = (messageIds) => {
        Alert.alert(
            'Confirmar Eliminación',
            `¿Estás seguro de eliminar ${messageIds.length} mensaje(s)? Esta acción dejará un rastro de auditoría.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: () => executeDelete(messageIds) }
            ]
        );
    };

    const executeDelete = async (messageIds) => {
        try {
            await api.post('/mod/actions/delete-messages', {
                reportId,
                messageIds,
                reason: 'Borrado manual por moderador'
            });

            setSelectionMode(false);
            setSelectedMessageIds(new Set());
        } catch (error) {
            console.error('Failed to delete messages:', error);
            Alert.alert('Error', 'No se pudieron eliminar los mensajes.');
        }
    };

    const renderItem = ({ item }) => (
        <MessageItem
            item={item}
            currentUserId={currentUserId}
            selectionMode={selectionMode}
            selectedMessageIds={selectedMessageIds}
            highlightMessageId={highlightMessageId}
            onToggleSelection={toggleSelection}
            onLongPress={handleLongPress}
            isModerator={isModerator}
        />
    );

    const headerTopPadding = (selectionMode ? insets.top : 0) + 8;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top', 'bottom']}>
            {/* Error Banner */}
            {errorBanner && (
                <View
                    style={{
                        backgroundColor: '#FEE2E2',
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: '#FECACA'
                    }}
                >
                    <Text style={{ color: '#991B1B', fontSize: 14, textAlign: 'center' }}>⚠️ {errorBanner}</Text>
                </View>
            )}

            {/* Status Bar OR Selection Header */}
            {selectionMode ? (
                <View
                    style={{
                        backgroundColor: '#1976D2',
                        paddingTop: headerTopPadding,
                        paddingBottom: 12,
                        paddingHorizontal: 14,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 6
                    }}
                >
                    {/* Left: X + count */}
                    <TouchableOpacity
                        onPress={() => {
                            setSelectionMode(false);
                            setSelectedMessageIds(new Set());
                        }}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            borderRadius: 14,
                            backgroundColor: 'rgba(255,255,255,0.18)'
                        }}
                        activeOpacity={0.75}
                    >
                        <Ionicons name="close" size={22} color="#FFFFFF" />
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16, marginLeft: 10 }}>
                            {selectedMessageIds.size}
                        </Text>
                    </TouchableOpacity>

                    {/* Right: Delete */}
                    <TouchableOpacity
                        onPress={() => {
                            if (selectedMessageIds.size > 0) confirmDelete(Array.from(selectedMessageIds));
                        }}
                        disabled={selectedMessageIds.size === 0}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 10,
                            paddingHorizontal: 14,
                            backgroundColor: selectedMessageIds.size > 0 ? '#DC2626' : 'rgba(255,255,255,0.25)',
                            borderRadius: 16
                        }}
                        activeOpacity={0.8}
                    >
                        <Ionicons
                            name="trash-outline"
                            size={18}
                            color={selectedMessageIds.size > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.55)'}
                        />
                        <Text
                            style={{
                                color: selectedMessageIds.size > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                                fontWeight: '800',
                                fontSize: 14,
                                marginLeft: 8
                            }}
                        >
                            Eliminar
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View
                    style={{
                        backgroundColor: '#FFFFFF',
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: '#F3F4F6',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <View
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            marginRight: 8,
                            backgroundColor:
                                connectionStatus === 'connected'
                                    ? '#22C55E'
                                    : connectionStatus === 'connecting'
                                        ? '#EAB308'
                                        : '#EF4444'
                        }}
                    />
                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {connectionStatus === 'connected'
                            ? 'En línea'
                            : connectionStatus === 'connecting'
                                ? 'Conectando...'
                                : 'Desconectado'}
                    </Text>
                </View>
            )}

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#1976D2" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingVertical: 16, paddingBottom: 18 }}
                    inverted={false}
                    onScrollToIndexFailed={(info) => {
                        const wait = new Promise((resolve) => setTimeout(resolve, 500));
                        wait.then(() => flatListRef.current?.scrollToIndex({ index: info.index, animated: true }));
                    }}
                />
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View
                    style={{
                        paddingHorizontal: 12,
                        paddingTop: 10,
                        paddingBottom: Math.max(insets.bottom, 10),
                        backgroundColor: '#FFFFFF',
                        borderTopWidth: 1,
                        borderTopColor: '#F3F4F6',
                        flexDirection: 'row',
                        alignItems: 'flex-end'
                    }}
                >
                    <TextInput
                        style={{
                            flex: 1,
                            backgroundColor: '#F3F4F6',
                            borderRadius: 9999,
                            paddingHorizontal: 16,
                            paddingTop: 10,
                            paddingBottom: 10,
                            marginRight: 10,
                            color: '#1F2937',
                            fontSize: 15,
                            maxHeight: 110
                        }}
                        placeholder={isMuted ? 'Estás silenciado...' : 'Escribe un mensaje...'}
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={1000}
                        editable={!isMuted && connectionStatus === 'connected'}
                    />

                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={!inputText.trim() || connectionStatus !== 'connected' || isMuted || sending}
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: 21,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor:
                                !inputText.trim() || connectionStatus !== 'connected' || isMuted || sending ? '#E5E7EB' : '#1976D2'
                        }}
                        activeOpacity={0.85}
                    >
                        <Ionicons
                            name="send"
                            size={20}
                            color={!inputText.trim() || connectionStatus !== 'connected' || isMuted || sending ? '#999' : '#FFF'}
                            style={{ marginLeft: 2 }}
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
