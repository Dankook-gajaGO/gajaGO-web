import { useEffect, useState } from 'react';
import { getFestivalList } from '../api';
import {
  festivalSummaryToEvent,
  sortFestivalEvents,
  type FestivalEventItem,
} from '../data/festivalEvents';

export function useHomeFestivalBanners() {
  const [events, setEvents] = useState<FestivalEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadBannerEvents() {
      setIsLoading(true);

      try {
        const response = await getFestivalList(1);
        if (!active) return;

        setEvents(sortFestivalEvents((response.festivals ?? []).map(festivalSummaryToEvent)).slice(0, 3));
      } catch {
        if (active) setEvents([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadBannerEvents();

    return () => {
      active = false;
    };
  }, []);

  return { events, isLoading };
}
