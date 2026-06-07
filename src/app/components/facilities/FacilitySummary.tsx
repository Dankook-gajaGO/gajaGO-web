import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { FACILITY_RADIUS_KM } from '../../hooks/useNearbyFacilities';
import { COLORS, radius, shadow } from '../../theme';

interface FacilitySummaryProps {
  isBusy: boolean;
}

export function FacilitySummary({ isBusy }: FacilitySummaryProps) {
  return (
    <View style={styles.summary}>
      <View>
        <Text style={styles.summaryTitle}>주변 편의시설</Text>
        <Text style={styles.summaryText}>현재 위치 기준 반경 {FACILITY_RADIUS_KM}km</Text>
      </View>
      {isBusy ? <ActivityIndicator color={COLORS.teal} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    minHeight: 68,
    borderRadius: radius.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow.card,
  },
  summaryTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  summaryText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
