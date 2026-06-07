import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface SuggestionListProps {
  suggestions: string[];
  onSelect: (text: string) => void;
}

export function SuggestionList({ suggestions, onSelect }: SuggestionListProps) {
  return (
    <View style={styles.wrap}>
      {suggestions.map((item) => (
        <Pressable key={item} style={styles.suggestion} onPress={() => onSelect(item)}>
          <Text style={styles.suggestionText}>{item}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    marginBottom: 8,
  },
  suggestion: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 8,
  },
  suggestionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
});
