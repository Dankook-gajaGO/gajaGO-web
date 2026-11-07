import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
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
  getServerTodayKey,
  updateExpense,
  type ExpenseItem,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { AmountKeypad } from '../components/expense/AmountKeypad';
import type { RootStackParamList } from '../routes';
import { COLORS, radius } from '../theme';
import { getFallbackTodayKey } from '../utils/date';
import { ensureLoggedIn, isLoggedIn } from '../utils/requireLogin';

type Props = NativeStackScreenProps<RootStackParamList, 'Expense'>;
type FeatherName = ComponentProps<typeof Feather>['name'];

// 분류마다 아이콘·색을 정해 목록과 분류별 막대에서 한눈에 구분
const CATEGORIES: Array<{ name: string; icon: FeatherName; color: string }> = [
  { name: '식비', icon: 'coffee', color: COLORS.orange },
  { name: '교통', icon: 'navigation', color: COLORS.blue },
  { name: '쇼핑', icon: 'shopping-bag', color: COLORS.purple },
  { name: '숙박', icon: 'home', color: COLORS.teal },
  { name: '입장료', icon: 'tag', color: COLORS.red },
  { name: '기타', icon: 'more-horizontal', color: COLORS.muted },
];
const categoryOf = (name: string) => CATEGORIES.find((c) => c.name === name) ?? CATEGORIES[CATEGORIES.length - 1];

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

// 'YYYY-MM-DD' 를 delta 일 이동 (시간대 영향 없게 로컬 날짜로 계산)
export function shiftDate(date: string, delta: number) {
  const [y, m, d] = date.split('-').map(Number);
  const next = new Date(y, m - 1, d + delta);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`;
}
// self-check: 월말·연말 넘김
if (shiftDate('2026-11-30', 1) !== '2026-12-01' || shiftDate('2026-01-01', -1) !== '2025-12-31') {
  throw new Error('shiftDate self-check failed');
}

// 최신 날짜가 위로
const sortExpenses = (list: ExpenseItem[]) =>
  [...list].sort((a, b) => (a.spentOn === b.spentOn ? b.id - a.id : a.spentOn < b.spentOn ? 1 : -1));

function dayLabel(date: string, today: string) {
  if (date === today) return '오늘';
  const [, m, d] = date.split('-');
  return `${Number(m)}월 ${Number(d)}일`;
}

type Sheet = null | 'add' | 'edit' | 'split';

// 세부 내용이 없으면(분류 이름과 같으면) 분류만 표시
const detailOf = (item: ExpenseItem) => (item.title && item.title !== item.category ? item.title : '');

export default function ExpenseScreen({ navigation }: Props) {
  // 비회원도 들어와서 N빵 계산은 가능. 지출 저장·목록은 회원만
  const [isMember, setIsMember] = useState(false);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currency, setCurrency] = useState('USD');
  const [showCurrencies, setShowCurrencies] = useState(false);
  const [people, setPeople] = useState(2);
  const [splitInput, setSplitInput] = useState(0); // 직접 입력한 나눌 금액 (0이면 가계부 총액)
  const [today, setToday] = useState(getFallbackTodayKey());
  const [message, setMessage] = useState('');

  // 바텀시트 (지출 추가 / 나눌 금액)
  const [sheet, setSheet] = useState<Sheet>(null);
  const [draftAmount, setDraftAmount] = useState(0);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCategory, setDraftCategory] = useState(CATEGORIES[0].name);
  const [sheetMessage, setSheetMessage] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState(getFallbackTodayKey());

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
    setShowCurrencies(false);
    void AsyncStorage.setItem(CURRENCY_KEY, next).catch(() => undefined);
  };

  const openAdd = async () => {
    if (!(await ensureLoggedIn(navigation))) return;
    setDraftAmount(0);
    setDraftTitle('');
    setDraftDate(today);
    setSheetMessage('');
    setSheet('add');
  };

  // 연필: 세부 내용(예: 00음식점)·금액·분류 수정
  const openEdit = (item: ExpenseItem) => {
    setEditingId(item.id);
    setDraftAmount(item.amount);
    setDraftTitle(detailOf(item));
    setDraftCategory(item.category);
    setDraftDate(item.spentOn);
    setSheetMessage('');
    setSheet('edit');
  };

  const openSplit = () => {
    setDraftAmount(splitInput || total);
    setSheetMessage('');
    setSheet('split');
  };

  const confirmSheet = async () => {
    if (sheet === 'split') {
      setSplitInput(draftAmount);
      setSheet(null);
      return;
    }
    if (!(draftAmount > 0)) {
      setSheetMessage('금액을 입력해주세요.');
      return;
    }
    try {
      const title = draftTitle.trim() || draftCategory; // 세부 내용을 비우면 분류 이름으로
      const body = { spentOn: draftDate, title, amount: draftAmount, category: draftCategory };
      if (sheet === 'edit' && editingId !== null) {
        const updated = await updateExpense(editingId, body);
        setItems((current) => sortExpenses(current.map((i) => (i.id === updated.id ? updated : i))));
      } else {
        const created = await addExpense(body);
        setItems((current) => sortExpenses([created, ...current]));
      }
      setSheet(null);
    } catch (error) {
      setSheetMessage(getApiErrorMessage(error));
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

  // 내보내기: 요약·N빵·분류별·내역을 텍스트로. 폰은 공유 메뉴, PC(웹)는 파일 다운로드
  const exportData = async () => {
    if (!(await ensureLoggedIn(navigation))) return;
    try {
      const fx = (n: number) => (rateValue > 0 ? ` (${toForeign(n)})` : '');
      const text = [
        `가자GO 여행 가계부 (${today} 내보냄)`,
        '',
        '[요약]',
        `총 지출: ${won(total)}${fx(total)}`,
        `기록 ${items.length}건 · 하루 평균 ${won(dayCount ? total / dayCount : 0)}`,
        '',
        '[N빵]',
        `나눌 금액 ${won(splitBase)} ÷ ${people}명 → 한 사람당 ${won(perPerson)}${fx(perPerson)}`,
        '',
        '[어디에 썼을까요]',
        ...byCategory.map((c) => `${c.name} ${won(c.sum)} (${Math.round((c.sum / total) * 100)}%)`),
        '',
        '[내역] 날짜,분류,세부 내용,금액(원)',
        ...items.map((i) => `${i.spentOn},${i.category},"${detailOf(i).replace(/"/g, '""')}",${i.amount}`),
      ].join('\n');

      if (Platform.OS === 'web') {
        // PC 브라우저: 텍스트 파일로 저장
        const doc = (globalThis as unknown as { document: any }).document;
        const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
        const a = doc.createElement('a');
        a.href = url;
        a.download = `gajago-가계부-${today}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage('파일로 저장했어요');
      } else {
        await Share.share({ title: '가자GO 여행 가계부', message: text });
      }
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  };

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const todayTotal = items.filter((i) => i.spentOn === today).reduce((sum, i) => sum + i.amount, 0);
  const dayCount = new Set(items.map((i) => i.spentOn)).size;
  const rateValue = currency === 'KRW' ? 0 : rates[currency] ?? 0;
  const toForeign = (n: number) =>
    rateValue > 0 ? `≈ ${(n / rateValue).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}` : '';
  const splitBase = splitInput > 0 ? splitInput : total;
  const perPerson = splitAmount(splitBase, people);

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
      <ScrollView contentContainerStyle={styles.content}>
        {/* 요약: 큰 총액 하나 + 환산 */}
        <View style={styles.summary}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>이번 여행에 쓴 돈</Text>
            <Pressable style={styles.currencyPill} onPress={() => setShowCurrencies((v) => !v)} accessibilityRole="button">
              <Text style={styles.currencyPillText}>{currency}</Text>
              <Feather name={showCurrencies ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.text} />
            </Pressable>
          </View>
          <Text style={styles.total}>{won(total)}</Text>
          {rateValue > 0 ? <Text style={styles.converted}>{toForeign(total)}</Text> : null}
          {showCurrencies ? (
            <View style={styles.currencyGrid}>
              {CURRENCIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.currencyOption, c === currency ? styles.currencyOptionOn : null]}
                  onPress={() => chooseCurrency(c)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: c === currency }}
                >
                  <Text style={[styles.currencyOptionText, c === currency ? styles.currencyOptionTextOn : null]}>{c}</Text>
                </Pressable>
              ))}
              {rateValue > 0 ? (
                <Text style={styles.rateNote}>
                  1 {currency} ≈ {rateValue.toLocaleString('ko-KR', { maximumFractionDigits: 2 })}원 · 하루 2회 갱신
                </Text>
              ) : null}
            </View>
          ) : null}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>오늘</Text>
              <Text style={styles.statValue}>{won(todayTotal)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>하루 평균</Text>
              <Text style={styles.statValue}>{won(dayCount ? total / dayCount : 0)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statLabel}>기록</Text>
              <Text style={styles.statValue}>{items.length}건</Text>
            </View>
          </View>
        </View>

        {/* N빵: 금액을 누르면 키패드 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>N빵 계산</Text>
          <Pressable style={styles.splitAmount} onPress={openSplit} accessibilityRole="button" accessibilityLabel="나눌 금액 입력">
            <Text style={styles.splitAmountLabel}>나눌 금액</Text>
            <Text style={splitBase > 0 ? styles.splitAmountValue : styles.splitAmountPlaceholder}>
              {splitBase > 0 ? won(splitBase) : '눌러서 입력'}
            </Text>
            <Feather name="edit-2" size={14} color={COLORS.muted} />
          </Pressable>
          <View style={styles.splitRow}>
            <View style={styles.stepperGroup}>
              <Pressable style={styles.stepper} onPress={() => setPeople((p) => Math.max(1, p - 1))} accessibilityLabel="인원 줄이기">
                <Feather name="minus" size={18} color={COLORS.ink} />
              </Pressable>
              <Text style={styles.people}>{people}명</Text>
              <Pressable style={styles.stepper} onPress={() => setPeople((p) => Math.min(30, p + 1))} accessibilityLabel="인원 늘리기">
                <Feather name="plus" size={18} color={COLORS.ink} />
              </Pressable>
            </View>
            <View style={styles.splitResult}>
              <Text style={styles.splitResultLabel}>한 사람당</Text>
              <Text style={styles.splitResultValue}>{won(perPerson)}</Text>
              {rateValue > 0 && perPerson > 0 ? <Text style={styles.subText}>{toForeign(perPerson)}</Text> : null}
            </View>
          </View>
        </View>

        {/* 분류별 */}
        {byCategory.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>어디에 썼을까요</Text>
            <View style={styles.bar}>
              {byCategory.map((c) => (
                <View key={c.name} style={{ flex: c.sum, backgroundColor: c.color }} />
              ))}
            </View>
            {byCategory.map((c) => (
              <View key={c.name} style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: `${c.color}1F` }]}>
                  <Feather name={c.icon} size={16} color={c.color} />
                </View>
                <Text style={styles.rowTitle}>{c.name}</Text>
                <Text style={styles.rowPct}>{Math.round((c.sum / total) * 100)}%</Text>
                <Text style={styles.rowAmount}>{won(c.sum)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* 날짜별 내역 */}
        {isMember ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내역</Text>
            {byDate.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="file-text" size={28} color={COLORS.line} />
                <Text style={styles.emptyText}>아직 기록이 없어요{'\n'}아래 버튼으로 첫 지출을 추가해 보세요</Text>
              </View>
            ) : (
              byDate.map(([date, list]) => (
                <View key={date} style={styles.dayGroup}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{dayLabel(date, today)}</Text>
                    <Text style={styles.daySum}>{won(list.reduce((s, i) => s + i.amount, 0))}</Text>
                  </View>
                  {list.map((item) => {
                    const c = categoryOf(item.category);
                    return (
                      <Pressable
                        key={item.id}
                        style={styles.row}
                        onPress={() => openEdit(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.category} ${detailOf(item)} 수정`}
                      >
                        <View style={[styles.rowIcon, { backgroundColor: `${c.color}1F` }]}>
                          <Feather name={c.icon} size={16} color={c.color} />
                        </View>
                        <View style={styles.rowBody}>
                          <View style={styles.rowTitleLine}>
                            <Text style={styles.rowName}>{item.category}</Text>
                            <Feather name="edit-2" size={12} color={COLORS.muted} style={styles.pencil} />
                          </View>
                          <Text style={detailOf(item) ? styles.detailText : styles.detailEmpty} numberOfLines={1}>
                            {detailOf(item) || '세부 내용 추가'}
                          </Text>
                        </View>
                        <View style={styles.rowRight}>
                          <Text style={styles.rowAmount}>-{won(item.amount)}</Text>
                          {rateValue > 0 ? <Text style={styles.subText}>{toForeign(item.amount)}</Text> : null}
                        </View>
                        <Pressable onPress={() => remove(item.id)} style={styles.rowDelete} accessibilityLabel={`${item.title} 삭제`}>
                          <Feather name="x" size={16} color={COLORS.muted} />
                        </Pressable>
                      </Pressable>
                    );
                  })}
                </View>
              ))
            )}
            {items.length > 0 ? (
              <Pressable style={styles.exportLink} onPress={exportData} accessibilityRole="button">
                <Feather name="download" size={14} color={COLORS.muted} />
                <Text style={styles.exportText}>내 기록 내보내기 (백업)</Text>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View style={styles.guestBox}>
            <Feather name="lock" size={18} color={COLORS.muted} />
            <Text style={styles.guestText}>로그인하면 지출을 기록하고 여행이 끝나도 다시 볼 수 있어요. N빵 계산은 로그인 없이 쓸 수 있어요.</Text>
          </View>
        )}
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.bottomBar}>
        <Pressable style={styles.cta} onPress={openAdd} accessibilityRole="button">
          <Feather name="plus" size={18} color={COLORS.white} />
          <Text style={styles.ctaText}>지출 추가</Text>
        </Pressable>
      </View>

      {/* 바텀시트: 큰 금액 + 키패드 */}
      <Modal visible={sheet !== null} transparent animationType="slide" onRequestClose={() => setSheet(null)}>
        <Pressable style={styles.backdrop} onPress={() => setSheet(null)} accessibilityLabel="닫기" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>{sheet === 'split' ? '얼마를 나눌까요?' : sheet === 'edit' ? '지출 수정' : '얼마를 썼나요?'}</Text>
          <Text style={[styles.sheetAmount, draftAmount === 0 ? styles.sheetAmountEmpty : null]}>
            {draftAmount > 0 ? won(draftAmount) : '0원'}
          </Text>
          {rateValue > 0 && draftAmount > 0 ? <Text style={styles.sheetConverted}>{toForeign(draftAmount)}</Text> : null}

          {sheet === 'add' || sheet === 'edit' ? (
            <>
              <View style={styles.dateRow}>
                <Pressable style={styles.dateArrow} onPress={() => setDraftDate((d) => shiftDate(d, -1))} accessibilityLabel="전날">
                  <Feather name="chevron-left" size={18} color={COLORS.ink} />
                </Pressable>
                <Text style={styles.dateText}>
                  {dayLabel(draftDate, today)}
                  {draftDate !== today ? '' : ` · ${Number(today.split('-')[1])}월 ${Number(today.split('-')[2])}일`}
                </Text>
                <Pressable style={styles.dateArrow} onPress={() => setDraftDate((d) => shiftDate(d, 1))} accessibilityLabel="다음날">
                  <Feather name="chevron-right" size={18} color={COLORS.ink} />
                </Pressable>
                {draftDate !== today ? (
                  <Pressable style={styles.todayChip} onPress={() => setDraftDate(today)} accessibilityRole="button">
                    <Text style={styles.todayChipText}>오늘</Text>
                  </Pressable>
                ) : null}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sheetChips}>
                {CATEGORIES.map((c) => {
                  const on = c.name === draftCategory;
                  return (
                    <Pressable
                      key={c.name}
                      style={[styles.chip, on ? { backgroundColor: c.color, borderColor: c.color } : null]}
                      onPress={() => setDraftCategory(c.name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                    >
                      <Feather name={c.icon} size={14} color={on ? COLORS.white : c.color} />
                      <Text style={[styles.chipText, on ? styles.chipTextOn : null]}>{c.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                style={styles.titleInput}
                value={draftTitle}
                onChangeText={setDraftTitle}
                placeholder="세부 내용 (예: 명동교자, 공항철도)"
                placeholderTextColor={COLORS.muted}
              />
            </>
          ) : null}

          <AmountKeypad value={draftAmount} onChange={setDraftAmount} />
          {sheetMessage ? <Text style={styles.message}>{sheetMessage}</Text> : null}
          <Pressable
            style={[styles.cta, styles.sheetCta, sheet !== 'split' && draftAmount === 0 ? styles.ctaDisabled : null]}
            onPress={confirmSheet}
            accessibilityRole="button"
          >
            <Text style={styles.ctaText}>
              {sheet === 'split' ? '확인' : sheet === 'edit' ? '수정 완료' : draftAmount > 0 ? `${won(draftAmount)} 기록하기` : '기록하기'}
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screen },
  content: { paddingBottom: 110 },

  summary: { backgroundColor: COLORS.white, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 18, marginBottom: 10 },
  summaryTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { color: COLORS.text, fontSize: 15, fontWeight: '600' },
  currencyPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  currencyPillText: { color: COLORS.text, fontSize: 13, fontWeight: '800', marginRight: 2 },
  total: { color: COLORS.ink, fontSize: 34, fontWeight: '800', marginTop: 6, letterSpacing: -0.5 },
  converted: { color: COLORS.muted, fontSize: 15, fontWeight: '600', marginTop: 2 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  currencyOption: { borderRadius: 10, backgroundColor: COLORS.card, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6, marginBottom: 6 },
  currencyOptionOn: { backgroundColor: COLORS.ink },
  currencyOptionText: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  currencyOptionTextOn: { color: COLORS.white },
  rateNote: { width: '100%', color: COLORS.muted, fontSize: 12, marginTop: 4 },
  stats: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: radius.md, paddingVertical: 12, marginTop: 18 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.line },
  statLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  statValue: { color: COLORS.ink, fontSize: 15, fontWeight: '800', marginTop: 3 },

  section: { backgroundColor: COLORS.white, paddingHorizontal: 22, paddingVertical: 18, marginBottom: 10 },
  sectionTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '800', marginBottom: 14 },

  splitAmount: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14 },
  splitAmountLabel: { color: COLORS.muted, fontSize: 14, fontWeight: '600', marginRight: 10 },
  splitAmountValue: { flex: 1, color: COLORS.ink, fontSize: 18, fontWeight: '800' },
  splitAmountPlaceholder: { flex: 1, color: COLORS.muted, fontSize: 16, fontWeight: '600' },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  stepperGroup: { flexDirection: 'row', alignItems: 'center' },
  stepper: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  people: { color: COLORS.ink, fontSize: 17, fontWeight: '800', minWidth: 52, textAlign: 'center' },
  splitResult: { alignItems: 'flex-end' },
  splitResultLabel: { color: COLORS.muted, fontSize: 12, fontWeight: '600' },
  splitResultValue: { color: COLORS.teal, fontSize: 24, fontWeight: '800' },

  bar: { flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  rowIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rowBody: { flex: 1 },
  rowTitle: { flex: 1, color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  rowPct: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginRight: 12 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  rowDelete: { padding: 6, marginLeft: 6 },
  rowTitleLine: { flexDirection: 'row', alignItems: 'center' },
  rowName: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  pencil: { marginLeft: 6 },
  detailText: { color: COLORS.text, fontSize: 13, marginTop: 2 },
  detailEmpty: { color: COLORS.muted, fontSize: 12, marginTop: 2, textDecorationLine: 'underline' },
  subText: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  dayGroup: { marginBottom: 6 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4, paddingBottom: 2 },
  dayTitle: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  daySum: { color: COLORS.muted, fontSize: 13, fontWeight: '700' },
  emptyBox: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: COLORS.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 10 },
  exportLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 4 },
  exportText: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginLeft: 6, textDecorationLine: 'underline' },
  guestBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.white, paddingHorizontal: 22, paddingVertical: 18 },
  guestText: { flex: 1, color: COLORS.text, fontSize: 14, lineHeight: 21, marginLeft: 10 },
  message: { color: COLORS.red, fontSize: 13, marginTop: 8, paddingHorizontal: 22 },

  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24, backgroundColor: COLORS.screen },
  cta: { flexDirection: 'row', minHeight: 54, borderRadius: radius.md, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: COLORS.white, fontSize: 16, fontWeight: '800', marginLeft: 6 },

  backdrop: { flex: 1, backgroundColor: '#00000066' },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line, marginBottom: 14 },
  sheetTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  sheetAmount: { color: COLORS.ink, fontSize: 36, fontWeight: '800', marginTop: 6 },
  sheetAmountEmpty: { color: COLORS.line },
  sheetConverted: { color: COLORS.muted, fontSize: 14, fontWeight: '600' },
  sheetChips: { marginTop: 14, flexGrow: 0 },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 12, paddingVertical: 8, marginRight: 6 },
  chipText: { color: COLORS.ink, fontSize: 14, fontWeight: '700', marginLeft: 5 },
  chipTextOn: { color: COLORS.white },
  titleInput: { minHeight: 46, borderRadius: radius.md, backgroundColor: COLORS.card, paddingHorizontal: 14, marginTop: 10, marginBottom: 6, color: COLORS.ink, fontSize: 15 },
  sheetCta: { marginTop: 10 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  dateArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  dateText: { color: COLORS.ink, fontSize: 15, fontWeight: '800', marginHorizontal: 12, minWidth: 110, textAlign: 'center' },
  todayChip: { borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 4 },
  todayChipText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
});
