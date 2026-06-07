import { apiRequest } from './client';

export interface PlaceCandidate {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface TransitExtractedInfo {
  departure: string;
  destination: string;
  constraints: string;
}

interface TransportInitialResult {
  requestId: number | null;
  departureCandidates: PlaceCandidate[];
  destinationCandidates: PlaceCandidate[];
  extractedInfo?: TransitExtractedInfo;
}

interface TransportRouteRequest {
  requestId: number;
  selectedDestination: PlaceCandidate;
  selectedDeparture: PlaceCandidate;
}

export interface TransportRoute {
  id: string;
  reason: string;
  transfers: number;
  walkingDistance: number;
  rank: number;
  travelTime: number;
  fare: number;
  detail: string;
}

interface TransportRoutesResult {
  requestId: number | null;
  routes: TransportRoute[];
  status?: string;
  dataCount?: number;
}

type RecordValue = Record<string, unknown>;

function isRecord(value: unknown): value is RecordValue {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(record: RecordValue, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return fallback;
}

function readNumber(record: RecordValue, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  }
  return fallback;
}

function readOptionalNumber(record: RecordValue, keys: string[]) {
  const value = readNumber(record, keys, NaN);
  return Number.isFinite(value) ? value : null;
}

function readArray(record: RecordValue, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeCandidate(value: unknown): PlaceCandidate | null {
  if (!isRecord(value)) return null;

  const lat = readOptionalNumber(value, ['lat', 'latitude', 'y']);
  const lng = readOptionalNumber(value, ['lng', 'lon', 'longitude', 'x']);

  if (lat === null || lng === null) return null;

  return {
    name: readString(value, ['name', 'placeName', 'place_name'], '이름 없는 장소'),
    address: readString(value, ['address', 'roadAddress', 'road_address'], '주소 정보 없음'),
    lat,
    lng,
  };
}

function normalizeCandidates(items: unknown[]) {
  return items.map(normalizeCandidate).filter((item): item is PlaceCandidate => item !== null);
}

function normalizeInitialResponse(response: unknown): TransportInitialResult {
  if (!isRecord(response)) {
    return { requestId: null, departureCandidates: [], destinationCandidates: [] };
  }

  const extractedInfo =
    typeof response.departure === 'string' || typeof response.destination === 'string'
      ? {
          departure: readString(response, ['departure'], 'unknown'),
          destination: readString(response, ['destination'], 'unknown'),
          constraints: readString(response, ['constraints'], 'none'),
        }
      : undefined;

  return {
    requestId: readOptionalNumber(response, ['requestId', 'request_id']),
    departureCandidates: normalizeCandidates(
      readArray(response, ['departurecandidates', 'departureCandidates', 'departure_candidates'])
    ),
    destinationCandidates: normalizeCandidates(
      readArray(response, ['destinationcandidates', 'destinationCandidates', 'destination_candidates'])
    ),
    extractedInfo,
  };
}

function normalizeRoute(value: unknown, index: number): TransportRoute | null {
  if (!isRecord(value)) return null;

  return {
    id: readString(value, ['id', 'path_id', 'pathId'], `${index + 1}`),
    reason: readString(value, ['reason'], '여러 기준을 종합해 추천한 경로입니다.'),
    transfers: readNumber(value, ['transfers']),
    walkingDistance: readNumber(value, ['walkingDistance', 'walking_distance']),
    rank: readNumber(value, ['rank'], index + 1),
    travelTime: readNumber(value, ['travelTime', 'travel_time']),
    fare: readNumber(value, ['fare']),
    detail: readString(value, ['detail']),
  };
}

function normalizeRoutesResponse(response: unknown): TransportRoutesResult {
  if (!isRecord(response)) {
    return { requestId: null, routes: [] };
  }

  const routeItems = readArray(response, ['routes', 'data', 'routeSummaries', 'route_summaries']);

  return {
    requestId: readOptionalNumber(response, ['requestId', 'request_id']),
    routes: routeItems.map(normalizeRoute).filter((item): item is TransportRoute => item !== null),
    status: readString(response, ['status']),
    dataCount: readNumber(response, ['dataCount', 'data_count'], 0),
  };
}

export async function createTransportInitialRequest(message: string) {
  const response = await apiRequest<unknown>('/api/transport/InitialRequest', {
    method: 'POST',
    body: { message },
  });

  return normalizeInitialResponse(response);
}

export async function getTransportRoutes(payload: TransportRouteRequest) {
  const response = await apiRequest<unknown>('/api/transport/routes', {
    method: 'POST',
    body: payload,
  });

  return normalizeRoutesResponse(response);
}
