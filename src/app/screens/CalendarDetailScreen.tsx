import { useEffect, useMemo, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServerTodayKey } from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { BottomNavBar } from '../components/BottomNavBar';
import { MemoPreviewCard } from '../components/calendar/MemoPreviewCard';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { SelectedDatePanel } from '../components/calendar/SelectedDatePanel';
import { holidays, type Memo } from '../data/calendar';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';
import { getFallbackTodayKey, getMonthStartDate } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'CalendarDetail'>;

function monthLabel(year: number, month: number) {
  return `${year}.${month + 1 < 10 ? `0${month + 1}` : month + 1}`;
}

export default function CalendarDetailScreen({ navigation, route }: Props) {
  const routeDate = route.params?.date;
  const fallbackToday = getFallbackTodayKey();
  const initialDate = routeDate ?? fallbackToday;
  const [today, setToday] = useState(initialDate);
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStartDate(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [draft, setDraft] = useState('');
  const [isResolvingDate, setIsResolvingDate] = useState(!routeDate);

  useEffect(() => {
    if (!routeDate) return;

    setSelectedDate(routeDate);
    setVisibleMonth(getMonthStartDate(routeDate));
  }, [routeDate]);

  useEffect(() => {
    let active = true;

    async function resolveServerDate() {
      setIsResolvingDate(true);

      const serverToday = await getServerTodayKey();
      if (!active) return;

      setToday(serverToday);

      if (!routeDate) {
        setSelectedDate(serverToday);
        setVisibleMonth(getMonthStartDate(serverToday));
      }

      setIsResolvingDate(false);
    }

    void resolveServerDate();

    return () => {
      active = false;
    };
  }, [routeDate]);

  const selectedMemos = useMemo(
    () => memos.filter((memo) => memo.date === selectedDate),
    [memos, selectedDate]
  );

  const addMemo = () => {
    const title = draft.trim();
    if (!title) return;
    setMemos((items) => [
      ...items,
      { id: `memo-${Date.now()}`, date: selectedDate, title },
    ]);
    setDraft('');
  };

  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="캘린더" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.monthHeader}>
          <Pressable style={styles.monthButton} onPress={() => moveMonth(-1)}>
            <Feather name="chevron-left" size={20} color={COLORS.ink} />
          </Pressable>
          <View style={styles.monthTitleWrap}>
            <Text style={styles.monthText}>
              {monthLabel(visibleMonth.getFullYear(), visibleMonth.getMonth())}
            </Text>
            {isResolvingDate ? (
              <View style={styles.syncRow}>
                <ActivityIndicator color={COLORS.teal} size="small" />
                <Text style={styles.syncText}>서버 날짜 확인 중</Text>
              </View>
            ) : null}
          </View>
          <Pressable style={styles.monthButton} onPress={() => moveMonth(1)}>
            <Feather name="chevron-right" size={20} color={COLORS.ink} />
          </Pressable>
        </View>

        <MonthCalendar
          year={visibleMonth.getFullYear()}
          month={visibleMonth.getMonth()}
          selectedDate={selectedDate}
          today={today}
          holidays={holidays}
          memos={memos}
          onSelectDate={setSelectedDate}
        />

        <View style={styles.legend}>
          <Legend color={COLORS.red} label="공휴일" />
          <Legend color={COLORS.teal} label="메모" />
        </View>

        <SelectedDatePanel
          selectedDate={selectedDate}
          memos={selectedMemos}
          draft={draft}
          onChangeDraft={setDraft}
          onAddMemo={addMemo}
        />

        <Text style={styles.sectionTitle}>최근 메모</Text>
        {memos.length > 0 ? (
          memos.slice(0, 3).map((memo) => <MemoPreviewCard key={memo.id} memo={memo} />)
        ) : (
          <Text style={styles.emptyText}>아직 작성한 메모가 없습니다.</Text>
        )}
      </ScrollView>
      <BottomNavBar active="CalendarDetail" navigation={navigation} />
    </SafeAreaView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
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
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitleWrap: {
    alignItems: 'center',
  },
  monthText: {
    color: COLORS.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  syncText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 5,
  },
  legend: {
    flexDirection: 'row',
    marginVertical: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
