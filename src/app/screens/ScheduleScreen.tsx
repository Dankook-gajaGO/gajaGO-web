import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getServerTodayKey } from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { BottomNavBar } from '../components/BottomNavBar';
import { DateSummaryCard } from '../components/schedule/DateSummaryCard';
import { DayScheduleSection } from '../components/schedule/DayScheduleSection';
import { ScheduleDatePicker } from '../components/schedule/ScheduleDatePicker';
import { ScheduleMapPreview } from '../components/schedule/ScheduleMapPreview';
import {
  createEmptyScheduleDays,
  createScheduleDay,
  ensureScheduleDate,
  type ScheduleDay,
} from '../data/schedule';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';
import { getFallbackTodayKey } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

export default function ScheduleScreen({ navigation, route }: Props) {
  const country = route.params?.country ?? 'korea';
  const routeDate = route.params?.date;
  const initialDate = routeDate ?? getFallbackTodayKey();
  const [days, setDays] = useState<ScheduleDay[]>(() => createEmptyScheduleDays(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isResolvingDate, setIsResolvingDate] = useState(!routeDate);

  useEffect(() => {
    let active = true;

    async function resolveInitialDate() {
      setIsResolvingDate(true);

      const nextDate = routeDate ?? (await getServerTodayKey());
      if (!active) return;

      setSelectedDate(nextDate);
      setDays((items) => ensureScheduleDate(items, nextDate));
      setIsResolvingDate(false);
    }

    void resolveInitialDate();

    return () => {
      active = false;
    };
  }, [routeDate]);

  const selectedDay = days.find((day) => day.date === selectedDate) ?? createScheduleDay(selectedDate);

  const removePlace = (placeId: string) => {
    setDays((items) =>
      items.map((day) =>
        day.date === selectedDate
          ? { ...day, places: day.places.filter((place) => place.id !== placeId) }
          : day
      )
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader title="여행 일정" onBack={() => navigation.goBack()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {isResolvingDate ? (
          <View style={styles.syncRow}>
            <ActivityIndicator color={COLORS.teal} size="small" />
            <Text style={styles.syncText}>서버 날짜 기준으로 일정을 여는 중입니다.</Text>
          </View>
        ) : null}
        <DateSummaryCard
          label={selectedDay.label}
          count={selectedDay.places.length}
          onPress={() => navigation.navigate('CalendarDetail', { country, date: selectedDate })}
        />
        <View style={styles.spacer} />
        <ScheduleDatePicker days={days} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <View style={styles.spacer} />
        <ScheduleMapPreview count={selectedDay.places.length} />
        <Text style={styles.sectionTitle}>오늘 일정</Text>
        <DayScheduleSection places={selectedDay.places} onRemovePlace={removePlace} />
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
  sectionTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 20,
    marginBottom: 12,
  },
});
