import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

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

interface MessageBubbleProps {
  message: Message;
  onReaction: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  allMessages: Message[];
}

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];
const SWIPE_THRESHOLD = 80;

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReaction, onReply, allMessages }) => {
  const translateX = useSharedValue(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeedbackChips, setShowFeedbackChips] = useState(false);
  const feedbackHeight = useSharedValue(0);

  const handleLongPress = () => {
    setShowEmojiPicker(true);
  };

  const handleEmojiSelect = (emoji: string) => {
    onReaction(message.id, emoji);
    setShowEmojiPicker(false);
  };

  const handleLike = () => {
    onReaction(message.id, '👍_liked');
    setShowFeedbackChips(false);
  };

  const handleDislike = () => {
    if (!showFeedbackChips) {
      setShowFeedbackChips(true);
      feedbackHeight.value = withSpring(1);
    } else {
      setShowFeedbackChips(false);
      feedbackHeight.value = withSpring(0);
      onReaction(message.id, '👎_disliked');
    }
  };

  const handleFeedbackReason = (reason: string) => {
    onReaction(message.id, '👎_disliked_' + reason);
    setShowFeedbackChips(false);
    feedbackHeight.value = withSpring(0);
  };

  const handleReply = () => {
    onReply(message);
  };

  // Swipe gesture for reply
  const panGesture = Gesture.Pan()
    .activeOffsetX(10)
    .onUpdate((event) => {
      'worklet';
      if (event.translationX > 0) {
        translateX.value = Math.min(event.translationX, SWIPE_THRESHOLD);
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(handleReply)();
      }
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const replyIconStyle = useAnimatedStyle(() => ({
    opacity: translateX.value / SWIPE_THRESHOLD,
  }));

  const feedbackChipsStyle = useAnimatedStyle(() => ({
    maxHeight: feedbackHeight.value * 80,
    opacity: feedbackHeight.value,
  }));

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getRepliedMessage = () => {
    if (!message.replyTo) return null;
    return allMessages.find(msg => msg.id === message.replyTo);
  };

  const repliedMessage = getRepliedMessage();

  const getSenderName = (sender: string) => {
    switch (sender) {
      case 'ai_astrologer': return '🤖 AI Astrologer';
      case 'human_astrologer': return '👤 Astrologer Vikram';
      case 'user': return 'You';
      default: return '';
    }
  };

  const getBubbleColor = () => {
    switch (message.sender) {
      case 'user': return '#007AFF';
      case 'ai_astrologer': return '#34C759';
      case 'human_astrologer': return '#FF9500';
      default: return '#E5E5EA';
    }
  };

  // Event messages (system messages)
  if (message.type === 'event') {
    return (
      <View style={styles.eventContainer}>
        <Text style={styles.eventText}>{message.text}</Text>
      </View>
    );
  }

  const isUserMessage = message.sender === 'user';

  return (
    <>
      <View style={styles.container}>
        <Animated.View style={[styles.replyIconContainer, replyIconStyle]}>
          <Text style={styles.replyIcon}>↩️</Text>
        </Animated.View>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              activeOpacity={0.8}
              onLongPress={handleLongPress}
              delayLongPress={500}>
              <View
                style={[
                  styles.messageBubble,
                  isUserMessage ? styles.sentMessage : styles.receivedMessage,
                  { backgroundColor: getBubbleColor() },
                ]}>
                {/* Sender Label */}
                {!isUserMessage && (
                  <Text style={styles.senderName}>{getSenderName(message.sender)}</Text>
                )}

                {/* Reply Preview */}
                {repliedMessage && (
                  <View style={styles.replyToBubble}>
                    <Text style={styles.replyToName}>{getSenderName(repliedMessage.sender)}</Text>
                    <Text style={styles.replyToText} numberOfLines={1}>
                      {repliedMessage.text}
                    </Text>
                  </View>
                )}

                {/* Message Text */}
                <Text
                  style={[
                    styles.messageText,
                    isUserMessage ? styles.sentText : styles.receivedText,
                  ]}>
                  {message.text}
                </Text>

                {/* Timestamp */}
                <Text
                  style={[
                    styles.messageTime,
                    isUserMessage ? styles.sentTime : styles.receivedTime,
                  ]}>
                  {formatTime(message.timestamp)}
                </Text>

                {/* Emoji Feedback for non-AI messages */}
                {message.sender !== 'ai_astrologer' && message.hasFeedback && message.feedbackType && (
                  <View style={styles.feedbackContainer}>
                    <Text style={styles.feedbackIcon}>
                      {message.feedbackType}
                    </Text>
                  </View>
                )}
              </View>

              {/* Like/Dislike Toggle for AI Astrologer */}
              {message.sender === 'ai_astrologer' && (
                <View style={styles.feedbackToggleContainer}>
                  <View style={styles.feedbackToggle}>
                    <TouchableOpacity 
                      style={[
                        styles.feedbackButton,
                        message.liked === true && styles.feedbackButtonActive
                      ]}
                      onPress={handleLike}>
                      <Text style={styles.feedbackButtonText}>👍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[
                        styles.feedbackButton,
                        message.liked === false && styles.feedbackButtonActive
                      ]}
                      onPress={handleDislike}>
                      <Text style={styles.feedbackButtonText}>👎</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Feedback Chips */}
                  {showFeedbackChips && (
                    <Animated.View style={[styles.feedbackChipsContainer, feedbackChipsStyle]}>
                      <TouchableOpacity 
                        style={styles.feedbackChip}
                        onPress={() => handleFeedbackReason('Inaccurate')}>
                        <Text style={styles.feedbackChipText}>Inaccurate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.feedbackChip}
                        onPress={() => handleFeedbackReason('Too Vague')}>
                        <Text style={styles.feedbackChipText}>Too Vague</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.feedbackChip}
                        onPress={() => handleFeedbackReason('Too Long')}>
                        <Text style={styles.feedbackChipText}>Too Long</Text>
                      </TouchableOpacity>
                    </Animated.View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      </View>

      {/* Emoji Picker Modal */}
      <Modal
        visible={showEmojiPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmojiPicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowEmojiPicker(false)}>
          <View style={styles.emojiPickerContainer}>
            {EMOJIS.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                style={styles.emojiButton}
                onPress={() => handleEmojiSelect(emoji)}>
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  eventContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 8,
  },
  eventText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  replyIconContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: -1,
  },
  replyIcon: {
    fontSize: 24,
    marginLeft: -30,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  replyToBubble: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  replyToName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  replyToText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentText: {
    color: '#FFFFFF',
  },
  receivedText: {
    color: '#000000',
  },
  sentTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTime: {
    color: '#8E8E93',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  feedbackToggleContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  feedbackToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  feedbackButtonActive: {
    backgroundColor: '#34C759',
  },
  feedbackButtonText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  feedbackChipsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  feedbackChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackChipText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: -8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackIcon: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  emojiText: {
    fontSize: 28,
  },
});

export default MessageBubble;
