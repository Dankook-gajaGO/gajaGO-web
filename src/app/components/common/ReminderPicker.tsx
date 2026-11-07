import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import { REMINDER_OPTIONS, type ReminderOption } from '../../utils/notifications';

// 일정 등록 시 알림을 직접 고름 (기본: 알림 없음)
export function ReminderPicker({ value, onChange }: { value: ReminderOption; onChange: (v: ReminderOption) => void }) {
  return (
    <View style={styles.row}>
      <Feather name="bell" size={14} color={COLORS.muted} style={styles.icon} />
      {REMINDER_OPTIONS.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            style={[styles.chip, on ? styles.chipOn : null]}
            onPress={() => onChange(o.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
          >
            <Text style={[styles.text, on ? styles.textOn : null]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 },
  icon: { marginRight: 6 },
  chip: { borderRadius: 14, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, marginBottom: 4 },
  chipOn: { backgroundColor: COLORS.ink, borderColor: COLORS.ink },
  text: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  textOn: { color: COLORS.white },
});
