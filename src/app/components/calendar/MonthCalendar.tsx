import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Holiday, Memo } from '../../data/calendar';
import { COLORS, radius } from '../../theme';
import { DAY_LABELS, padDatePart } from '../../utils/date';

interface MonthCalendarProps {
  year: number;
  month: number;
  selectedDate: string;
  today: string;
  holidays: Holiday[];
  memos: Memo[];
  onSelectDate: (date: string) => void;
}

export function MonthCalendar({
  year,
  month,
  selectedDate,
  today,
  holidays,
  memos,
  onSelectDate,
}: MonthCalendarProps) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  const hasHoliday = (date: string) => holidays.some((holiday) => holiday.date === date);
  const hasMemo = (date: string) => memos.some((memo) => memo.date === date);

  return (
    <View style={styles.card}>
      <View style={styles.weekRow}>
        {DAY_LABELS.map((label, index) => (
          <Text
            key={label}
            style={[styles.weekLabel, index === 0 ? styles.sunday : index === 6 ? styles.saturday : null]}
          >
            {label}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={`empty-${index}`} style={styles.cell} />;
          const date = `${year}-${padDatePart(month + 1)}-${padDatePart(day)}`;
          const selected = selectedDate === date;
          const isToday = today === date;
          const holiday = hasHoliday(date);
          const memo = hasMemo(date);

          return (
            <Pressable key={date} style={styles.cell} onPress={() => onSelectDate(date)}>
              <View
                style={[
                  styles.dayCircle,
                  selected ? styles.selectedDay : null,
                  isToday && !selected ? styles.todayDay : null,
                ]}
              >
                <Text style={[styles.dayText, selected ? styles.selectedDayText : null]}>{day}</Text>
              </View>
              <View style={styles.dotRow}>
                {holiday ? <View style={[styles.dot, styles.holidayDot]} /> : null}
                {memo ? <View style={[styles.dot, styles.memoDot]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: radius.lg,
    padding: 14,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  sunday: {
    color: COLORS.red,
  },
  saturday: {
    color: COLORS.blue,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    minHeight: 50,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDay: {
    backgroundColor: COLORS.teal,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  dayText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  selectedDayText: {
    color: COLORS.white,
  },
  dotRow: {
    minHeight: 6,
    flexDirection: 'row',
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 1,
  },
  holidayDot: {
    backgroundColor: COLORS.red,
  },
  memoDot: {
    backgroundColor: COLORS.teal,
  },
});
