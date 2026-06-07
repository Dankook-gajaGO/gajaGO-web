import { useEffect, useMemo, useState } from 'react';
import { getFestivalList, getServerTodayKey } from '../api';
import {
  festivalSummaryToEvent,
  getFestivalRegion,
  sortFestivalEvents,
  type FestivalEventItem,
} from '../data/festivalEvents';
import { addDays } from '../utils/date';

export type EventStatusFilter = 'all' | 'ongoing' | 'upcoming' | 'endingSoon';

export const ALL_REGION = '전체';
export const SEOUL_REGION = '서울';

export const eventStatusFilters: Array<{ id: EventStatusFilter; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'ongoing', label: '진행 중' },
  { id: 'upcoming', label: '곧 시작' },
  { id: 'endingSoon', label: '종료 임박' },
];

function getEventEndDate(event: FestivalEventItem) {
  return event.endDate || event.startDate;
}

export function matchesEventStatus(event: FestivalEventItem, filter: EventStatusFilter, today: string) {
  if (filter === 'all') return true;
  if (!today) return false;

  const startDate = event.startDate;
  const endDate = getEventEndDate(event);
  if (!startDate) return false;

  if (filter === 'ongoing') {
    return startDate <= today && endDate >= today;
  }

  if (filter === 'upcoming') {
    return startDate > today && startDate <= addDays(today, 7);
  }

  return startDate <= today && endDate >= today && endDate <= addDays(today, 3);
}

export function useFestivalEvents() {
  const [events, setEvents] = useState<FestivalEventItem[]>([]);
  const [today, setToday] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadEvents() {
      setIsLoading(true);
      setStatusMessage('');

      try {
        const [serverToday, response] = await Promise.all([
          getServerTodayKey(),
          getFestivalList(12),
        ]);
        if (!active) return;

        setToday(serverToday);
        setEvents(sortFestivalEvents((response.festivals ?? []).map(festivalSummaryToEvent)));
      } catch {
        if (!active) return;

        setEvents([]);
        setStatusMessage('행사 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadEvents();

    return () => {
      active = false;
    };
  }, []);

  const regionFilters = useMemo(() => {
    const regions = Array.from(new Set(events.map((event) => getFestivalRegion(event.location)))).sort();
    return [ALL_REGION, ...regions];
  }, [events]);

  return {
    events,
    today,
    regionFilters,
    isLoading,
    statusMessage,
  };
}
