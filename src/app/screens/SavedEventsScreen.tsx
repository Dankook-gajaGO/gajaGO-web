import { useCallback, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  createScheduleItem,
  deleteSavedFestival,
  getApiErrorMessage,
  getSavedFestivals,
  type SavedFestivalApi,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ToastMessage } from '../components/common/ToastMessage';
import type { RootStackParamList } from '../routes';
import { COLORS, radius, shadow } from '../theme';
import { getFallbackTodayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedEvents'>;

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return '일정 미정';
  if (!end || start === end) return start ?? '일정 미정';
  return `${start} - ${end}`;
}

function getScheduleDate(event: SavedFestivalApi) {
  return event.eventStartDate && /^\d{4}-\d{2}-\d{2}$/.test(event.eventStartDate)
    ? event.eventStartDate
    : getFallbackTodayKey();
}

export default function SavedEventsScreen({ navigation }: Props) {
  const [events, setEvents] = useState<SavedFestivalApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadSavedEvents = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage('');

    try {
      const response = await getSavedFestivals();
      setEvents(response.savedFestivals ?? []);
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSavedEvents();
    }, [loadSavedEvents])
  );

  const removeSavedEvent = async (event: SavedFestivalApi) => {
    setWorkingId(event.contentId);
    setStatusMessage('');

    try {
      await deleteSavedFestival(event.contentId);
      setEvents((items) => items.filter((item) => item.contentId !== event.contentId));
      setStatusMessage('삭제했어요');
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  const addToCalendar = async (event: SavedFestivalApi) => {
    const date = getScheduleDate(event);
    setWorkingId(event.contentId);
    setStatusMessage('');

    try {
      await createScheduleItem({
        date,
        type: 'FESTIVAL',
        title: event.title,
        festivalContentId: event.contentId,
        placeName: event.title,
        address: event.addr,
      });
      setStatusMessage(`${date} 일정에 추가했어요`);
      navigation.navigate('CalendarDetail', { country: 'korea', date });
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="저장한 행사" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={COLORS.teal} />
            <Text style={styles.loadingText}>저장한 행사를 불러오는 중입니다.</Text>
          </View>
        ) : null}

        {!isLoading && events.length === 0 ? (
          <EmptyState
            title="저장한 행사가 없습니다"
            description={statusMessage || '관심 있는 행사를 저장하면 이곳에서 확인할 수 있습니다.'}
            actionLabel="행사 둘러보기"
            onAction={() => navigation.navigate('AllEvents', { country: 'korea' })}
          />
        ) : null}

        {events.map((event) => {
          const disabled = workingId === event.contentId;
          return (
            <View key={event.contentId} style={[styles.card, shadow.card]}>
              {event.image ? <Image source={{ uri: event.image }} style={styles.image} /> : null}
              <View style={styles.cardBody}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.meta}>{formatDateRange(event.eventStartDate, event.eventEndDate)}</Text>
                <Text style={styles.address} numberOfLines={1}>
                  {event.addr || '주소 정보 없음'}
                </Text>

                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EventDetails', { country: 'korea', eventId: String(event.contentId) })}
                  >
                    <Feather name="file-text" size={15} color={COLORS.ink} />
                    <Text style={styles.actionText}>상세</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.actionButton, disabled ? styles.disabledButton : null]}
                    onPress={() => addToCalendar(event)}
                    disabled={disabled}
                  >
                    <Feather name="calendar" size={15} color={COLORS.ink} />
                    <Text style={styles.actionText}>일정 추가</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.removeButton, disabled ? styles.disabledButton : null]}
                    onPress={() => removeSavedEvent(event)}
                    disabled={disabled}
                  >
                    <Feather name="trash-2" size={15} color={COLORS.red} />
                    <Text style={styles.removeText}>삭제</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        {statusMessage && events.length > 0 ? (
          <ToastMessage message={statusMessage} tone={statusMessage.includes('못') ? 'error' : 'success'} />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  loadingWrap: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
  },
  card: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    marginBottom: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.card,
  },
  cardBody: {
    padding: 14,
  },
  title: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 23,
  },
  meta: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  address: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  actionButton: {
    minHeight: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },
  removeButton: {
    minHeight: 38,
    borderRadius: radius.md,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
