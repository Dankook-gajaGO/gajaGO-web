import { useEffect, useState } from 'react';
import {
  ApiError,
  createTransportInitialRequest,
  getApiErrorMessage,
  getAuthToken,
  getTransportRoutes,
  hydrateAuthToken,
  type PlaceCandidate,
  type TransportRoute,
} from '../api';
import {
  clearLatestTransportSession,
  getLatestTransportSession,
  saveLatestTransportSession,
  type TransportChatMessage,
} from '../data/transportSession';
import type { TransportRouteHistoryItem } from '../data/transportHistory';

export type CandidateKind = 'departure' | 'destination';

const authRequiredMessage = '교통 챗봇은 로그인이 필요합니다. 로그인 후 다시 시도해주세요.';

export const transportSuggestions = [
  '서울역에서 경복궁까지 다리를 다쳤는데 어떻게 가?',
  '단국대학교에서 서울역 가려면 짐이 많은데 어떻게 가?',
  '공항에서 명동까지 환승 적은 경로 알려줘',
];

export const initialTransportMessages: TransportChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: '이동 상황을 알려주시면 출발지와 목적지 후보를 찾은 뒤 경로를 추천해드릴게요.',
  },
];

export function useTransportChat() {
  const latestSession = getLatestTransportSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<TransportChatMessage[]>(
    latestSession?.messages ?? initialTransportMessages
  );
  const [requestId, setRequestId] = useState<number | null>(latestSession?.requestId ?? null);
  const [departureCandidates, setDepartureCandidates] = useState<PlaceCandidate[]>(
    latestSession?.departureCandidates ?? []
  );
  const [destinationCandidates, setDestinationCandidates] = useState<PlaceCandidate[]>(
    latestSession?.destinationCandidates ?? []
  );
  const [selectedDeparture, setSelectedDeparture] = useState<PlaceCandidate | null>(
    latestSession?.selectedDeparture ?? null
  );
  const [selectedDestination, setSelectedDestination] = useState<PlaceCandidate | null>(
    latestSession?.selectedDestination ?? null
  );
  const [routes, setRoutes] = useState<TransportRoute[]>(latestSession?.routes ?? []);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(
    latestSession?.selectedRouteId ?? null
  );
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isRoutesLoading, setIsRoutesLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthReady, setIsAuthReady] = useState(() => Boolean(getAuthToken()));
  const [isAuthorized, setIsAuthorized] = useState(() => Boolean(getAuthToken()));

  const selectedRoute = routes.find((route) => route.id === selectedRouteId) ?? null;

  useEffect(() => {
    let mounted = true;

    void hydrateAuthToken().then((token) => {
      if (!mounted) return;
      setIsAuthorized(Boolean(token));
      setIsAuthReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const hasSessionData =
      messages.length > initialTransportMessages.length ||
      requestId !== null ||
      departureCandidates.length > 0 ||
      destinationCandidates.length > 0 ||
      routes.length > 0;

    if (!hasSessionData) return;

    saveLatestTransportSession({
      messages,
      requestId,
      departureCandidates,
      destinationCandidates,
      selectedDeparture,
      selectedDestination,
      routes,
      selectedRouteId,
    });
  }, [
    messages,
    requestId,
    departureCandidates,
    destinationCandidates,
    selectedDeparture,
    selectedDestination,
    routes,
    selectedRouteId,
  ]);

  const addAssistantMessage = (text: string) => {
    setMessages((items) => [
      ...items,
      { id: `assistant-${Date.now()}-${items.length}`, role: 'assistant', text },
    ]);
  };

  const requireAuthToken = async (showChatMessage = false) => {
    const token = getAuthToken() ?? (await hydrateAuthToken());
    const authorized = Boolean(token);
    setIsAuthReady(true);
    setIsAuthorized(authorized);

    if (!authorized) {
      setErrorMessage(authRequiredMessage);
      if (showChatMessage) addAssistantMessage(authRequiredMessage);
    }

    return authorized;
  };

  const handleTransportError = (error: unknown) => {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      const authMessage = '로그인 인증이 만료되었거나 누락되었습니다. 다시 로그인해주세요.';
      setIsAuthorized(false);
      setErrorMessage(authMessage);
      addAssistantMessage(authMessage);
      return;
    }

    setErrorMessage(getApiErrorMessage(error));
    addAssistantMessage('교통 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.');
  };

  const loadRoutes = async (
    nextRequestId: number,
    nextDeparture: PlaceCandidate,
    nextDestination: PlaceCandidate
  ) => {
    if (!(await requireAuthToken())) return;

    setIsRoutesLoading(true);
    setErrorMessage('');
    setRoutes([]);
    setSelectedRouteId(null);

    try {
      const response = await getTransportRoutes({
        requestId: nextRequestId,
        selectedDeparture: nextDeparture,
        selectedDestination: nextDestination,
      });

      setRoutes(response.routes ?? []);
      addAssistantMessage('추천 경로를 가져왔습니다. 요약과 추천 사유를 보고 하나를 선택해주세요.');
    } catch (error) {
      handleTransportError(error);
    } finally {
      setIsRoutesLoading(false);
    }
  };

  const chooseCandidate = (kind: CandidateKind, candidate: PlaceCandidate) => {
    const nextDeparture = kind === 'departure' ? candidate : selectedDeparture;
    const nextDestination = kind === 'destination' ? candidate : selectedDestination;

    if (kind === 'departure') setSelectedDeparture(candidate);
    if (kind === 'destination') setSelectedDestination(candidate);

    if (requestId !== null && nextDeparture && nextDestination) {
      void loadRoutes(requestId, nextDeparture, nextDestination);
    }
  };

  const sendMessage = async (text = message) => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || isInitialLoading) return;

    if (!(await requireAuthToken(true))) return;

    setMessage('');
    setErrorMessage('');
    setRequestId(null);
    setDepartureCandidates([]);
    setDestinationCandidates([]);
    setSelectedDeparture(null);
    setSelectedDestination(null);
    setRoutes([]);
    setSelectedRouteId(null);
    setMessages((items) => [...items, { id: `user-${Date.now()}`, role: 'user', text: trimmed }]);
    setIsInitialLoading(true);

    try {
      const response = await createTransportInitialRequest(trimmed);
      setRequestId(response.requestId);
      setDepartureCandidates(response.departureCandidates);
      setDestinationCandidates(response.destinationCandidates);

      if (response.extractedInfo) {
        addAssistantMessage(
          `파악한 이동 정보: 출발지 ${response.extractedInfo.departure}, 목적지 ${response.extractedInfo.destination}, 조건 ${response.extractedInfo.constraints}`
        );
      }

      if (response.departureCandidates.length > 0 || response.destinationCandidates.length > 0) {
        addAssistantMessage('출발지와 목적지 후보를 찾았습니다. 각각 하나씩 선택해주세요.');
      } else {
        addAssistantMessage('장소 후보를 찾지 못했습니다. 출발지와 목적지를 조금 더 구체적으로 입력해주세요.');
      }
    } catch (error) {
      handleTransportError(error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const resetSession = () => {
    clearLatestTransportSession();
    setMessage('');
    setMessages(initialTransportMessages);
    setRequestId(null);
    setDepartureCandidates([]);
    setDestinationCandidates([]);
    setSelectedDeparture(null);
    setSelectedDestination(null);
    setRoutes([]);
    setSelectedRouteId(null);
    setErrorMessage('');
  };

  const restoreHistoryItem = (item: TransportRouteHistoryItem) => {
    setMessage('');
    setRequestId(item.requestId);
    setDepartureCandidates([item.departure]);
    setDestinationCandidates([item.destination]);
    setSelectedDeparture(item.departure);
    setSelectedDestination(item.destination);
    setRoutes([item.route]);
    setSelectedRouteId(item.route.id);
    setErrorMessage('');
    setMessages([
      initialTransportMessages[0],
      {
        id: `history-user-${Date.now()}`,
        role: 'user',
        text: `${item.departure.name}에서 ${item.destination.name}까지 최근 저장 경로`,
      },
      {
        id: `history-assistant-${Date.now()}`,
        role: 'assistant',
        text: '최근 선택했던 교통 경로를 다시 불러왔습니다. 상세 이동 순서와 일정 저장을 확인해보세요.',
      },
    ]);
  };

  return {
    message,
    setMessage,
    messages,
    departureCandidates,
    destinationCandidates,
    selectedDeparture,
    selectedDestination,
    requestId,
    routes,
    selectedRoute,
    selectedRouteId,
    setSelectedRouteId,
    isInitialLoading,
    isRoutesLoading,
    errorMessage,
    isAuthReady,
    isAuthorized,
    chooseCandidate,
    sendMessage,
    resetSession,
    restoreHistoryItem,
  };
}
