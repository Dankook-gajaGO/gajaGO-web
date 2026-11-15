import { apiRequest } from './client';

export type FacilityCategory = '은행' | 'ATM' | '편의점' | '화장실' | '약국' | '지하철역' | '환전소';

export interface FacilityItem {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface FacilityNearbyResponse {
  items: FacilityItem[];
  offset: number;
  size: number;
  hasMore: boolean;
}

export interface GetNearbyFacilitiesParams {
  lat: number;
  lng: number;
  radius?: number;
  offset?: number;
  size?: number;
  categories?: FacilityCategory[];
}

// '전체' 탭에 함께 나오는 시설. 환전소는 서버가 별도(키워드) 검색이라 전용 탭에서만
export const facilityCategories: FacilityCategory[] = ['은행', 'ATM', '편의점', '화장실', '약국', '지하철역'];

export function getNearbyFacilities({
  lat,
  lng,
  radius = 3,
  offset = 0,
  size = 10,
  categories = facilityCategories,
}: GetNearbyFacilitiesParams) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
    offset: String(offset),
    size: String(size),
    categories: categories.join(','),
  });

  return apiRequest<FacilityNearbyResponse>(`/api/facilities/nearby?${params.toString()}`, {
    method: 'GET',
    auth: false,
  });
}
