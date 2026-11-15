import type { ComponentProps } from 'react';
import type Feather from '@expo/vector-icons/Feather';
import type { ExpenseItem } from '../../api';
import { COLORS } from '../../theme';

type FeatherName = ComponentProps<typeof Feather>['name'];

// 분류마다 아이콘·색을 정해 목록과 분류별 막대에서 한눈에 구분
export const CATEGORIES: Array<{ name: string; icon: FeatherName; color: string }> = [
  { name: '식비', icon: 'coffee', color: COLORS.orange },
  { name: '교통', icon: 'navigation', color: COLORS.blue },
  { name: '쇼핑', icon: 'shopping-bag', color: COLORS.purple },
  { name: '숙박', icon: 'home', color: COLORS.teal },
  { name: '입장료', icon: 'tag', color: COLORS.red },
  { name: '기타', icon: 'more-horizontal', color: COLORS.muted },
];
export const categoryOf = (name: string) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];

export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

export function splitAmount(total: number, people: number) {
  if (!(people >= 1)) return 0;
  return Math.ceil(total / people / 10) * 10; // 10원 단위 올림: 모자라지 않게
}

// 'YYYY-MM-DD' 를 delta 일 이동 (시간대 영향 없게 로컬 날짜로 계산)
export function shiftDate(date: string, delta: number) {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d + delta);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}

export function dayLabel(date: string, today: string) {
  if (date === today) return '오늘';
  const [, m, d] = date.split('-');
  return `${Number(m)}월 ${Number(d)}일`;
}

// 세부 내용이 없으면(분류 이름과 같으면) 분류만 표시
export const detailOf = (item: ExpenseItem) => (item.title && item.title !== item.category ? item.title : '');
