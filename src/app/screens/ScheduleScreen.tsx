import { useCallback, useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  createScheduleItem,
  deleteScheduleItem,
  getApiErrorMessage,
  getScheduleItems,
  getServerTodayKey,
  type ScheduleItemApi,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { ToastMessage } from '../components/common/ToastMessage';
import { BottomNavBar } from '../components/BottomNavBar';
import { DateSummaryCard } from '../components/schedule/DateSummaryCard';
import { DayScheduleSection } from '../components/schedule/DayScheduleSection';
import { ScheduleDatePicker } from '../components/schedule/ScheduleDatePicker';
import { ScheduleMapPreview } from '../components/schedule/ScheduleMapPreview';
import {
  createEmptyScheduleDays,
  createScheduleDay,
  ensureScheduleDate,
  type Place,
  type ScheduleDay,
} from '../data/schedule';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';
import { getFallbackTodayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

function getCategoryLabel(item: ScheduleItemApi) {
  if (item.type === 'FESTIVAL') return '행사';
  if (item.type === 'MEMO') return '메모';
  if (item.type === 'PLACE') return '장소';
  if (item.type === 'TRANSPORT') return '교통';
  return '일정';
}

function toPlace(item: ScheduleItemApi): Place {
  return {
    id: String(item.itemId),
    name: item.title,
    category: getCategoryLabel(item),
    address: item.memo ?? item.festivalAddr ?? item.address ?? item.placeName ?? '상세 메모 없음',
  };
}

export default function ScheduleScreen({ navigation, route }: Props) {
  const country = route.params?.country ?? 'korea';
  const routeDate = route.params?.date;
  const initialDate = routeDate ?? getFallbackTodayKey();
  const [days, setDays] = useState<ScheduleDay[]>(() => createEmptyScheduleDays(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [items, setItems] = useState<ScheduleItemApi[]>([]);
  const [draft, setDraft] = useState('');
  const [isResolvingDate, setIsResolvingDate] = useState(!routeDate);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function resolveInitialDate() {
      setIsResolvingDate(true);

      const nextDate = routeDate ?? (await getServerTodayKey());
      if (!active) return;

      setSelectedDate(nextDate);
      setDays((current) => ensureScheduleDate(current, nextDate));
      setIsResolvingDate(false);
    }

    void resolveInitialDate();

    return () => {
      active = false;
    };
  }, [routeDate]);

  const loadItems = useCallback(async () => {
    setIsLoadingItems(true);
    setStatusMessage('');

    try {
      const response = await getScheduleItems(selectedDate);
      setItems(response.items ?? []);
    } catch (error) {
      setItems([]);
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsLoadingItems(false);
    }
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      void loadItems();
    }, [loadItems])
  );

  const selectedDay = days.find((day) => day.date === selectedDate) ?? createScheduleDay(selectedDate);
  const places = items.map(toPlace);

  const addSchedule = async () => {
    const title = draft.trim();
    if (!title || isSaving) return;

    setIsSaving(true);
    setStatusMessage('');

    try {
      const created = await createScheduleItem({
        date: selectedDate,
        type: 'CUSTOM',
        title,
      });
      setItems((current) => [...current, created]);
      setDraft('');
      setStatusMessage('일정을 추가했어요');
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const removePlace = async (placeId: string) => {
    const itemId = Number(placeId);
    if (!Number.isFinite(itemId)) return;

    setStatusMessage('');

    try {
      await deleteScheduleItem(itemId);
      setItems((current) => current.filter((item) => item.itemId !== itemId));
      setStatusMessage('삭제했어요');
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="여행 일정" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isResolvingDate || isLoadingItems ? (
          <View style={styles.syncRow}>
            <ActivityIndicator color={COLORS.teal} size="small" />
            <Text style={styles.syncText}>서버 기준 날짜와 저장 일정을 확인하는 중입니다.</Text>
          </View>
        ) : null}
        <DateSummaryCard
          label={selectedDay.label}
          count={items.length}
          onPress={() => navigation.navigate('CalendarDetail', { country, date: selectedDate })}
        />
        <View style={styles.spacer} />
        <ScheduleDatePicker days={days} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <View style={styles.spacer} />
        <ScheduleMapPreview count={items.length} />

        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>오늘 일정</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="메모 입력"
              placeholderTextColor={COLORS.muted}
              style={styles.input}
              onSubmitEditing={addSchedule}
              returnKeyType="done"
            />
            <Pressable
              style={[styles.addButton, isSaving ? styles.disabledButton : null]}
              onPress={addSchedule}
              disabled={isSaving}
            >
              <Feather name="plus" size={20} color={COLORS.white} />
            </Pressable>
          </View>
        </View>

        {statusMessage ? (
          <ToastMessage message={statusMessage} tone={statusMessage.includes('못') ? 'error' : 'success'} />
        ) : null}

        <Text style={styles.sectionTitle}>오늘 일정</Text>
        <DayScheduleSection places={places} onRemovePlace={removePlace} />
      </ScrollView>
      <BottomNavBar active="Schedule" navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.screen,
  },
  content: {
    padding: 20,
    paddingBottom: 28,
  },
  syncRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  syncText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  spacer: {
    height: 14,
  },
  inputCard: {
    borderRadius: radius.lg,
    backgroundColor: COLORS.white,
    padding: 14,
    marginTop: 14,
  },
  inputTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    color: COLORS.ink,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
  },
});
