import { apiRequest } from './client';

export type ScheduleItemType = 'MEMO' | 'FESTIVAL' | 'CUSTOM' | 'PLACE' | 'TRANSPORT';

export interface SavedFestivalApi {
  savedFestivalId: number;
  contentId: number;
  title: string;
  image?: string | null;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
  addr?: string | null;
  createdAt?: string | null;
}

export interface SavedFestivalListResponse {
  savedFestivals: SavedFestivalApi[];
}

export interface ScheduleItemApi {
  itemId: number;
  date: string;
  type: ScheduleItemType;
  title: string;
  memo?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  festivalContentId?: number | null;
  festivalTitle?: string | null;
  festivalImage?: string | null;
  festivalAddr?: string | null;
  placeName?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ScheduleItemsResponse {
  items: ScheduleItemApi[];
}

export interface ScheduleItemRequest {
  date: string;
  type?: ScheduleItemType;
  title: string;
  memo?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  festivalContentId?: number | null;
  placeName?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  sortOrder?: number | null;
}

export function getSavedFestivals() {
  return apiRequest<SavedFestivalListResponse>('/api/saved-festivals');
}

export function saveFestival(contentId: number) {
  return apiRequest<SavedFestivalApi>(`/api/saved-festivals/${encodeURIComponent(contentId)}`, {
    method: 'POST',
  });
}

export function deleteSavedFestival(contentId: number) {
  return apiRequest<null>(`/api/saved-festivals/${encodeURIComponent(contentId)}`, {
    method: 'DELETE',
  });
}

export function getScheduleItems(date: string) {
  return apiRequest<ScheduleItemsResponse>(`/api/schedules?date=${encodeURIComponent(date)}`);
}

export function getMonthlyScheduleItems(year: number, month: number) {
  return apiRequest<ScheduleItemsResponse>(
    `/api/schedules/month?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`
  );
}

export function createScheduleItem(body: ScheduleItemRequest) {
  return apiRequest<ScheduleItemApi>('/api/schedules/items', {
    method: 'POST',
    body,
  });
}

export function updateScheduleItem(itemId: number, body: ScheduleItemRequest) {
  return apiRequest<ScheduleItemApi>(`/api/schedules/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body,
  });
}

export function deleteScheduleItem(itemId: number) {
  return apiRequest<null>(`/api/schedules/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}
