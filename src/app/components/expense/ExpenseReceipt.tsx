import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import type { ExpenseItem } from '../../api';

// 공유용 영수증 이미지 (캡처되므로 다크모드와 상관없이 흰 바탕 고정 색)
const C = { teal: '#00BDB0', tealDark: '#00796F', tealSoft: '#E9FAF8', ink: '#1C1C1E', muted: '#6E6E73', line: '#D9D9DE', soft: '#F4F6F8' };
const CATEGORY_COLORS: Record<string, string> = {
  식비: '#FF9500',
  교통: '#0077C8',
  쇼핑: '#8E5CF6',
  숙박: '#00BDB0',
  입장료: '#FF3B30',
  기타: '#8E8E93',
};

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
const md = (date: string) => {
  const [, m, d] = date.split('-');
  return `${Number(m)}월 ${Number(d)}일`;
};
const slash = (date: string) => {
  const [, m, d] = date.split('-');
  return `${Number(m)}/${Number(d)}`;
};

type Props = {
  items: ExpenseItem[]; // 선택한 기간의 지출 (최신순)
  from: string;
  to: string;
  people: number;
  perPerson: number;
  currency: string;
  toForeign: (n: number) => string; // '' 이면 환산 표시 안 함
  createdOn: string;
};

export function ExpenseReceipt({ items, from, to, people, perPerson, currency, toForeign, createdOn }: Props) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const byCategory = Object.entries(
    items.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item.category]: (acc[item.category] ?? 0) + item.amount }), {})
  ).sort((a, b) => b[1] - a[1]);
  const ordered = [...items].sort((a, b) => (a.spentOn === b.spentOn ? a.id - b.id : a.spentOn < b.spentOn ? -1 : 1));
  const detail = (item: ExpenseItem) => (item.title && item.title !== item.category ? ` · ${item.title}` : '');

  return (
    <View style={styles.paper} collapsable={false}>
      <View style={styles.head}>
        <View style={styles.headRow}>
          <Text style={styles.headTitle}>가자GO 여행 가계부</Text>
          <Feather name="file-text" size={18} color="#FFFFFF" />
        </View>
        <Text style={styles.headSub}>{from === to ? md(from) : `${md(from)} ~ ${md(to)}`}</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>총 지출</Text>
        <Text style={styles.total}>{won(total)}</Text>
        {toForeign(total) ? <Text style={styles.muted}>{toForeign(total)}</Text> : null}
      </View>

      {people > 1 ? (
        <View style={styles.split}>
          <View>
            <Text style={styles.splitLabel}>{people}명이서 나누면</Text>
            {toForeign(perPerson) ? <Text style={styles.splitLabel}>{toForeign(perPerson)}</Text> : null}
          </View>
          <View style={styles.right}>
            <Text style={styles.splitLabel}>한 사람당</Text>
            <Text style={styles.splitValue}>{won(perPerson)}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.dashed} />

      <View style={styles.block}>
        <Text style={styles.label}>어디에 썼을까요</Text>
        <View style={styles.bar}>
          {byCategory.map(([name, sum]) => (
            <View key={name} style={{ flex: sum, backgroundColor: CATEGORY_COLORS[name] ?? C.muted }} />
          ))}
        </View>
        {byCategory.map(([name, sum]) => (
          <View key={name} style={styles.line}>
            <View style={styles.lineLeft}>
              <View style={[styles.dot, { backgroundColor: CATEGORY_COLORS[name] ?? C.muted }]} />
              <Text style={styles.text}>
                {name} {total > 0 ? Math.round((sum / total) * 100) : 0}%
              </Text>
            </View>
            <Text style={styles.text}>{won(sum)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.dashed} />

      <View style={styles.block}>
        <Text style={styles.label}>내역</Text>
        {ordered.map((item) => (
          <View key={item.id} style={styles.line}>
            <Text style={styles.date}>{slash(item.spentOn)}</Text>
            <Text style={[styles.text, styles.flex]} numberOfLines={1}>
              {item.category}
              {detail(item)}
            </Text>
            <Text style={styles.text}>{won(item.amount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.foot}>
        <Text style={styles.footText}>
          {createdOn.replace(/-/g, '.')}
          {currency !== 'KRW' ? ' · 환율은 참고용이에요' : ''}
        </Text>
        <Text style={styles.brand}>가자GO</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  paper: { width: 320, backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', alignSelf: 'center' },
  head: { backgroundColor: C.teal, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  headSub: { color: '#E6FFFC', fontSize: 13, marginTop: 8 },
  block: { paddingHorizontal: 20, paddingTop: 14 },
  label: { color: C.muted, fontSize: 12, marginBottom: 6 },
  total: { color: C.ink, fontSize: 30, fontWeight: '800' },
  muted: { color: C.muted, fontSize: 13 },
  split: { marginHorizontal: 20, marginTop: 12, backgroundColor: C.tealSoft, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  splitLabel: { color: C.tealDark, fontSize: 12 },
  splitValue: { color: C.tealDark, fontSize: 22, fontWeight: '800' },
  right: { alignItems: 'flex-end' },
  dashed: { marginHorizontal: 20, marginTop: 14, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: C.line },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 3 },
  lineLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  text: { color: C.ink, fontSize: 13 },
  date: { color: C.muted, fontSize: 13, width: 44 },
  flex: { flex: 1, marginRight: 8 },
  foot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  footText: { color: '#8E8E93', fontSize: 11 },
  brand: { color: C.teal, fontSize: 12, fontWeight: '800' },
});
