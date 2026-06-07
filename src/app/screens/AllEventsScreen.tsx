import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import { EventCalendarSection } from '../components/events/EventCalendarSection';
import { EventFilterSection, type EventViewMode } from '../components/events/EventFilterSection';
import { EventListItem } from '../components/events/EventListItem';
import { getFestivalRegion, type FestivalEventItem } from '../data/festivalEvents';
import {
  ALL_REGION,
  SEOUL_REGION,
  matchesEventStatus,
  useFestivalEvents,
  type EventStatusFilter,
} from '../hooks/useFestivalEvents';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';
import { getMonthStartDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'AllEvents'>;

export default function AllEventsScreen({ navigation, route }: Props) {
  const country = route.params?.country ?? 'korea';
  const [viewMode, setViewMode] = useState<EventViewMode>('list');
  const [regionFilter, setRegionFilter] = useState(ALL_REGION);
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const { events, today, regionFilters, isLoading, statusMessage } = useFestivalEvents();
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStartDate(today || new Date().toISOString().slice(0, 10)));

  useEffect(() => {
    if (today) setVisibleMonth(getMonthStartDate(today));
  }, [today]);

  const statusFilteredEvents = useMemo(
    () => events.filter((event) => matchesEventStatus(event, statusFilter, today)),
    [events, statusFilter, today],
  );

  const filteredEvents = useMemo(
    () =>
      statusFilteredEvents.filter((event) => {
        return regionFilter === ALL_REGION || getFestivalRegion(event.location) === regionFilter;
      }),
    [regionFilter, statusFilteredEvents],
  );

  const seoulCalendarEvents = useMemo(
    () => statusFilteredEvents.filter((event) => getFestivalRegion(event.location) === SEOUL_REGION),
    [statusFilteredEvents],
  );

  const moveCalendarMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const openEventDetail = (event: FestivalEventItem) => {
    navigation.navigate('EventDetails', { country, eventId: event.id });
  };

  const renderEvent = ({ item }: { item: FestivalEventItem }) => (
    <EventListItem event={item} onPress={() => openEventDetail(item)} />
  );

  return (
    <View style={styles.screen}>
      <AppHeader title="행사" onBack={() => navigation.navigate('Home')} />
      <FlatList
        data={viewMode === 'list' ? filteredEvents : []}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <EventFilterSection
              regionFilters={regionFilters}
              regionFilter={regionFilter}
              statusFilter={statusFilter}
              viewMode={viewMode}
              isLoading={isLoading}
              statusMessage={statusMessage}
              onRegionChange={setRegionFilter}
              onStatusChange={setStatusFilter}
              onViewModeChange={(mode) => {
                setViewMode(mode);
                if (mode === 'calendar') setRegionFilter(ALL_REGION);
              }}
            />

            {viewMode === 'calendar' ? (
              <EventCalendarSection
                events={seoulCalendarEvents}
                visibleMonth={visibleMonth}
                onMoveMonth={moveCalendarMonth}
                onSelectEvent={openEventDetail}
              />
            ) : null}
          </>
        }
        ListEmptyComponent={
          !isLoading && viewMode === 'list' ? (
            <EmptyState
              title="행사가 없습니다"
              description="다른 지역이나 행사 상태 조건을 선택해보세요."
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContent: {
    paddingBottom: 24,
  },
});
