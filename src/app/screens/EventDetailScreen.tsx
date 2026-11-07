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
import { ensureLoggedIn } from '../utils/requireLogin';
import { openGooglePlace, openKakaoPlace } from '../utils/maps';

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

  // 출발지는 말하지 않음 -> 챗봇이 현재 위치에서 출발. 행사 좌표가 있으면 장소 검색 없이 그 좌표로 안내 (비회원도 사용)
  const openDirections = () => {
    if (!event) return;
    const lat = detail?.lat;
    const lng = detail?.lng;
    navigation.navigate('Transport', {
      country,
      initialMessage: `${event.title}까지 어떻게 가?`,
      destination: lat != null && lng != null ? { name: event.title, address: event.location, lat, lng } : undefined,
    });
  };

  const toggleSaved = async () => {
    if (!event || isSaving || !(await ensureLoggedIn(navigation))) return;

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
    if (!event || isAddingSchedule || !(await ensureLoggedIn(navigation))) return;

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
              <Text style={[styles.tagText, { color: event.tagColor }]}>{event.tag}</Text>
              <Text style={styles.title}>{event.title}</Text>
              <Text style={styles.subtitle}>{event.subtitle}</Text>
            </View>

            <View style={styles.infoCard}>
              <InfoRow icon="calendar" label="기간" value={event.date} />
              <InfoRow icon="clock" label="요금" value={detail?.fee || '정보 없음'} />
              <InfoRow icon="map-pin" label="위치" value={event.location} />
              <InfoRow icon="phone" label="문의" value={detail?.tel || '정보 없음'} />
            </View>

            {detail?.lat != null && detail?.lng != null ? (
              <View style={styles.mapRow}>
                <Text style={styles.mapLabel}>지도에서 보기</Text>
                {(
                  [
                    ['구글 지도', openGooglePlace],
                    ['카카오맵', openKakaoPlace],
                  ] as const
                ).map(([label, open]) => (
                  <Pressable
                    key={label}
                    style={styles.mapChip}
                    onPress={() =>
                      void open({ name: event.title, address: event.location, lat: detail.lat as number, lng: detail.lng as number })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${label}에서 보기`}
                  >
                    <Text style={styles.mapChipText}>{label}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}

            {/* 주요 동작은 소개글 위에 한 줄로 (긴 소개글 아래 버튼 5개가 쌓여 있던 구조 정리) */}
            <View style={styles.actionRow}>
              <ActionButton
                icon="heart"
                label={isSaved ? '저장됨' : '저장'}
                active={isSaved}
                disabled={isSaving}
                onPress={toggleSaved}
              />
              <ActionButton icon="calendar" label="일정 추가" disabled={isAddingSchedule} onPress={addToCalendar} />
              <ActionButton icon="navigation" label="길찾기" onPress={openDirections} />
              {homepageUrl ? <ActionButton icon="external-link" label="홈페이지" onPress={openHomepage} /> : null}
            </View>

            {statusMessage ? (
              <View style={styles.toastWrap}>
                <ToastMessage
                  message={statusMessage}
                  tone={statusMessage.includes('못') ? 'error' : 'success'}
                />
              </View>
            ) : null}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>소개</Text>
              <Text style={styles.description}>{detail?.overview || '상세 소개 정보가 없습니다.'}</Text>
            </View>

          </>
        ) : null}
      </Screen>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  active = false,
  disabled = false,
}: {
  icon: 'heart' | 'calendar' | 'navigation' | 'external-link';
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed || disabled ? styles.disabledButton : null]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active, disabled }}
    >
      <View style={[styles.actionIcon, active ? styles.actionIconActive : null]}>
        <Feather name={icon} size={20} color={active ? COLORS.white : COLORS.teal} />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
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
  tagText: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: COLORS.ink,
    fontSize: 24,
    fontWeight: '700',
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
    fontWeight: '600',
  },
  infoValue: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 23,
  },
  mapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 12,
  },
  mapLabel: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginRight: 'auto',
  },
  mapChip: {
    minHeight: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 14,
    justifyContent: 'center',
    marginLeft: 6,
  },
  mapChipText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginTop: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.line,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionIconActive: {
    backgroundColor: COLORS.teal,
  },
  actionText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.55,
  },
  toastWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
