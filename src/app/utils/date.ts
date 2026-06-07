export const MONTH_LABELS = [
  '1월',
  '2월',
  '3월',
  '4월',
  '5월',
  '6월',
  '7월',
  '8월',
  '9월',
  '10월',
  '11월',
  '12월',
];

export const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export const WEEKDAY_LABELS = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
];

const KOREA_TIME_OFFSET_MS = 9 * 60 * 60 * 1000;

export function padDatePart(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

export function formatKoreaDateKey(date: Date) {
  const koreaDate = new Date(date.getTime() + KOREA_TIME_OFFSET_MS);

  return [
    koreaDate.getUTCFullYear(),
    padDatePart(koreaDate.getUTCMonth() + 1),
    padDatePart(koreaDate.getUTCDate()),
  ].join('-');
}

export function formatLocalDateKey(date: Date) {
  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate()),
  ].join('-');
}

export function getFallbackTodayKey() {
  return formatKoreaDateKey(new Date());
}

export function parseDateKey(date: string) {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(year, month - 1, day);
}

export function getMonthStartDate(date: string) {
  const parsed = parseDateKey(date);

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
}

export function addDays(date: string, offset: number) {
  const parsed = parseDateKey(date);
  parsed.setDate(parsed.getDate() + offset);

  return formatLocalDateKey(parsed);
}

export function formatShortDate(date: string) {
  const [, month, day] = date.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

export function formatDateWithWeekday(date: string) {
  const weekday = WEEKDAY_LABELS[parseDateKey(date).getDay()];
  return `${formatShortDate(date)} ${weekday}`;
}
