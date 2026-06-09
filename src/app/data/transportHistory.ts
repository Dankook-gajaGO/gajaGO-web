import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PlaceCandidate, TransportRoute } from '../api';

const STORAGE_KEY = 'gajago.transport.recentRoutes';
const MAX_RECENT_ROUTES = 5;

export interface TransportRouteHistoryItem {
  id: string;
  savedAt: string;
  requestId: number | null;
  departure: PlaceCandidate;
  destination: PlaceCandidate;
  route: TransportRoute;
}

function buildHistoryId(
  requestId: number | null,
  departure: PlaceCandidate,
  destination: PlaceCandidate,
  route: TransportRoute
) {
  return [
    requestId ?? 'local',
    route.id,
    departure.name,
    destination.name,
    route.travelTime,
    route.fare,
  ].join('|');
}

function isHistoryItem(value: unknown): value is TransportRouteHistoryItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.savedAt === 'string' &&
    Boolean(record.departure) &&
    Boolean(record.destination) &&
    Boolean(record.route)
  );
}

export async function getRecentTransportRoutes() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isHistoryItem).slice(0, MAX_RECENT_ROUTES);
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
  const nextItem: TransportRouteHistoryItem = {
    id: buildHistoryId(requestId, departure, destination, route),
    savedAt: new Date().toISOString(),
    requestId,
    departure,
    destination,
    route,
  };

  const current = await getRecentTransportRoutes();
  const nextItems = [nextItem, ...current.filter((item) => item.id !== nextItem.id)].slice(
    0,
    MAX_RECENT_ROUTES
  );

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  return nextItems;
}

export async function clearRecentTransportRoutes() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
