import Feather from '@expo/vector-icons/Feather';
import { Pressable, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { dayLabel, shiftDate } from './expenseUtils';
import { sheetStyles as s } from './sheetStyles';

type Props = { label: string; value: string; today: string; onChange: (date: string) => void };

// 시작/끝 날짜를 하루씩 옮기는 줄 (여행 만들기·공유 기간에서 사용)
export function DateRangeRow({ label, value, today, onChange }: Props) {
  return (
    <View style={s.rangeRow}>
      <Text style={s.rangeLabel}>{label}</Text>
      <Pressable style={s.dateArrow} onPress={() => onChange(shiftDate(value, -1))} accessibilityLabel={`${label} 하루 전`}>
        <Feather name="chevron-left" size={18} color={COLORS.ink} />
      </Pressable>
      <Text style={s.dateText}>{dayLabel(value, today)}</Text>
      <Pressable style={s.dateArrow} onPress={() => onChange(shiftDate(value, 1))} accessibilityLabel={`${label} 하루 뒤`}>
        <Feather name="chevron-right" size={18} color={COLORS.ink} />
      </Pressable>
    </View>
  );
}
