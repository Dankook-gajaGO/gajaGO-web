import { addDays, formatShortDate } from '../utils/date';

export interface Place {
  id: string;
  name: string;
  address: string;
  category: string;
}

export interface ScheduleDay {
  date: string;
  label: string;
  places: Place[];
}

export function createScheduleDay(date: string): ScheduleDay {
  return {
    date,
    label: formatShortDate(date),
    places: [],
  };
}

export function createEmptyScheduleDays(startDate: string, count = 5): ScheduleDay[] {
  return Array.from({ length: count }, (_, index) => createScheduleDay(addDays(startDate, index)));
}

export function ensureScheduleDate(days: ScheduleDay[], date: string) {
  return days.some((day) => day.date === date) ? days : createEmptyScheduleDays(date);
}
