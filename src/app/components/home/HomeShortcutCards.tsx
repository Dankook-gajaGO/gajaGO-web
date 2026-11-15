import Feather from '@expo/vector-icons/Feather';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

interface HomeShortcutCardsProps {
  onOpenCalendar: () => void;
  onOpenSchedule: () => void;
  onOpenExpense: () => void;
}

function Shortcut({ icon, color, title, text, onPress }: { icon: FeatherName; color: string; title: string; text: string; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.smallCard, pressed ? styles.pressed : null]} onPress={onPress} accessibilityRole="button">
      <Feather name={icon} size={22} color={color} />
      <Text style={styles.smallTitle}>{title}</Text>
      <Text style={styles.smallText} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );
}

export function HomeShortcutCards({ onOpenCalendar, onOpenSchedule, onOpenExpense }: HomeShortcutCardsProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>내 여행</Text>
      <View style={styles.twoCol}>
        <Shortcut icon="calendar" color={COLORS.teal} title="캘린더" text="날짜별 일정·메모" onPress={onOpenCalendar} />
        <View style={styles.gap} />
        <Shortcut icon="map-pin" color={COLORS.blue} title="내 일정" text="오늘 할 일 정리" onPress={onOpenSchedule} />
      </View>

      {/* 검은 '행사 추천' 배너는 '전체보기'와 중복이라, 홈에 입구가 없던 가계부로 교체 */}
      <Pressable style={({ pressed }) => [styles.expenseCard, pressed ? styles.pressed : null]} onPress={onOpenExpense} accessibilityRole="button">
        <View style={styles.expenseIcon}>
          <Feather name="pocket" size={22} color={COLORS.teal} />
        </View>
        <View style={styles.expenseTextWrap}>
          <Text style={styles.expenseTitle}>여행 가계부</Text>
          <Text style={styles.expenseText}>쓴 돈 기록하고 환율·N빵까지</Text>
        </View>
        <Feather name="chevron-right" size={20} color={COLORS.muted} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 14,
  },
  twoCol: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  gap: {
    width: 10,
  },
  smallCard: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  smallTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
  },
  smallText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
  expenseCard: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: COLORS.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseTextWrap: {
    flex: 1,
  },
  expenseTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  expenseText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 3,
  },
});
