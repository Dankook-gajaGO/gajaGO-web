import type { PlaceCandidate, TransportRoute } from '../api';

export type TransportChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export interface TransportSession {
  messages: TransportChatMessage[];
  requestId: number | null;
  departureCandidates: PlaceCandidate[];
  destinationCandidates: PlaceCandidate[];
  selectedDeparture: PlaceCandidate | null;
  selectedDestination: PlaceCandidate | null;
  routes: TransportRoute[];
  selectedRouteId: string | null;
}

let latestTransportSession: TransportSession | null = null;

export function getLatestTransportSession() {
  return latestTransportSession;
}

export function saveLatestTransportSession(session: TransportSession) {
  latestTransportSession = session;
}

export function clearLatestTransportSession() {
  latestTransportSession = null;
}
