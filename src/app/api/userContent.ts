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

// 내 알러지 (회원 전용): 음식 화면에서 필터로 불러오고 저장
export function getMyAllergies() {
  return apiRequest<{ allergies: string[] }>('/api/member/allergies');
}

export function saveMyAllergies(allergies: string[]) {
  return apiRequest<{ allergies: string[] }>('/api/member/allergies', {
    method: 'PUT',
    body: { allergies },
  });
}

// 여행 가계부 (회원 전용). 금액은 원화
export interface ExpenseItem {
  id: number;
  spentOn: string;
  title: string;
  amount: number;
  category: string;
}

export function getExpenses() {
  return apiRequest<ExpenseItem[]>('/api/expenses');
}

export function addExpense(body: { spentOn: string; title: string; amount: number; category: string }) {
  return apiRequest<ExpenseItem>('/api/expenses', { method: 'POST', body });
}

export function deleteExpense(id: number) {
  return apiRequest<null>(`/api/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// 가계부 환산용 환율 (누구나). 서버가 12시간 캐시. krwPer: 1 외화 = N원
export function getExchangeRates() {
  return apiRequest<{ krwPer: Record<string, number>; updatedAt: string }>('/api/exchange-rates', { auth: false });
}

export function updateExpense(id: number, body: { spentOn: string; title: string; amount: number; category: string }) {
  return apiRequest<ExpenseItem>(`/api/expenses/${encodeURIComponent(id)}`, { method: 'PUT', body });
}

// 여행 정보 (회원 전용). 이 기간의 지출이 이 여행의 가계부
export interface TripItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
}

export function getTrips() {
  return apiRequest<TripItem[]>('/api/trips');
}

export function addTrip(body: { name: string; startDate: string; endDate: string }) {
  return apiRequest<TripItem>('/api/trips', { method: 'POST', body });
}

export function deleteTrip(id: number) {
  return apiRequest<null>(`/api/trips/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
