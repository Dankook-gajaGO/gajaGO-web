import { StyleSheet, Text, View } from 'react-native';
import type { TransportChatMessage } from '../../data/transportSession';
import { COLORS, radius } from '../../theme';

interface ChatMessageListProps {
  messages: TransportChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  return (
    <>
      {messages.map((item) => {
        const isUser = item.role === 'user';

        return (
          <View key={item.id} style={isUser ? styles.userBubble : styles.botBubble}>
            <Text style={isUser ? styles.userBubbleText : styles.botBubbleText}>{item.text}</Text>
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    padding: 12,
    marginTop: 8,
  },
  botBubble: {
    alignSelf: 'flex-start',
    maxWidth: '82%',
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    padding: 12,
    marginTop: 8,
  },
  userBubbleText: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 18,
  },
  botBubbleText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
