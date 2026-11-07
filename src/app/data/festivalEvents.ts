import type { FestivalDetailResponse, FestivalSummaryApi } from '../api';
import { COLORS } from '../theme';

export interface FestivalEventItem {
  id: string;
  contentId: number;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  date: string;
  location: string;
  image: string;
  startDate: string;
  endDate: string;
}

const FALLBACK_FESTIVAL_IMAGE =
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=900';

const regionAlias: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  강원도: '강원',
  충청북도: '충북',
  충북: '충북',
  충청남도: '충남',
  충남: '충남',
  전북특별자치도: '전북',
  전라북도: '전북',
  전북: '전북',
  전라남도: '전남',
  전남: '전남',
  경상북도: '경북',
  경북: '경북',
  경상남도: '경남',
  경남: '경남',
  제주특별자치도: '제주',
  제주도: '제주',
};

const regionColors = [
  COLORS.teal,
  COLORS.blue,
  COLORS.orange,
  COLORS.purple,
  '#2F80ED',
  '#27AE60',
  '#EB5757',
  '#9B51E0',
];

function normalizeText(value: unknown, fallback: string) {
  if (value === undefined || value === null) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

export function getFestivalRegion(addr?: string | null) {
  const firstPart = normalizeText(addr, '지역 미상').split(/\s+/)[0];
  return regionAlias[firstPart] ?? firstPart;
}

function getRegionColor(region: string) {
  const hash = Array.from(region).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return regionColors[hash % regionColors.length];
}

function getFestivalImage(image?: string | null) {
  const trimmed = image?.trim();
  if (!trimmed) return FALLBACK_FESTIVAL_IMAGE;
  return trimmed.startsWith('http') ? trimmed : FALLBACK_FESTIVAL_IMAGE;
}

function formatDate(value?: string | null) {
  if (!value) return '';

  const normalized = value.includes('-')
    ? value
    : `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  const [year, month, day] = normalized.split('-');
  if (!year || !month || !day) return value;

  return `${year}.${month}.${day}`;
}

function formatFestivalDateRange(startDate?: string | null, endDate?: string | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (!start && !end) return '일정 미정';
  if (!end || start === end) return start;
  return `${start} - ${end}`;
}

export function festivalSummaryToEvent(summary: FestivalSummaryApi): FestivalEventItem {
  const region = getFestivalRegion(summary.addr);
  const title = normalizeText(summary.title, '행사명 미정');
  const location = normalizeText(summary.addr, '장소 미정');

  return {
    id: String(summary.contentId),
    contentId: summary.contentId,
    title,
    subtitle: location,
    tag: region,
    tagColor: getRegionColor(region),
    date: formatFestivalDateRange(summary.eventStartDate, summary.eventEndDate),
    location,
    image: getFestivalImage(summary.image),
    startDate: summary.eventStartDate ?? '',
    endDate: summary.eventEndDate ?? '',
  };
}

export function festivalDetailToEvent(detail: FestivalDetailResponse): FestivalEventItem {
  return festivalSummaryToEvent(detail);
}

const DAY_MS = 86400000;
const RECENT_START_DAYS = 30;

function localTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 추천 순서: 곧 시작하거나 최근(30일 이내) 시작한 행사를 오늘과 가까운 순으로 먼저,
// 오래전에 시작한 상설 행사(예: 2022년 시작)는 맨 뒤로
export function festivalRank(startDate: string, today: string) {
  const diff = Math.round((Date.parse(startDate) - Date.parse(today)) / DAY_MS);
  if (diff >= 0) return diff;
  return -diff <= RECENT_START_DAYS ? -diff : 1000 - diff;
}

export function sortFestivalEvents(events: FestivalEventItem[], today = localTodayKey()) {
  return [...events].sort((a, b) => {
    const rankCompare = festivalRank(a.startDate, today) - festivalRank(b.startDate, today);
    if (rankCompare !== 0) return rankCompare;
    return a.title.localeCompare(b.title);
  });
}

// self-check: 내일 시작 < 어제 시작 < 열흘 뒤 시작 < 2022년 시작
if (
  !(
    festivalRank('2026-11-09', '2026-11-08') < festivalRank('2026-11-06', '2026-11-08') &&
    festivalRank('2026-11-06', '2026-11-08') < festivalRank('2026-11-18', '2026-11-08') &&
    festivalRank('2026-11-18', '2026-11-08') < festivalRank('2022-11-01', '2026-11-08')
  )
) {
  throw new Error('festivalRank self-check failed');
}
