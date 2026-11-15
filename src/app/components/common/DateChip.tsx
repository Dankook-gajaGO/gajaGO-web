import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, radius } from '../../theme';

interface DateChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function DateChip({ label, selected, onPress }: DateChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected ? styles.selectedChip : styles.defaultChip]}
    >
      <Text style={[styles.label, selected ? styles.selectedText : styles.defaultText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 38,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  defaultChip: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
  },
  selectedChip: {
    backgroundColor: COLORS.teal,
    borderWidth: 1,
    borderColor: COLORS.teal,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  defaultText: {
    color: COLORS.text,
  },
  selectedText: {
    color: COLORS.white,
  },
});
