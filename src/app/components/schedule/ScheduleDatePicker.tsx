import { ScrollView, StyleSheet } from 'react-native';
import { DateChip } from '../common/DateChip';
import type { ScheduleDay } from '../../data/schedule';

interface ScheduleDatePickerProps {
  days: ScheduleDay[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function ScheduleDatePicker({ days, selectedDate, onSelectDate }: ScheduleDatePickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {days.map((day) => (
        <DateChip
          key={day.date}
          label={day.label}
          selected={selectedDate === day.date}
          onPress={() => onSelectDate(day.date)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 2,
  },
});
