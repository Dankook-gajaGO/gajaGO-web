import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// 행사·여행 알림: 서버 없이 폰에 예약하는 로컬 알림. 웹은 지원 안 해서 아무 일도 하지 않음
const supported = Platform.OS !== 'web';

if (supported) {
  // 앱을 보고 있을 때도 알림 배너 표시
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// 'YYYY-MM-DD' + 시각 -> 그 날 그 시각(기기 현지 시간). dayOffset=-1 이면 전날
export function reminderDate(date: string, hour: number, dayOffset = 0) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d + dayOffset, hour, 0, 0);
}

async function ensurePermission() {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  if (!asked.granted) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: '행사·여행 알림',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return true;
}

// 이미 지난 시각은 예약하지 않음
async function schedule(identifier: string, at: Date, title: string, body: string, data: Record<string, unknown>) {
  if (at.getTime() <= Date.now()) return;
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body, data },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'default' },
  });
}

async function cancel(...identifiers: string[]) {
  if (!supported) return;
  await Promise.all(identifiers.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
}

// 일정·캘린더: 등록할 때 사용자가 고른 경우에만 예약 (자동 알림 없음)
export type ReminderOption = 'none' | 'sameDay' | 'dayBefore';
export const REMINDER_OPTIONS: Array<{ id: ReminderOption; label: string }> = [
  { id: 'none', label: '알림 없음' },
  { id: 'sameDay', label: '당일 오전 9시' },
  { id: 'dayBefore', label: '전날 저녁 8시' },
];

// 예약됐으면 true (알림 없음·권한 거절·이미 지난 시각·웹이면 false)
export async function scheduleItemReminder(item: { itemId: number; title: string; date: string }, option: ReminderOption) {
  if (option === 'none') return false;
  try {
    if (!(await ensurePermission())) return false;
    const at = option === 'sameDay' ? reminderDate(item.date, 9) : reminderDate(item.date, 20, -1);
    if (at.getTime() <= Date.now()) return false;
    await schedule(`schedule-${item.itemId}`, at, option === 'sameDay' ? '오늘 일정이 있어요' : '내일 일정이 있어요', item.title, {
      screen: 'CalendarDetail',
      date: item.date,
    });
    return true;
  } catch {
    return false; // 알림 예약 실패가 일정 저장을 막지 않게
  }
}

export function cancelScheduleReminder(itemId: number) {
  return cancel(`schedule-${itemId}`);
}

// 여행: 시작일 오전 8시 (여행 만들 때 사용자가 켠 경우만)
export async function scheduleTripReminder(trip: { id: number; name: string; startDate: string }) {
  try {
    if (!(await ensurePermission())) return;
    await schedule(`trip-${trip.id}`, reminderDate(trip.startDate, 8), `오늘 ${trip.name} 시작!`, '일정과 가계부를 확인해 보세요', {
      screen: 'Expense',
    });
  } catch {
    // 알림 예약 실패가 여행 저장을 막지 않게
  }
}

export function cancelTripReminder(tripId: number) {
  return cancel(`trip-${tripId}`);
}

// 알림을 누르면 해당 화면으로
export function onNotificationTap(open: (data: Record<string, unknown>) => void) {
  if (!supported) return () => undefined;
  const sub = Notifications.addNotificationResponseReceivedListener((response) =>
    open(response.notification.request.content.data ?? {})
  );
  return () => sub.remove();
}
