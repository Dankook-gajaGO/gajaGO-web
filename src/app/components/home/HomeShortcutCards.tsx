import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius, shadow } from '../../theme';

interface HomeShortcutCardsProps {
  onOpenCalendar: () => void;
  onOpenSchedule: () => void;
  onOpenEvents: () => void;
}

export function HomeShortcutCards({
  onOpenCalendar,
  onOpenSchedule,
  onOpenEvents,
}: HomeShortcutCardsProps) {
  return (
    <>
      <View style={styles.twoCol}>
        <Pressable style={[styles.smallCard, shadow.card]} onPress={onOpenCalendar}>
          <Feather name="calendar" size={24} color={COLORS.teal} />
          <Text style={styles.smallTitle}>캘린더</Text>
          <Text style={styles.smallText}>메모와 일정을 확인합니다.</Text>
        </Pressable>
        <Pressable style={[styles.smallCard, shadow.card]} onPress={onOpenSchedule}>
          <Feather name="map-pin" size={24} color={COLORS.blue} />
          <Text style={styles.smallTitle}>내 일정</Text>
          <Text style={styles.smallText}>오늘 할 일을 정리합니다.</Text>
        </Pressable>
      </View>

      <Pressable style={styles.weekendCard} onPress={onOpenEvents}>
        <View>
          <Text style={styles.weekendEyebrow}>행사 추천</Text>
          <Text style={styles.weekendTitle}>지금 갈 만한 행사를 찾아보세요</Text>
        </View>
        <Feather name="arrow-right" size={22} color={COLORS.white} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  twoCol: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  smallCard: {
    flex: 1,
    minHeight: 134,
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginRight: 10,
  },
  smallTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 14,
  },
  smallText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
  },
  weekendCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: radius.xl,
    backgroundColor: COLORS.ink,
    minHeight: 112,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekendEyebrow: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  weekendTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
    maxWidth: 250,
  },
});
