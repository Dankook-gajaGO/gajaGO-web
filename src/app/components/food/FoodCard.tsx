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
      </View>
      {item.note ? (
        <View style={styles.ingredientBox}>
          <Text style={styles.ingredientLabel}>성분</Text>
          <Text style={styles.ingredientText} numberOfLines={2}>
            {item.note}
          </Text>
        </View>
      ) : null}
      {item.tags.length > 0 ? (
        <View style={styles.tags}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 18,
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
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  ingredientBox: {
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
  },
  ingredientLabel: {
    color: COLORS.teal,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  ingredientText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
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
