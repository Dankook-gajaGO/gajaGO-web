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
// self-check: 월초 전날
{
  const r = reminderDate('2026-12-01', 9, -1);
  if (r.getMonth() !== 10 || r.getDate() !== 30 || r.getHours() !== 9) throw new Error('reminderDate self-check failed');
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

// 저장한 행사: 전날·당일 오전 9시
export async function scheduleFestivalReminders(festival: { contentId: number; title: string; startDate: string }) {
  try {
    if (!(await ensurePermission())) return;
    const data = { screen: 'EventDetails', eventId: String(festival.contentId) };
    await schedule(`festival-${festival.contentId}-d1`, reminderDate(festival.startDate, 9, -1), '내일 행사가 시작돼요', festival.title, data);
    await schedule(`festival-${festival.contentId}-d0`, reminderDate(festival.startDate, 9), '오늘 행사가 시작돼요', festival.title, data);
  } catch {
    // 알림 예약 실패가 저장 자체를 막지 않게
  }
}

export function cancelFestivalReminders(contentId: number) {
  return cancel(`festival-${contentId}-d1`, `festival-${contentId}-d0`);
}

// 여행: 시작일 오전 8시
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
