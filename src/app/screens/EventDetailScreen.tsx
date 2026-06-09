import { useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  createScheduleItem,
  deleteSavedFestival,
  getApiErrorMessage,
  getFestivalDetail,
  getSavedFestivals,
  saveFestival,
  type FestivalDetailResponse,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import { Screen } from '../components/common/Screen';
import { ToastMessage } from '../components/common/ToastMessage';
import { festivalDetailToEvent, type FestivalEventItem } from '../data/festivalEvents';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';
import { getFallbackTodayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'EventDetails'>;

function extractHomepageUrl(value?: string | null) {
  const text = value?.trim();
  if (!text) return '';

  const hrefMatch = text.match(/href=["']?([^"'\s>]+)/i);
  const urlMatch = text.match(/https?:\/\/[^\s"'<>]+/i);
  const wwwMatch = text.match(/www\.[^\s"'<>]+/i);
  const candidate = hrefMatch?.[1] ?? urlMatch?.[0] ?? wwwMatch?.[0] ?? '';
  const cleaned = candidate.replace(/&amp;/g, '&').replace(/[)\].,!?]+$/, '');

  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (/^www\./i.test(cleaned)) return `https://${cleaned}`;
  return '';
}

function getEventScheduleDate(event: FestivalEventItem) {
  return /^\d{4}-\d{2}-\d{2}$/.test(event.startDate) ? event.startDate : getFallbackTodayKey();
}

export default function EventDetailScreen({ navigation, route }: Props) {
  const country = route.params?.country ?? 'korea';
  const eventId = route.params?.eventId;
  const [event, setEvent] = useState<FestivalEventItem | null>(null);
  const [detail, setDetail] = useState<FestivalDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      if (!eventId) {
        setEvent(null);
        setDetail(null);
        setStatusMessage('행사를 불러오지 못했어요');
        return;
      }

      setIsLoading(true);
      setStatusMessage('');

      try {
        const response = await getFestivalDetail(eventId);
        if (!active) return;

        const nextEvent = festivalDetailToEvent(response);
        setDetail(response);
        setEvent(nextEvent);

        try {
          const savedResponse = await getSavedFestivals();
          if (active) {
            setIsSaved(savedResponse.savedFestivals.some((item) => item.contentId === nextEvent.contentId));
          }
        } catch {
          if (active) setIsSaved(false);
        }
      } catch {
        if (!active) return;

        setEvent(null);
        setDetail(null);
        setStatusMessage('불러오지 못했어요');
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadDetail();

    return () => {
      active = false;
    };
  }, [eventId]);

  const homepageUrl = extractHomepageUrl(detail?.eventHomepage);

  const openHomepage = () => {
    if (homepageUrl) void Linking.openURL(homepageUrl);
  };

  const toggleSaved = async () => {
    if (!event || isSaving) return;

    setIsSaving(true);
    setStatusMessage('');

    try {
      if (isSaved) {
        await deleteSavedFestival(event.contentId);
        setIsSaved(false);
        setStatusMessage('저장을 취소했어요');
      } else {
        await saveFestival(event.contentId);
        setIsSaved(true);
        setStatusMessage('저장했어요');
      }
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const addToCalendar = async () => {
    if (!event || isAddingSchedule) return;

    const date = getEventScheduleDate(event);
    setIsAddingSchedule(true);
    setStatusMessage('');

    try {
      await createScheduleItem({
        date,
        type: 'FESTIVAL',
        title: event.title,
        festivalContentId: event.contentId,
        placeName: event.title,
        address: event.location,
      });
      setStatusMessage(`${date} 일정에 추가했어요`);
      navigation.navigate('CalendarDetail', { country, date });
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsAddingSchedule(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="행사 상세" onBack={() => navigation.goBack()} />
      <Screen scroll style={styles.screen} contentContainerStyle={styles.content}>
        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={COLORS.teal} />
            <Text style={styles.loadingText}>행사 상세 정보를 불러오는 중입니다.</Text>
          </View>
        ) : null}

        {!isLoading && !event ? (
          <EmptyState
            title="행사 상세 정보가 없습니다"
            description={statusMessage || '목록에서 다른 행사를 선택해보세요.'}
          />
        ) : null}

        {event ? (
          <>
            <Image source={{ uri: event.image }} style={styles.heroImage} />
            <View style={styles.titleBlock}>
              <View style={[styles.tag, { backgroundColor: event.tagColor }]}>
                <Text style={styles.tagText}>{event.tag}</Text>
              </View>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.subtitle}>{event.subtitle}</Text>
            </View>

            <View style={styles.infoCard}>
              <InfoRow icon="calendar" label="기간" value={event.date} />
              <InfoRow icon="clock" label="요금" value={detail?.fee || '정보 없음'} />
              <InfoRow icon="map-pin" label="위치" value={event.location} />
              <InfoRow icon="phone" label="문의" value={detail?.tel || '정보 없음'} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>소개</Text>
              <Text style={styles.description}>{detail?.overview || '상세 소개 정보가 없습니다.'}</Text>
            </View>

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryButton, isSaving ? styles.disabledButton : null]}
                onPress={toggleSaved}
                disabled={isSaving}
              >
                <Feather name="heart" size={17} color={COLORS.white} />
                <Text style={styles.primaryText}>{isSaved ? '저장됨' : '저장'}</Text>
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, isAddingSchedule ? styles.disabledButton : null]}
                onPress={addToCalendar}
                disabled={isAddingSchedule}
              >
                <Feather name="calendar" size={17} color={COLORS.ink} />
                <Text style={styles.secondaryText}>일정 추가</Text>
              </Pressable>

              {homepageUrl ? (
                <Pressable style={styles.secondaryButton} onPress={openHomepage}>
                  <Feather name="external-link" size={17} color={COLORS.ink} />
                  <Text style={styles.secondaryText}>홈페이지</Text>
                </Pressable>
              ) : null}
            </View>

            {statusMessage ? (
              <View style={styles.toastWrap}>
                <ToastMessage
                  message={statusMessage}
                  tone={statusMessage.includes('못') ? 'error' : 'success'}
                />
              </View>
            ) : null}
          </>
        ) : null}
      </Screen>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: 'calendar' | 'clock' | 'map-pin' | 'phone';
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Feather name={icon} size={17} color={COLORS.teal} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    paddingBottom: 32,
  },
  loadingWrap: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 10,
  },
  heroImage: {
    width: '100%',
    height: 260,
    backgroundColor: COLORS.card,
  },
  titleBlock: {
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 10,
  },
  tagText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  title: {
    color: COLORS.ink,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 31,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 15,
    marginTop: 6,
  },
  infoCard: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: radius.lg,
    backgroundColor: COLORS.card,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  infoValue: {
    color: COLORS.ink,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 23,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: COLORS.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 7,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: COLORS.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  secondaryText: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
    marginLeft: 7,
  },
  disabledButton: {
    opacity: 0.55,
  },
  toastWrap: {
    paddingHorizontal: 20,
  },
});
