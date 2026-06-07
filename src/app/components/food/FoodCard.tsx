import { StyleSheet, Text, View } from 'react-native';
import type { FoodRecommendation } from '../../api';
import { COLORS, radius, shadow } from '../../theme';

interface FoodCardProps {
  item: FoodRecommendation;
}

export function FoodCard({ item }: FoodCardProps) {
  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.area}>{item.category}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>추천</Text>
        </View>
      </View>
      <Text style={styles.note}>{item.note}</Text>
      <View style={styles.tags}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    paddingRight: 12,
  },
  name: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
  },
  area: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 3,
  },
  scoreBadge: {
    borderRadius: 999,
    backgroundColor: '#E5F7F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  scoreText: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '900',
  },
  note: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    borderRadius: radius.sm,
    backgroundColor: COLORS.card,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
  },
});
