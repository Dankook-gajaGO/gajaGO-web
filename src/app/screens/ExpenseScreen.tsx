import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  addExpense,
  deleteExpense,
  getApiErrorMessage,
  getExchangeRates,
  getExpenses,
  getSavedFestivals,
  getServerTodayKey,
  type ExpenseItem,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import type { RootStackParamList } from '../routes';
import { COLORS, radius, shadow } from '../theme';
import { getFallbackTodayKey } from '../utils/date';
import { ensureLoggedIn, isLoggedIn } from '../utils/requireLogin';

type Props = NativeStackScreenProps<RootStackParamList, 'Expense'>;
type FeatherName = ComponentProps<typeof Feather>['name'];

// 분류마다 아이콘·색을 정해 목록과 분류별 막대에서 한눈에 구분
const CATEGORIES: Array<{ name: string; icon: FeatherName; color: string }> = [
  { name: '교통', icon: 'navigation', color: COLORS.blue },
  { name: '식비', icon: 'coffee', color: COLORS.orange },
  { name: '쇼핑', icon: 'shopping-bag', color: COLORS.purple },
  { name: '숙박', icon: 'home', color: COLORS.teal },
  { name: '입장료', icon: 'tag', color: COLORS.red },
  { name: '기타', icon: 'more-horizontal', color: COLORS.muted },
];
const categoryOf = (name: string) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];
const QUICK_AMOUNTS = [1000, 5000, 10000, 50000];

// 방한객 주요 통화. KRW 는 환산 없이 원화만 (한국인 사용자). 선택은 기기에 저장
const CURRENCIES = ['KRW', 'USD', 'JPY', 'CNY', 'TWD', 'HKD', 'EUR', 'THB', 'VND', 'PHP', 'SGD'];
const CURRENCY_KEY = 'gajago.expense.currency';

const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;

export function splitAmount(total: number, people: number) {
  if (!(people >= 1)) return 0;
  return Math.ceil(total / people / 10) * 10; // 10원 단위 올림: 모자라지 않게
}
// self-check: N빵 계산
if (splitAmount(10000, 3) !== 3340 || splitAmount(0, 2) !== 0 || splitAmount(5000, 0) !== 0) {
  throw new Error('splitAmount self-check failed');
}

export default function ExpenseScreen({ navigation }: Props) {
  // 비회원도 들어와서 N빵 계산은 가능. 지출 저장·목록은 회원만
  const [isMember, setIsMember] = useState(false);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState('USD');
  const [people, setPeople] = useState(2);
  const [splitInput, setSplitInput] = useState(0); // 직접 입력한 나눌 금액 (0이면 가계부 총액)
  const [today, setToday] = useState(getFallbackTodayKey());
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const member = await isLoggedIn();
    setIsMember(member);
    if (!member) return;
    try {
      setItems(await getExpenses());
      setMessage('');
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useEffect(() => {
    void getServerTodayKey().then(setToday).catch(() => undefined);
    void getExchangeRates()
      .then((r) => setRates(r.krwPer))
      .catch(() => undefined); // 실패하면 원화만 표시
    void AsyncStorage.getItem(CURRENCY_KEY)
      .then((c) => {
        if (c) setCurrency(c);
      })
      .catch(() => undefined);
  }, []);

  const chooseCurrency = (next: string) => {
    setCurrency(next);
    void AsyncStorage.setItem(CURRENCY_KEY, next).catch(() => undefined);
  };

  const add = async () => {
    if (!(await ensureLoggedIn(navigation))) return;
    if (!title.trim() || !(amount > 0)) {
      setMessage('내용과 금액을 입력해주세요.');
      return;
    }
    try {
      const created = await addExpense({ spentOn: today, title: title.trim(), amount, category });
      setItems((current) => [created, ...current]);
      setTitle('');
      setAmount(0);
      setMessage('');
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  const remove = async (id: number) => {
    try {
      await deleteExpense(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  // 백업: 가계부 + 저장한 행사를 CSV 텍스트로 공유(메모·메일·드라이브 등에 저장)
  const exportData = async () => {
    try {
      const saved = await getSavedFestivals().catch(() => ({ savedFestivals: [] as { title: string }[] }));
      const csv = [
        '[가계부] 날짜,분류,내용,금액(원)',
        ...items.map((i) => `${i.spentOn},${i.category},"${i.title.replace(/"/g, '""')}",${i.amount}`),
        '',
        '[저장한 행사]',
        ...saved.savedFestivals.map((f) => f.title),
      ].join('\n');
      await Share.share({ title: '가자GO 내 기록', message: csv });
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const todayTotal = items.filter((i) => i.spentOn === today).reduce((sum, i) => sum + i.amount, 0);
  const rateValue = currency === 'KRW' ? 0 : rates[currency] ?? 0;
  const toForeign = (n: number) =>
    rateValue > 0 ? `≈ ${(n / rateValue).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}` : '';
  const splitBase = splitInput > 0 ? splitInput : total;

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, sum: items.filter((i) => i.category === c.name).reduce((s, i) => s + i.amount, 0) }))
        .filter((c) => c.sum > 0)
        .sort((a, b) => b.sum - a.sum),
    [items]
  );

  const byDate = useMemo(() => {
    const groups = new Map<string, ExpenseItem[]>();
    items.forEach((item) => groups.set(item.spentOn, [...(groups.get(item.spentOn) ?? []), item]));
    return [...groups.entries()];
  }, [items]);

  return (
    <View style={styles.screen}>
      <AppHeader title="여행 가계부" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 요약: 총액·환산·오늘 */}
        <View style={[styles.hero, shadow.card]}>
          <Text style={styles.heroLabel}>이번 여행 총 지출</Text>
          <Text style={styles.heroTotal}>{won(total)}</Text>
          {rateValue > 0 ? <Text style={styles.heroSub}>{toForeign(total)}</Text> : null}
          <View style={styles.heroRow}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>오늘</Text>
              <Text style={styles.heroPillValue}>{won(todayTotal)}</Text>
            </View>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillLabel}>기록</Text>
              <Text style={styles.heroPillValue}>{items.length}건</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.currencyChip, c === currency ? styles.currencyChipOn : null]}
                onPress={() => chooseCurrency(c)}
                accessibilityRole="button"
                accessibilityState={{ selected: c === currency }}
              >
                <Text style={[styles.currencyText, c === currency ? styles.currencyTextOn : null]}>{c}</Text>
              </Pressable>
            ))}
          </ScrollView>
          {rateValue > 0 ? (
            <Text style={styles.rateNote}>
              1 {currency} ≈ {rateValue.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원 (하루 2회 갱신)
            </Text>
          ) : null}
        </View>

        {/* 분류별: 색 막대 + 금액 */}
        {byCategory.length > 0 ? (
          <View style={[styles.card, shadow.card]}>
            <Text style={styles.cardTitle}>어디에 썼나요</Text>
            <View style={styles.bar}>
              {byCategory.map((c) => (
                <View key={c.name} style={{ flex: c.sum, backgroundColor: c.color }} />
              ))}
            </View>
            {byCategory.map((c) => (
              <View key={c.name} style={styles.legendRow}>
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={styles.legendName}>{c.name}</Text>
                <Text style={styles.legendPct}>{Math.round((c.sum / total) * 100)}%</Text>
                <Text style={styles.legendSum}>{won(c.sum)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* N빵 */}
        <View style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>N빵 정산</Text>
          <TextInput
            style={[styles.input, styles.amountInput, styles.splitInput]}
            value={splitInput > 0 ? splitInput.toLocaleString('ko-KR') : ''}
            onChangeText={(t) => setSplitInput(Number(t.replace(/[^0-9]/g, '')) || 0)}
            placeholder={total > 0 ? `나눌 금액 (비우면 총 지출 ${won(total)})` : '나눌 금액 (원)'}
            keyboardType="number-pad"
          />
          <View style={styles.splitRow}>
            <Pressable style={styles.stepper} onPress={() => setPeople((p) => Math.max(1, p - 1))} accessibilityLabel="인원 줄이기">
              <Feather name="minus" size={16} color={COLORS.ink} />
            </Pressable>
            <Text style={styles.people}>{people}명</Text>
            <Pressable style={styles.stepper} onPress={() => setPeople((p) => p + 1)} accessibilityLabel="인원 늘리기">
              <Feather name="plus" size={16} color={COLORS.ink} />
            </Pressable>
            <View style={styles.flex} />
            <View style={styles.splitResult}>
              <Text style={styles.splitLabel}>1인당</Text>
              <Text style={styles.splitValue}>{won(splitAmount(splitBase, people))}</Text>
              {rateValue > 0 ? <Text style={styles.itemSub}>{toForeign(splitAmount(splitBase, people))}</Text> : null}
            </View>
          </View>
        </View>

        {/* 추가 */}
        <View style={[styles.card, shadow.card]}>
          <Text style={styles.cardTitle}>지출 추가</Text>
          {!isMember ? <Text style={styles.memberHint}>로그인하면 지출이 저장돼요. N빵 계산은 로그인 없이 쓸 수 있어요.</Text> : null}
          <View style={styles.chips}>
            {CATEGORIES.map((c) => {
              const on = c.name === category;
              return (
                <Pressable
                  key={c.name}
                  style={[styles.chip, on ? { backgroundColor: c.color, borderColor: c.color } : null]}
                  onPress={() => setCategory(c.name)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                >
                  <Feather name={c.icon} size={13} color={on ? COLORS.white : c.color} />
                  <Text style={[styles.chipText, on ? styles.chipTextOn : null]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="무엇에 썼나요? (예: 지하철, 비빔밥)" />
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={amount > 0 ? amount.toLocaleString('ko-KR') : ''}
            onChangeText={(t) => setAmount(Number(t.replace(/[^0-9]/g, '')) || 0)}
            placeholder="금액 (원)"
            keyboardType="number-pad"
          />
          <View style={styles.quickRow}>
            {QUICK_AMOUNTS.map((q) => (
              <Pressable key={q} style={styles.quick} onPress={() => setAmount((a) => a + q)} accessibilityRole="button">
                <Text style={styles.quickText}>+{q.toLocaleString('ko-KR')}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable style={styles.primary} onPress={add} accessibilityRole="button">
            <Text style={styles.primaryText}>{amount > 0 ? `${won(amount)} 추가` : '추가'}</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        {/* 날짜별 기록 */}
        {byDate.map(([date, list]) => (
          <View key={date} style={styles.dayGroup}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{date === today ? '오늘' : date}</Text>
              <Text style={styles.daySum}>{won(list.reduce((s, i) => s + i.amount, 0))}</Text>
            </View>
            {list.map((item) => {
              const c = categoryOf(item.category);
              return (
                <View key={item.id} style={styles.item}>
                  <View style={[styles.itemIcon, { backgroundColor: `${c.color}22` }]}>
                    <Feather name={c.icon} size={16} color={c.color} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>{item.category}</Text>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemAmount}>{won(item.amount)}</Text>
                    {rateValue > 0 ? <Text style={styles.itemSub}>{toForeign(item.amount)}</Text> : null}
                  </View>
                  <Pressable onPress={() => remove(item.id)} style={styles.deleteBtn} accessibilityLabel={`${item.title} 삭제`}>
                    <Feather name="x" size={16} color={COLORS.muted} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ))}

        {isMember && items.length === 0 && !message ? (
          <Text style={styles.empty}>아직 기록이 없어요. 첫 지출을 추가해 보세요.</Text>
        ) : null}

        <Pressable
          style={styles.secondary}
          onPress={async () => {
            if (await ensureLoggedIn(navigation)) void exportData();
          }}
          accessibilityRole="button"
        >
          <Feather name="download" size={15} color={COLORS.teal} />
          <Text style={styles.secondaryText}>내 기록 내보내기 (백업)</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screen },
  content: { padding: 20, paddingBottom: 40 },
  flex: { flex: 1 },

  hero: { backgroundColor: COLORS.teal, borderRadius: radius.xl, padding: 20, marginBottom: 14 },
  heroLabel: { color: '#ffffffcc', fontSize: 13, fontWeight: '700' },
  heroTotal: { color: COLORS.white, fontSize: 32, fontWeight: '900', marginTop: 4 },
  heroSub: { color: '#ffffffdd', fontSize: 15, fontWeight: '700', marginTop: 2 },
  heroRow: { flexDirection: 'row', marginTop: 14 },
  heroPill: { flex: 1, backgroundColor: '#ffffff26', borderRadius: radius.md, padding: 10, marginRight: 8 },
  heroPillLabel: { color: '#ffffffcc', fontSize: 12, fontWeight: '700' },
  heroPillValue: { color: COLORS.white, fontSize: 16, fontWeight: '900', marginTop: 2 },
  currencyRow: { marginTop: 12 },
  currencyChip: { borderRadius: 14, backgroundColor: '#ffffff26', paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 },
  currencyChipOn: { backgroundColor: COLORS.white },
  currencyText: { color: COLORS.white, fontSize: 13, fontWeight: '800' },
  currencyTextOn: { color: COLORS.teal },
  rateNote: { color: '#ffffffcc', fontSize: 11, fontWeight: '600', marginTop: 8 },
  splitInput: { marginTop: 0, marginBottom: 10 },
  memberHint: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },

  card: { backgroundColor: COLORS.white, borderRadius: radius.lg, padding: 16, marginBottom: 14 },
  cardTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '900', marginBottom: 12 },

  bar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendName: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '700' },
  legendPct: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginRight: 10 },
  legendSum: { color: COLORS.ink, fontSize: 14, fontWeight: '900' },

  splitRow: { flexDirection: 'row', alignItems: 'center' },
  stepper: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, alignItems: 'center', justifyContent: 'center' },
  people: { color: COLORS.ink, fontSize: 16, fontWeight: '900', marginHorizontal: 12 },
  splitResult: { alignItems: 'flex-end' },
  splitLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '700' },
  splitValue: { color: COLORS.teal, fontSize: 20, fontWeight: '900' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: { color: COLORS.ink, fontSize: 13, fontWeight: '700', marginLeft: 5 },
  chipTextOn: { color: COLORS.white },
  input: { minHeight: 46, borderRadius: radius.md, backgroundColor: COLORS.card, paddingHorizontal: 14, marginTop: 8, color: COLORS.ink },
  amountInput: { fontSize: 18, fontWeight: '800' },
  quickRow: { flexDirection: 'row', marginTop: 8 },
  quick: { flex: 1, minHeight: 34, borderRadius: radius.sm, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  quickText: { color: COLORS.text, fontSize: 12, fontWeight: '800' },
  primary: { minHeight: 48, borderRadius: radius.md, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryText: { color: COLORS.white, fontSize: 15, fontWeight: '900' },
  message: { color: COLORS.red, fontSize: 12, marginTop: 8 },

  dayGroup: { marginBottom: 10 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 6 },
  dayTitle: { color: COLORS.ink, fontSize: 14, fontWeight: '900' },
  daySum: { color: COLORS.muted, fontSize: 13, fontWeight: '800' },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: radius.md, padding: 12, marginBottom: 6 },
  itemIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  itemTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  itemSub: { color: COLORS.muted, fontSize: 12, fontWeight: '600', marginTop: 2 },
  itemRight: { alignItems: 'flex-end', marginLeft: 8 },
  itemAmount: { color: COLORS.ink, fontSize: 15, fontWeight: '900' },
  deleteBtn: { padding: 6, marginLeft: 4 },

  empty: { color: COLORS.muted, fontSize: 13, textAlign: 'center', marginVertical: 16 },
  secondary: {
    flexDirection: 'row',
    minHeight: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryText: { color: COLORS.teal, fontSize: 14, fontWeight: '800', marginLeft: 6 },
});
