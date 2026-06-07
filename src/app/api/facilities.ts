import { apiRequest } from './client';

export type FacilityCategory = '은행' | 'ATM' | '편의점' | '화장실';

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

export const facilityCategories: FacilityCategory[] = ['은행', 'ATM', '편의점', '화장실'];

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
