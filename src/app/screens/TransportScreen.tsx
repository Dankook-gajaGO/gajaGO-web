import { useCallback, useEffect, useRef } from 'react';
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
import type { PlaceCandidate } from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { AuthNotice } from '../components/transport/AuthNotice';
import { CandidateSection } from '../components/transport/CandidateSection';
import { ChatMessageList } from '../components/transport/ChatMessageList';
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
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Transport'>;

export default function TransportScreen({ navigation }: Props) {
  const chat = useTransportChat();
  const scrollRef = useRef<ScrollView | null>(null);

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

  const chooseCandidate = (kind: CandidateKind) => (candidate: PlaceCandidate) => {
    chat.chooseCandidate(kind, candidate);
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
        <RouteDetail route={chat.selectedRoute} />
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
