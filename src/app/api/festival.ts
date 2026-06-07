import { apiRequest } from './client';

export interface FestivalSummaryApi {
  contentId: number;
  title: string;
  image?: string | null;
  eventStartDate?: string | null;
  eventEndDate?: string | null;
  addr?: string | null;
}

interface FestivalListResponse {
  festivals?: FestivalSummaryApi[];
}

export interface FestivalDetailResponse extends FestivalSummaryApi {
  zipCode?: number | null;
  tel?: string | null;
  fee?: string | null;
  eventHomepage?: string | null;
  overview?: string | null;
}

export function getFestivalList(months: number) {
  return apiRequest<FestivalListResponse>(`/api/festival/festivalList?months=${encodeURIComponent(months)}`, {
    auth: false,
  });
}

export function getFestivalDetail(contentId: string | number) {
  return apiRequest<FestivalDetailResponse>(
    `/api/festival/festivalDetail?contentId=${encodeURIComponent(contentId)}`,
    {
      method: 'POST',
      auth: false,
    }
  );
}
