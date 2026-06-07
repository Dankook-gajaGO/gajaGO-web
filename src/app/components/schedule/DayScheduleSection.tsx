import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Place } from '../../data/schedule';
import { COLORS, radius, shadow } from '../../theme';

interface DayScheduleSectionProps {
  places: Place[];
  onRemovePlace: (placeId: string) => void;
}

export function DayScheduleSection({ places, onRemovePlace }: DayScheduleSectionProps) {
  if (places.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>등록된 일정이 없습니다</Text>
        <Text style={styles.emptyText}>선택한 날짜에 저장된 장소가 없습니다.</Text>
      </View>
    );
  }

  return (
    <View>
      {places.map((place, index) => (
        <View key={`${place.id}-${index}`} style={[styles.placeCard, shadow.card]}>
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{index + 1}</Text>
          </View>
          <View style={styles.placeTextWrap}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeMeta}>{place.category}</Text>
            <Text style={styles.address} numberOfLines={1}>
              {place.address}
            </Text>
          </View>
          <Pressable style={styles.removeButton} onPress={() => onRemovePlace(place.id)}>
            <Feather name="x" size={18} color={COLORS.muted} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    textAlign: 'center',
  },
  placeCard: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
  },
  placeTextWrap: {
    flex: 1,
  },
  placeName: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  placeMeta: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  address: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
