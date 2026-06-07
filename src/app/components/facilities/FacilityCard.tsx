import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FacilityItem } from '../../api';
import { COLORS, radius, shadow } from '../../theme';

interface FacilityCardProps {
  item: FacilityItem;
  onPress?: (item: FacilityItem) => void;
}

function formatDistance(distance: number) {
  if (!Number.isFinite(distance)) return '';
  if (distance < 1000) return `${Math.max(0, Math.round(distance))}m`;
  return `${(distance / 1000).toFixed(1)}km`;
}

export function FacilityCard({ item, onPress }: FacilityCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => onPress?.(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} 지도에서 보기`}
    >
      <View style={styles.cardTop}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.category}</Text>
        </View>
        <View style={styles.distanceWrap}>
          <Text style={styles.distance}>{formatDistance(item.distance)}</Text>
          <Feather name="external-link" size={15} color={COLORS.blue} />
        </View>
      </View>
      <Text style={styles.facilityName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.address} numberOfLines={2}>
        {item.address}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 10,
    ...shadow.card,
  },
  cardPressed: {
    opacity: 0.86,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badge: {
    minHeight: 26,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '800',
  },
  distanceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  distance: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: '800',
  },
  facilityName: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  address: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
});
