import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, radius } from '../../theme';

interface AuthSubmitButtonProps {
  label: string;
  isLoading: boolean;
  onPress: () => void;
}

export function AuthSubmitButton({ label, isLoading, onPress }: AuthSubmitButtonProps) {
  return (
    <Pressable
      style={[styles.button, isLoading ? styles.disabledButton : null]}
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.text}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '900',
  },
});
