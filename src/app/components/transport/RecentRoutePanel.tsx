import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TransportRouteHistoryItem } from '../../data/transportHistory';
import { COLORS, radius, shadow } from '../../theme';

interface RecentRoutePanelProps {
  items: TransportRouteHistoryItem[];
  onSelect: (item: TransportRouteHistoryItem) => void;
  onClear: () => void;
}

function formatSavedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '최근 저장';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hour}:${minute}`;
}

export function RecentRoutePanel({ items, onSelect, onClear }: RecentRoutePanelProps) {
  if (items.length === 0) return null;

  return (
    <View style={[styles.card, shadow.card]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>최근 추천 경로</Text>
        </View>
        <Pressable style={styles.clearButton} onPress={onClear}>
          <Feather name="trash-2" size={15} color={COLORS.muted} />
        </Pressable>
      </View>

      {items.slice(0, 3).map((item) => (
        <Pressable key={item.id} style={styles.item} onPress={() => onSelect(item)}>
          <View style={styles.itemIcon}>
            <Feather name="clock" size={15} color={COLORS.teal} />
          </View>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle} numberOfLines={1}>
              {item.departure.name} → {item.destination.name}
            </Text>
            <Text style={styles.itemMeta}>
              {item.route.travelTime}분 · 환승 {item.route.transfers}회 ·{' '}
              {item.route.fare.toLocaleString()}원 · {formatSavedAt(item.savedAt)}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={COLORS.muted} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 16,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  clearButton: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  item: {
    minHeight: 58,
    borderTopWidth: 1,
    borderTopColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E5F7F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemText: {
    flex: 1,
  },
  itemTitle: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '900',
  },
  itemMeta: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
});
