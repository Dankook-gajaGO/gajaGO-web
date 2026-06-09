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
        <Text style={styles.emptyText}>선택한 날짜에 메모나 행사를 추가해보세요.</Text>
      </View>
    );
  }

  return (
    <View>
      {places.map((place, index) => (
        <View key={`${place.id}-${index}`} style={[styles.placeCard, shadow.card]}>
          <Pressable
            style={styles.removeButton}
            onPress={() => onRemovePlace(place.id)}
            accessibilityRole="button"
            accessibilityLabel={`${place.name} 일정 삭제`}
          >
            <Feather name="x" size={17} color={COLORS.muted} />
          </Pressable>
          <View style={styles.orderBadge}>
            <Text style={styles.orderText}>{index + 1}</Text>
          </View>
          <View style={styles.placeTextWrap}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeMeta}>{place.category}</Text>
            <Text style={styles.address} numberOfLines={2}>
              {place.address}
            </Text>
          </View>
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
    paddingRight: 48,
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
    lineHeight: 17,
    marginTop: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
