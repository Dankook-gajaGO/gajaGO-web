import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  eventStatusFilters,
  type EventStatusFilter,
} from '../../hooks/useFestivalEvents';
import { COLORS, radius } from '../../theme';

export type EventViewMode = 'list' | 'calendar';

interface EventFilterSectionProps {
  regionFilters: string[];
  regionFilter: string;
  statusFilter: EventStatusFilter;
  viewMode: EventViewMode;
  isLoading: boolean;
  statusMessage: string;
  onRegionChange: (region: string) => void;
  onStatusChange: (status: EventStatusFilter) => void;
  onViewModeChange: (mode: EventViewMode) => void;
}

export function EventFilterSection({
  regionFilters,
  regionFilter,
  statusFilter,
  viewMode,
  isLoading,
  statusMessage,
  onRegionChange,
  onStatusChange,
  onViewModeChange,
}: EventFilterSectionProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.viewTabs}>
        <Pressable
          style={[styles.viewTab, viewMode === 'list' ? styles.activeViewTab : null]}
          onPress={() => onViewModeChange('list')}
        >
          <Text style={[styles.viewTabText, viewMode === 'list' ? styles.activeViewTabText : null]}>목록</Text>
        </Pressable>
        <Pressable
          style={[styles.viewTab, viewMode === 'calendar' ? styles.activeViewTab : null]}
          onPress={() => onViewModeChange('calendar')}
        >
          <Text style={[styles.viewTabText, viewMode === 'calendar' ? styles.activeViewTabText : null]}>
            서울 캘린더
          </Text>
        </Pressable>
      </View>

      {viewMode === 'list' ? (
        <>
          <Text style={styles.filterLabel}>지역</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {regionFilters.map((item) => (
              <Pressable
                key={item}
                style={[styles.filterChip, regionFilter === item ? styles.activeFilter : null]}
                onPress={() => onRegionChange(item)}
              >
                <Text style={[styles.filterText, regionFilter === item ? styles.activeFilterText : null]}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      ) : null}

      <Text style={[styles.filterLabel, styles.statusLabel]}>행사 상태</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {eventStatusFilters.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.filterChip, statusFilter === item.id ? styles.activeFilter : null]}
            onPress={() => onStatusChange(item.id)}
          >
            <Text style={[styles.filterText, statusFilter === item.id ? styles.activeFilterText : null]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.statusRow}>
          <ActivityIndicator color={COLORS.teal} />
          <Text style={styles.statusText}>불러오는 중이에요</Text>
        </View>
      ) : null}
      {statusMessage ? <Text style={styles.errorText}>{statusMessage}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  viewTabs: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
  },
  viewTab: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeViewTab: {
    backgroundColor: COLORS.white,
  },
  viewTabText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  activeViewTabText: {
    color: COLORS.teal,
  },
  filterLabel: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  statusLabel: {
    marginTop: 14,
  },
  statusRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusText: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 10,
  },
  filterChip: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  filterText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  activeFilterText: {
    color: COLORS.white,
  },
});
