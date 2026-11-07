import { apiRequest, getAuthToken, hydrateAuthToken, type PlaceCandidate, type TransportRoute } from '../api';

// 최근 교통 경로는 회원별로 서버 DB에 저장 (다른 기기·재설치 후에도 유지). 비회원은 기록하지 않음
export interface TransportRouteHistoryItem {
  id: string;
  savedAt: string;
  requestId: number | null;
  departure: PlaceCandidate;
  destination: PlaceCandidate;
  route: TransportRoute;
}

const HISTORY_PATH = '/api/transport/history';

async function isMember() {
  return Boolean(getAuthToken() ?? (await hydrateAuthToken()));
}

export async function getRecentTransportRoutes() {
  if (!(await isMember())) return [];
  try {
    return await apiRequest<TransportRouteHistoryItem[]>(HISTORY_PATH);
  } catch {
    return [];
  }
}

export async function saveRecentTransportRoute(
  requestId: number | null,
  departure: PlaceCandidate,
  destination: PlaceCandidate,
  route: TransportRoute
) {
  if (!(await isMember())) return [];
  return apiRequest<TransportRouteHistoryItem[]>(HISTORY_PATH, {
    method: 'POST',
    body: { requestId, departure, destination, route },
  });
}

export async function clearRecentTransportRoutes() {
  if (!(await isMember())) return;
  await apiRequest<unknown>(HISTORY_PATH, { method: 'DELETE' });
}
