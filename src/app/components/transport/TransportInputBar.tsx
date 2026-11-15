import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface TransportInputBarProps {
  message: string;
  isLoading: boolean;
  onChangeMessage: (value: string) => void;
  onFocus?: () => void;
  onSend: () => void;
}

export function TransportInputBar({
  message,
  isLoading,
  onChangeMessage,
  onFocus,
  onSend,
}: TransportInputBarProps) {
  return (
    <View style={styles.inputBar}>
      <TextInput
        value={message}
        onChangeText={onChangeMessage}
        onFocus={onFocus}
        placeholder="경로를 물어보세요"
        placeholderTextColor={COLORS.muted}
        style={styles.input}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />
      <Pressable
        style={[styles.sendButton, isLoading ? styles.disabledButton : null]}
        onPress={onSend}
        disabled={isLoading}
      >
        <Feather name="send" size={18} color={COLORS.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  inputBar: {
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    color: COLORS.ink,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.65,
  },
});
