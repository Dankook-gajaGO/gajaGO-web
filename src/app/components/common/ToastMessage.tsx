import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, radius, shadow } from '../../theme';

interface ToastMessageProps {
  message: string;
  tone?: 'success' | 'error' | 'info';
}

const toneConfig = {
  success: {
    icon: 'check-circle',
    color: COLORS.teal,
    backgroundColor: '#E5F7F7',
  },
  error: {
    icon: 'alert-circle',
    color: COLORS.red,
    backgroundColor: '#FFF0F0',
  },
  info: {
    icon: 'info',
    color: COLORS.blue,
    backgroundColor: '#EEF6FF',
  },
} as const;

export function ToastMessage({ message, tone = 'success' }: ToastMessageProps) {
  if (!message) return null;

  const config = toneConfig[tone];

  return (
    <View style={[styles.wrap, shadow.card, { backgroundColor: config.backgroundColor }]}>
      <Feather name={config.icon} size={16} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 42,
    borderRadius: radius.md,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 17,
    marginLeft: 8,
  },
});
