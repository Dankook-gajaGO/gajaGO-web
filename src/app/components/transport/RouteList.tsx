import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TransportRoute } from '../../api';
import { COLORS, radius, shadow } from '../../theme';

interface RouteListProps {
  routes: TransportRoute[];
  selectedRouteId: string | null;
  isLoading: boolean;
  onSelectRoute: (routeId: string) => void;
}

function getRouteHighlights(route: TransportRoute, routes: TransportRoute[]) {
  if (routes.length === 0) return [];

  const minTime = Math.min(...routes.map((item) => item.travelTime));
  const minFare = Math.min(...routes.map((item) => item.fare));
  const minWalk = Math.min(...routes.map((item) => item.walkingDistance));
  const minTransfers = Math.min(...routes.map((item) => item.transfers));
  const labels: string[] = [];

  if (route.rank === 1) labels.push('추천');
  if (route.travelTime === minTime) labels.push('가장 빠름');
  if (route.fare === minFare) labels.push('저렴함');
  if (route.walkingDistance === minWalk) labels.push('도보 적음');
  if (route.transfers === minTransfers) labels.push('환승 적음');
  if (route.walkingDistance <= 600 && route.transfers <= 1) labels.push('초행자 추천');

  return Array.from(new Set(labels)).slice(0, 4);
}

export function RouteList({
  routes,
  selectedRouteId,
  isLoading,
  onSelectRoute,
}: RouteListProps) {
  return (
    <>
      <Text style={styles.sectionTitle}>추천 경로</Text>
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={COLORS.teal} />
          <Text style={styles.loadingText}>경로를 계산하는 중입니다.</Text>
        </View>
      ) : null}

      {routes.length === 0 && !isLoading ? (
        <View style={[styles.routeCard, shadow.card]}>
          <Text style={styles.routeTitle}>경로 대기 중</Text>
          <Text style={styles.routeMeta}>
            출발지와 목적지를 선택하면 추천 경로가 표시됩니다.
          </Text>
        </View>
      ) : null}

      {routes.map((route) => {
        const active = route.id === selectedRouteId;
        const highlights = getRouteHighlights(route, routes);

        return (
          <Pressable
            key={route.id}
            style={[styles.routeCard, shadow.card, active ? styles.activeRouteCard : null]}
            onPress={() => onSelectRoute(route.id)}
          >
            <View style={styles.routeHeader}>
              <View style={styles.routeTitleWrap}>
                <Text style={styles.routeTitle}>추천 {route.rank}순위</Text>
                <Text style={styles.routeMeta}>
                  {route.travelTime}분 · 환승 {route.transfers}회 ·{' '}
                  {route.fare.toLocaleString()}원
                </Text>
              </View>
              <Feather
                name={active ? 'check-circle' : 'chevron-right'}
                size={20}
                color={active ? COLORS.teal : COLORS.muted}
              />
            </View>

            {highlights.length > 0 ? (
              <View style={styles.badgeRow}>
                {highlights.map((label) => (
                  <View key={label} style={[styles.badge, active ? styles.activeBadge : null]}>
                    <Text style={[styles.badgeText, active ? styles.activeBadgeText : null]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.routeFooter}>
              <Text style={styles.walkingText}>
                도보 {route.walkingDistance.toLocaleString()}m
              </Text>
              <Text style={[styles.routeSelectText, active ? styles.activeRouteSelectText : null]}>
                {active ? '선택됨' : '자세히 보기'}
              </Text>
            </View>
          </Pressable>
        );
      })}

      {routes.length > 0 && !selectedRouteId ? (
        <Text style={styles.routeHint}>경로를 선택하면 상세 이동 순서가 표시됩니다.</Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 22,
    marginBottom: 12,
  },
  loadingRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 8,
  },
  routeCard: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 12,
  },
  activeRouteCard: {
    borderWidth: 1,
    borderColor: COLORS.teal,
    backgroundColor: '#F4FCFB',
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  routeTitleWrap: {
    flex: 1,
    paddingRight: 12,
  },
  routeTitle: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  routeMeta: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: COLORS.card,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  activeBadge: {
    backgroundColor: '#DDF8F5',
  },
  badgeText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '900',
  },
  activeBadgeText: {
    color: COLORS.teal,
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walkingText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '900',
  },
  routeSelectText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '900',
  },
  activeRouteSelectText: {
    color: COLORS.teal,
  },
  routeHint: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: -2,
    marginBottom: 12,
  },
});
