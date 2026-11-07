import { useCallback, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getExpenses } from '../../api';
import { COLORS, radius } from '../../theme';
import { isLoggedIn } from '../../utils/requireLogin';

// 일정·캘린더에서 선택한 날짜의 가계부 합계 (회원, 기록이 있을 때만 표시). 누르면 가계부로
export function ExpenseDayCard({ date, onPress }: { date: string; onPress: () => void }) {
  const [sum, setSum] = useState(0);
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        if (!(await isLoggedIn())) return;
        try {
          const day = (await getExpenses()).filter((item) => item.spentOn === date);
          if (!active) return;
          setSum(day.reduce((total, item) => total + item.amount, 0));
          setCount(day.length);
        } catch {
          if (active) setSum(0);
        }
      })();
      return () => {
        active = false;
      };
    }, [date])
  );

  if (sum <= 0) return null;

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button" accessibilityLabel={`이날 가계부 ${sum}원, 가계부 열기`}>
      <View style={styles.icon}>
        <Feather name="credit-card" size={16} color={COLORS.teal} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>이날 가계부 · {count}건</Text>
        <Text style={styles.amount}>{sum.toLocaleString('ko-KR')}원</Text>
      </View>
      <Feather name="chevron-right" size={18} color={COLORS.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 12,
  },
  icon: { width: 34, height: 34, borderRadius: 17, backgroundColor: `${COLORS.teal}1F`, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  body: { flex: 1 },
  label: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  amount: { color: COLORS.ink, fontSize: 16, fontWeight: '800', marginTop: 2 },
});
