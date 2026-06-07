import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface TransportIntroCardProps {
  onReset: () => void;
}

export function TransportIntroCard({ onReset }: TransportIntroCardProps) {
  return (
    <View style={styles.card}>
      <Feather name="navigation" size={30} color={COLORS.teal} />
      <Text style={styles.title}>교통 챗봇</Text>
      <Text style={styles.description}>
        첫 메시지로 후보지를 찾고, 후보 선택 후 경로를 받아옵니다.
      </Text>
      <Pressable style={styles.resetButton} onPress={onReset}>
        <Feather name="refresh-ccw" size={14} color={COLORS.teal} />
        <Text style={styles.resetButtonText}>새 경로</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 152,
    borderRadius: radius.xl,
    backgroundColor: '#EAF6F5',
    borderWidth: 1,
    borderColor: '#CDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  resetButton: {
    minHeight: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B8E5E2',
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 12,
  },
  resetButtonText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },
});
