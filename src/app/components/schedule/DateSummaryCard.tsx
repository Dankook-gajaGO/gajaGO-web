import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius, shadow } from '../../theme';

interface DateSummaryCardProps {
  label: string;
  count: number;
  onPress?: () => void;
}

export function DateSummaryCard({ label, count, onPress }: DateSummaryCardProps) {
  return (
    <Pressable style={[styles.card, shadow.card]} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Feather name="calendar" size={20} color={COLORS.teal} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.count}>일정 장소 {count}개</Text>
      </View>
      <Feather name="chevron-down" size={18} color={COLORS.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  count: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
