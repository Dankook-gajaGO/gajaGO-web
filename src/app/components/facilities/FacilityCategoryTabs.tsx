import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  facilityCategoryTabs,
  type FacilityCategoryTab,
} from '../../hooks/useNearbyFacilities';
import { COLORS, radius } from '../../theme';

interface FacilityCategoryTabsProps {
  selectedCategory: FacilityCategoryTab;
  onSelect: (category: FacilityCategoryTab) => void;
}

export function FacilityCategoryTabs({ selectedCategory, onSelect }: FacilityCategoryTabsProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {facilityCategoryTabs.map((tab) => {
          const isActive = selectedCategory === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => onSelect(tab)}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 62,
    flexGrow: 0,
    flexShrink: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  categoryRow: {
    gap: 8,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: COLORS.line,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryChipActive: {
    borderColor: COLORS.teal,
    backgroundColor: '#E7FAF8',
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: COLORS.teal,
  },
});
