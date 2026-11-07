import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface TransportIntroCardProps {
  onReset: () => void;
}

// 큰 안내 박스 대신 한 줄 안내 + 새로 시작 버튼 (아래 예시 질문이 사용법을 대신 보여줌)
export function TransportIntroCard({ onReset }: TransportIntroCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Feather name="navigation" size={20} color={COLORS.teal} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.title}>어디로 가세요?</Text>
        <Text style={styles.description}>출발지와 목적지를 말하면 대중교통 경로를 찾아드려요</Text>
      </View>
      <Pressable style={styles.resetButton} onPress={onReset} accessibilityRole="button" accessibilityLabel="새 경로 찾기">
        <Feather name="refresh-ccw" size={16} color={COLORS.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: COLORS.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
