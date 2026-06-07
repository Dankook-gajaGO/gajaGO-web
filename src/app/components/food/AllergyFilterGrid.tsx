import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

interface AllergyFilterGridProps {
  allergies: string[];
  selectedAllergies: string[];
  onToggle: (allergy: string) => void;
}

export function AllergyFilterGrid({
  allergies,
  selectedAllergies,
  onToggle,
}: AllergyFilterGridProps) {
  return (
    <View style={styles.grid}>
      {allergies.map((allergy) => {
        const active = selectedAllergies.includes(allergy);
        return (
          <Pressable
            key={allergy}
            style={[styles.chip, active ? styles.activeChip : null]}
            onPress={() => onToggle(allergy)}
          >
            <Feather
              name={active ? 'check-square' : 'square'}
              size={16}
              color={active ? COLORS.white : COLORS.muted}
            />
            <Text style={[styles.text, active ? styles.activeText : null]}>{allergy}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  activeChip: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  text: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },
  activeText: {
    color: COLORS.white,
  },
});
