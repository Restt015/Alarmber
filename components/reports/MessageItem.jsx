import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import api from '../../services/api';

const getImageUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${api.defaults.baseURL}/uploads/${path}`;
};

const SelectionCheckbox = ({ isSelected, onPress }) => (
    <TouchableOpacity
        onPress={onPress}
        style={{ marginRight: 12, justifyContent: 'center' }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
        <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected ? '#3B82F6' : '#FFFFFF',
            borderColor: isSelected ? '#3B82F6' : '#D1D5DB'
        }}>
            {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
        </View>
    </TouchableOpacity>
);

const MessageItem = ({
    item,
    currentUserId,
    selectionMode,
    selectedMessageIds,
    highlightMessageId,
    onToggleSelection,
    onLongPress,
    isModerator = false  // New prop to determine visibility of deleted messages
}) => {
    // Safely compare ObjectIds using string conversion
    const itemSenderId = item.sender?._id || item.sender;
    const isMine = String(itemSenderId) === String(currentUserId);
    const isDeleted = item.status === 'deleted';
    const isSystem = item.type === 'system';
    const isHighlighted = item._id === highlightMessageId;
    const isSelected = selectedMessageIds.has(item._id);

    // System message
    if (isSystem) {
        return (
            <View style={{ alignItems: 'center', marginVertical: 8, paddingHorizontal: 16 }}>
                <Text style={{
                    fontSize: 12,
                    color: '#6B7280',
                    textAlign: 'center',
                    backgroundColor: '#F3F4F6',
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 9999
                }}>
                    {item.content}
                </Text>
            </View>
        );
    }

    // Deleted message handling
    if (isDeleted) {
        // For regular users: completely hide deleted messages (no placeholder, no space)
        if (!isModerator) {
            return null;
        }

        // For moderators: show subtle indicator for audit trail
        return (
            <View style={{
                marginVertical: 4,
                paddingHorizontal: 16,
                alignItems: 'center'
            }}>
                <View style={{
                    backgroundColor: '#FEE2E2',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}>
                    <Text style={{ color: '#DC2626', fontSize: 11, fontWeight: '500' }}>
                        🗑️ Mensaje eliminado
                    </Text>
                </View>
            </View>
        );
    }


    return (
        <View style={{
            flexDirection: 'row',
            marginBottom: 12,
            paddingHorizontal: 16,
            justifyContent: selectionMode ? 'flex-start' : (isMine ? 'flex-end' : 'flex-start')
        }}>
            {selectionMode && (
                <SelectionCheckbox
                    isSelected={isSelected}
                    onPress={() => onToggleSelection(item._id)}
                />
            )}

            {!isMine && !selectionMode && (
                <View style={{ marginRight: 8, justifyContent: 'flex-end' }}>
                    {item.sender?.profileImage ? (
                        <Image
                            source={{ uri: getImageUrl(item.sender.profileImage) }}
                            style={{ width: 32, height: 32, borderRadius: 16 }}
                        />
                    ) : (
                        <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#D1D5DB',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#4B5563' }}>
                                {item.sender?.name?.charAt(0) || '?'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            <TouchableOpacity
                onLongPress={() => onLongPress(item)}
                onPress={() => {
                    if (selectionMode) onToggleSelection(item._id);
                }}
                delayLongPress={200}
                activeOpacity={0.8}
                style={{
                    maxWidth: selectionMode ? '85%' : '80%',
                    padding: 12,
                    borderRadius: 16,
                    backgroundColor: isSelected ? '#EFF6FF' : (isMine ? '#3B82F6' : '#FFFFFF'),
                    borderWidth: isSelected ? 1 : (isMine ? 0 : 1),
                    borderColor: isSelected ? '#93C5FD' : (isHighlighted ? '#EF4444' : '#F3F4F6'),
                    borderTopRightRadius: isMine ? 4 : 16,
                    borderTopLeftRadius: isMine ? 16 : 4,
                }}
            >
                {!isMine && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#111827', marginRight: 8 }}>
                            {item.sender?.name}
                        </Text>
                        {['moderator', 'admin'].includes(item.senderRole) && (
                            <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 6, borderRadius: 4 }}>
                                <Text style={{ fontSize: 10, color: '#1D4ED8', fontWeight: 'bold' }}>MOD</Text>
                            </View>
                        )}
                    </View>
                )}

                <Text style={{ fontSize: 15, color: isMine ? '#FFFFFF' : '#1F2937' }}>
                    {item.content}
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: isMine ? '#DBEAFE' : '#9CA3AF' }}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </TouchableOpacity>

            {isHighlighted && !selectionMode && (
                <View style={{
                    position: 'absolute',
                    right: -8,
                    top: -8,
                    backgroundColor: '#EF4444',
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 9999,
                    zIndex: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2
                }}>
                    <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: 'bold' }}>REPORTADO</Text>
                </View>
            )}
        </View>
    );
};

export default memo(MessageItem);
