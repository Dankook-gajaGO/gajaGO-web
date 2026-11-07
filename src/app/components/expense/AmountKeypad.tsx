import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

// 앱 안 숫자 키패드: 기기 키보드·한글 입력기와 상관없이 PC(마우스)·폰에서 똑같이 동작
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'back'] as const;
const MAX_DIGITS = 10;

export function nextAmount(current: number, key: string) {
  if (key === 'back') return Math.floor(current / 10);
  const next = `${current === 0 ? '' : current}${key}`.replace(/^0+/, '');
  return next.length > MAX_DIGITS ? current : Number(next || 0);
}
// self-check
if (nextAmount(0, '0') !== 0 || nextAmount(12, '3') !== 123 || nextAmount(123, 'back') !== 12 || nextAmount(5, '00') !== 500) {
  throw new Error('nextAmount self-check failed');
}

type Props = { value: number; onChange: (value: number) => void };

export function AmountKeypad({ value, onChange }: Props) {
  return (
    <View style={styles.grid}>
      {KEYS.map((key) => (
        <Pressable
          key={key}
          style={({ pressed }) => [styles.key, pressed ? styles.keyPressed : null]}
          onPress={() => onChange(nextAmount(value, key))}
          onLongPress={key === 'back' ? () => onChange(0) : undefined}
          accessibilityRole="button"
          accessibilityLabel={key === 'back' ? '지우기 (길게 누르면 전체 삭제)' : key}
        >
          {key === 'back' ? (
            <Feather name="delete" size={22} color={COLORS.ink} />
          ) : (
            <Text style={styles.keyText}>{key}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  key: { width: '33.33%', height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  keyPressed: { backgroundColor: COLORS.card },
  keyText: { color: COLORS.ink, fontSize: 24, fontWeight: '600' },
});
