import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MessageBubble from '../components/MessageBubble';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  sender: 'system' | 'user' | 'ai_astrologer' | 'human_astrologer';
  text: string;
  timestamp: number;
  type: 'event' | 'text' | 'ai' | 'human';
  hasFeedback?: boolean;
  feedbackType?: string;
  feedbackReason?: string;
  liked?: boolean;
  replyTo?: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'system',
    text: 'Your session with Astrologer Vikram has started.',
    timestamp: 1734681480000,
    type: 'event',
  },
  {
    id: '2',
    sender: 'user',
    text: 'Namaste. I am feeling very anxious about my current job. Can you look at my chart?',
    timestamp: 1734681600000,
    type: 'text',
  },
  {
    id: '3',
    sender: 'ai_astrologer',
    text: 'Namaste! I am analyzing your birth details. Currently, you are running through Shani Mahadasha. This often brings pressure but builds resilience.',
    timestamp: 1734681660000,
    type: 'ai',
    hasFeedback: true,
    feedbackType: 'liked',
  },
  {
    id: '4',
    sender: 'human_astrologer',
    text: 'I see the same. Look at your 6th house; Saturn is transiting there. This is why you feel the workload is heavy.',
    timestamp: 1734681720000,
    type: 'human',
  },
  {
    id: '5',
    sender: 'user',
    text: 'Is there any remedy for this? I find it hard to focus.',
    timestamp: 1734681780000,
    type: 'text',
    replyTo: '4',
  },
  {
    id: '6',
    sender: 'ai_astrologer',
    text: 'I suggest chanting the Shani Mantra 108 times on Saturdays. Would you like the specific mantra text?',
    timestamp: 1734681840000,
    type: 'ai',
    hasFeedback: false,
  },
];

const ChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const chat = route.params?.chat || {
    id: '1',
    name: 'Astrologer Vikram',
    avatar: '🔮',
    lastMessage: 'Welcome to astrology consultation',
    timestamp: 'Now',
    unreadCount: 0,
    isOnline: true,
  };
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEndChatModal, setShowEndChatModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [chatStarted, setChatStarted] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [messages]);

  const initiateChat = () => {
    setMessages([...INITIAL_MESSAGES])
    setChatStarted(true);
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: message,
        timestamp: Date.now(),
        type: 'text',
        replyTo: replyingTo?.id,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
      setReplyingTo(null);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    const parts = emoji.split('_');
    const feedbackType = parts[0];
    const likeStatus = parts[1]; // 'liked' or 'disliked'
    const feedbackReason = parts[2]; // reason if provided
    
    const liked = likeStatus === 'liked' ? true : likeStatus === 'disliked' ? false : undefined;
    
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId 
          ? { ...msg, hasFeedback: true, feedbackType, feedbackReason, liked } 
          : msg
      )
    );
  };

  const handleReply = (msg: Message) => {
    setReplyingTo(msg);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const handleEndChat = () => {
    setShowConfirmModal(true);
  };

  const confirmEndChat = () => {
    setShowConfirmModal(false);
    setShowEndChatModal(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRatingSubmit = () => {
    setShowEndChatModal(false);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Alert.alert(
        'Thank You!',
        `Your ${rating}-star rating has been captured. We appreciate your feedback!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setRating(0);
              navigation.goBack();
            },
          },
        ]
      );
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble 
      message={item} 
      onReaction={handleReaction} 
      onReply={handleReply}
      allMessages={messages}
    />
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.avatar}>{chat.avatar}</Text>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName}>{chat.name}</Text>
            <Text style={styles.headerStatus}>
              {chat.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        {chatStarted && (
          <TouchableOpacity onPress={handleEndChat} style={styles.endChatButton}>
            <Text style={styles.endChatText}>End Chat</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Messages List */}
      {!chatStarted ? (
        <View style={styles.initiateContainer}>
          <Text style={styles.initiateTitle}>🔮 Astrology Consultation</Text>
          <Text style={styles.initiateSubtitle}>
            Connect with Astrologer Vikram for personalized guidance
          </Text>
          <TouchableOpacity 
            style={styles.initiateButton}
            onPress={initiateChat}>
            <Text style={styles.initiateButtonText}>Start Consultation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          inverted={false}
        />
      )}

      {/* Input Area */}
      {chatStarted && (
        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          {replyingTo && (
            <View style={styles.replyPreview}>
              <View style={styles.replyContent}>
                <Text style={styles.replyLabel}>
                  Replying to {replyingTo.isSent ? 'yourself' : chat.name}
                </Text>
                <Text style={styles.replyText} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
              </View>
              <TouchableOpacity onPress={cancelReply} style={styles.cancelReply}>
                <Text style={styles.cancelIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#8E8E93"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim()}>
              <Text style={styles.sendIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>End Chat?</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to end this consultation?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmCancelButton]}
                onPress={() => setShowConfirmModal(false)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmEndButton]}
                onPress={confirmEndChat}>
                <Text style={styles.confirmEndText}>End Chat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Chat Rating Modal */}
      <Modal
        visible={showEndChatModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowEndChatModal(false)}>
        <Animated.View
          style={[
            styles.modalOverlay,
            {
              opacity: fadeAnim,
            },
          ]}>
          <Animated.View
            style={[
              styles.ratingContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}>
            <Text style={styles.ratingTitle}>How was your chat?</Text>
            <Text style={styles.ratingSubtitle}>Please rate your experience</Text>

            {/* Star Rating */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}>
                  <Text style={styles.starIcon}>
                    {star <= rating ? '⭐' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.thankYouText}>Thank you for your feedback!</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => {
                  setShowEndChatModal(false);
                  setRating(0);
                }}
                style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleRatingSubmit}
                disabled={rating === 0}
                style={[
                  styles.modalButton,
                  styles.submitButton,
                  rating === 0 && styles.submitButtonDisabled,
                ]}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backIcon: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  endChatButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  endChatText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 320,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmCancelButton: {
    backgroundColor: '#F2F2F7',
  },
  confirmEndButton: {
    backgroundColor: '#FF3B30',
  },
  confirmCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  confirmEndText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '85%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  starButton: {
    padding: 8,
  },
  starIcon: {
    fontSize: 40,
  },
  thankYouText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F2F2F7',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  initiateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  initiateTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  initiateSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  initiateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  initiateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  replyPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  replyContent: {
    flex: 1,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 14,
    color: '#666666',
  },
  cancelReply: {
    padding: 4,
    marginLeft: 8,
  },
  cancelIcon: {
    fontSize: 18,
    color: '#8E8E93',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#C7C7CC',
  },
  sendIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
});

export default ChatScreen;
