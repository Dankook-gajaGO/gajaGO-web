import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  createScheduleItem,
  getApiErrorMessage,
  getServerTodayKey,
  type PlaceCandidate,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { ToastMessage } from '../components/common/ToastMessage';
import { AuthNotice } from '../components/transport/AuthNotice';
import { CandidateSection } from '../components/transport/CandidateSection';
import { ChatMessageList } from '../components/transport/ChatMessageList';
import { RecentRoutePanel } from '../components/transport/RecentRoutePanel';
import { RouteDetail } from '../components/transport/RouteDetail';
import { RouteList } from '../components/transport/RouteList';
import { SuggestionList } from '../components/transport/SuggestionList';
import { TransportInputBar } from '../components/transport/TransportInputBar';
import { TransportIntroCard } from '../components/transport/TransportIntroCard';
import {
  transportSuggestions,
  useTransportChat,
  type CandidateKind,
} from '../hooks/useTransportChat';
import {
  clearRecentTransportRoutes,
  getRecentTransportRoutes,
  saveRecentTransportRoute,
  type TransportRouteHistoryItem,
} from '../data/transportHistory';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';
import { getFallbackTodayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Transport'>;

function buildTransportScheduleTitle(departure: PlaceCandidate, destination: PlaceCandidate) {
  return `${departure.name} → ${destination.name}`;
}

export default function TransportScreen({ navigation }: Props) {
  const chat = useTransportChat();
  const scrollRef = useRef<ScrollView | null>(null);
  const lastSavedRouteRef = useRef('');
  const [recentRoutes, setRecentRoutes] = useState<TransportRouteHistoryItem[]>([]);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [routeStatusMessage, setRouteStatusMessage] = useState('');

  const loadRecentRoutes = useCallback(async () => {
    const items = await getRecentTransportRoutes();
    setRecentRoutes(items);
  }, []);

  const scrollToBottom = useCallback((animated = true) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated });
    });
  }, []);

  const scrollToBottomAfterKeyboard = useCallback(() => {
    scrollToBottom();
    setTimeout(() => scrollToBottom(), 250);
  }, [scrollToBottom]);

  useEffect(() => {
    void loadRecentRoutes();
  }, [loadRecentRoutes]);

  useEffect(() => {
    scrollToBottom();
  }, [
    chat.messages.length,
    chat.departureCandidates.length,
    chat.destinationCandidates.length,
    chat.routes.length,
    chat.selectedRouteId,
    chat.isInitialLoading,
    chat.isRoutesLoading,
    scrollToBottom,
  ]);

  useEffect(() => {
    if (!chat.selectedRoute || !chat.selectedDeparture || !chat.selectedDestination) return;

    const saveKey = [
      chat.requestId ?? 'local',
      chat.selectedRoute.id,
      chat.selectedDeparture.name,
      chat.selectedDestination.name,
    ].join('|');

    if (lastSavedRouteRef.current === saveKey) return;
    lastSavedRouteRef.current = saveKey;

    void saveRecentTransportRoute(
      chat.requestId,
      chat.selectedDeparture,
      chat.selectedDestination,
      chat.selectedRoute
    ).then(setRecentRoutes);
  }, [chat.requestId, chat.selectedDeparture, chat.selectedDestination, chat.selectedRoute]);

  const chooseCandidate = (kind: CandidateKind) => (candidate: PlaceCandidate) => {
    chat.chooseCandidate(kind, candidate);
  };

  const restoreRecentRoute = (item: TransportRouteHistoryItem) => {
    chat.restoreHistoryItem(item);
    setRouteStatusMessage('최근 경로를 불러왔어요');
    scrollToBottom();
  };

  const clearRecentRoutes = async () => {
    await clearRecentTransportRoutes();
    setRecentRoutes([]);
    setRouteStatusMessage('최근 경로를 비웠어요');
  };

  const saveSelectedRouteToSchedule = async () => {
    if (!chat.selectedRoute || !chat.selectedDeparture || !chat.selectedDestination || isSavingSchedule) return;

    setIsSavingSchedule(true);
    setRouteStatusMessage('');

    try {
      const date = await getServerTodayKey().catch(() => getFallbackTodayKey());
      await createScheduleItem({
        date,
        type: 'TRANSPORT',
        title: buildTransportScheduleTitle(chat.selectedDeparture, chat.selectedDestination),
        memo: chat.selectedRoute.detail,
        placeName: chat.selectedDestination.name,
        address: chat.selectedDestination.address,
        lat: chat.selectedDestination.lat,
        lng: chat.selectedDestination.lng,
      });
      setRouteStatusMessage(`${date} 일정에 저장했어요`);
    } catch (error) {
      setRouteStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsSavingSchedule(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <AppHeader title="교통 경로" onBack={() => navigation.goBack()} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        contentContainerStyle={styles.content}
      >
        <TransportIntroCard onReset={chat.resetSession} />
        <RecentRoutePanel
          items={recentRoutes}
          onSelect={restoreRecentRoute}
          onClear={clearRecentRoutes}
        />
        <SuggestionList suggestions={transportSuggestions} onSelect={(item) => chat.sendMessage(item)} />

        {chat.isAuthReady && !chat.isAuthorized ? (
          <AuthNotice onLogin={() => navigation.replace('Login')} />
        ) : null}

        <ChatMessageList messages={chat.messages} />

        {chat.isInitialLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={COLORS.teal} />
            <Text style={styles.loadingText}>후보지를 찾는 중입니다.</Text>
          </View>
        ) : null}

        {chat.departureCandidates.length > 0 ? (
          <CandidateSection
            title="출발지 후보"
            candidates={chat.departureCandidates}
            selected={chat.selectedDeparture}
            onSelect={chooseCandidate('departure')}
          />
        ) : null}

        {chat.destinationCandidates.length > 0 ? (
          <CandidateSection
            title="목적지 후보"
            candidates={chat.destinationCandidates}
            selected={chat.selectedDestination}
            onSelect={chooseCandidate('destination')}
          />
        ) : null}

        {chat.errorMessage ? <Text style={styles.errorText}>{chat.errorMessage}</Text> : null}

        <RouteList
          routes={chat.routes}
          selectedRouteId={chat.selectedRouteId}
          isLoading={chat.isRoutesLoading}
          onSelectRoute={chat.setSelectedRouteId}
        />
        <RouteDetail
          route={chat.selectedRoute}
          departure={chat.selectedDeparture}
          destination={chat.selectedDestination}
          isSavingSchedule={isSavingSchedule}
          onSaveToSchedule={saveSelectedRouteToSchedule}
        />

        {routeStatusMessage ? <ToastMessage message={routeStatusMessage} /> : null}
      </ScrollView>

      <TransportInputBar
        message={chat.message}
        isLoading={chat.isInitialLoading}
        onChangeMessage={chat.setMessage}
        onFocus={scrollToBottomAfterKeyboard}
        onSend={() => chat.sendMessage()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  loadingRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
  },
});
