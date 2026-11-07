import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  addExpense,
  addTrip,
  deleteTrip,
  deleteExpense,
  getApiErrorMessage,
  getExchangeRates,
  getExpenses,
  getTrips,
  getServerTodayKey,
  updateExpense,
  type ExpenseItem,
  type TripItem,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import { AmountKeypad } from '../components/expense/AmountKeypad';
import { ExpenseReceipt } from '../components/expense/ExpenseReceipt';
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
  // 공유하기: 기간을 골라 영수증 이미지로
  const [shareOpen, setShareOpen] = useState(false);
  const [shareFrom, setShareFrom] = useState(getFallbackTodayKey());
  const [shareTo, setShareTo] = useState(getFallbackTodayKey());
  const [isSharing, setIsSharing] = useState(false);
  const receiptRef = useRef<View>(null);
  // 여행: 선택하면 그 기간의 지출만 보여줌 (null = 전체)
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [tripId, setTripId] = useState<number | null>(null);
  const [tripSheet, setTripSheet] = useState(false);
  const [tripName, setTripName] = useState('');
  const [tripStart, setTripStart] = useState(getFallbackTodayKey());
  const [tripEnd, setTripEnd] = useState(getFallbackTodayKey());
  const [tripMessage, setTripMessage] = useState('');

  const load = useCallback(async () => {
    const member = await isLoggedIn();
    setIsMember(member);
    if (!member) return;
    try {
      const [expenses, tripList] = await Promise.all([getExpenses(), getTrips()]);
      setItems(expenses);
      setTrips(tripList);
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
    setDraftDate(trip && (today < trip.startDate || today > trip.endDate) ? trip.startDate : today);
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

  const openTripSheet = async () => {
    if (!(await ensureLoggedIn(navigation))) return;
    setTripName('');
    setTripStart(today);
    setTripEnd(shiftDate(today, 2));
    setTripMessage('');
    setTripSheet(true);
  };

  const createTrip = async () => {
    if (!tripName.trim()) {
      setTripMessage('여행 이름을 입력해주세요.');
      return;
    }
    try {
      const created = await addTrip({ name: tripName.trim(), startDate: tripStart, endDate: tripEnd });
      setTrips((list) => [created, ...list].sort((a, b) => (a.startDate < b.startDate ? 1 : -1)));
      setTripId(created.id);
      setTripSheet(false);
    } catch (error) {
      setTripMessage(getApiErrorMessage(error));
    }
  };

  // 여행만 지움 (그 기간 지출은 그대로)
  const removeTrip = async (id: number) => {
    try {
      await deleteTrip(id);
      setTrips((list) => list.filter((t) => t.id !== id));
      setTripId(null);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
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

  // 공유하기 열기: 기본 기간 = 첫 기록 ~ 마지막 기록
  const openShare = async () => {
    if (!(await ensureLoggedIn(navigation))) return;
    if (visibleItems.length === 0) {
      setMessage('공유할 기록이 없어요');
      return;
    }
    const dates = visibleItems.map((i) => i.spentOn).sort();
    setShareFrom(trip ? trip.startDate : dates[0] ?? today);
    setShareTo(trip ? trip.endDate : dates[dates.length - 1] ?? today);
    setShareOpen(true);
  };

  // 폰: 영수증을 이미지로 캡처해 공유 메뉴(카톡·라인 등). PC(웹): 텍스트 파일로 저장
  const shareReceipt = async () => {
    setIsSharing(true);
    try {
      if (Platform.OS === 'web') {
        downloadText(shareItems);
      } else {
        const uri = await captureRef(receiptRef, { format: 'png', quality: 1, result: 'tmpfile' });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '가계부 공유' });
        } else {
          await Share.share({ url: uri, message: '가자GO 여행 가계부' });
        }
      }
      setShareOpen(false);
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    } finally {
      setIsSharing(false);
    }
  };

  const downloadText = (list: ExpenseItem[]) => {
    const sum = list.reduce((acc, i) => acc + i.amount, 0);
    const each = splitAmount(sum, people);
    const fx = (n: number) => (rateValue > 0 ? ` (${toForeign(n)})` : '');
    const cats = CATEGORIES.map((c) => ({ name: c.name, sum: list.filter((i) => i.category === c.name).reduce((a, i) => a + i.amount, 0) }))
      .filter((c) => c.sum > 0)
      .sort((a, b) => b.sum - a.sum);
    const text = [
      `가자GO 여행 가계부 (${shareFrom} ~ ${shareTo})`,
      '',
      '[요약]',
      `총 지출: ${won(sum)}${fx(sum)}`,
      `기록 ${list.length}건`,
      '',
      '[N빵]',
      `${won(sum)} ÷ ${people}명 → 한 사람당 ${won(each)}${fx(each)}`,
      '',
      '[어디에 썼을까요]',
      ...cats.map((c) => `${c.name} ${won(c.sum)} (${Math.round((c.sum / sum) * 100)}%)`),
      '',
      '[내역] 날짜,분류,세부 내용,금액(원)',
      ...list.map((i) => `${i.spentOn},${i.category},"${detailOf(i).replace(/"/g, '""')}",${i.amount}`),
    ].join('\n');
    const doc = (globalThis as unknown as { document: any }).document;
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    const a = doc.createElement('a');
    a.href = url;
    a.download = `gajago-가계부-${shareFrom}_${shareTo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage('파일로 저장했어요');
  };

  const trip = trips.find((t) => t.id === tripId) ?? null;
  const visibleItems = trip ? items.filter((i) => i.spentOn >= trip.startDate && i.spentOn <= trip.endDate) : items;
  const total = visibleItems.reduce((sum, item) => sum + item.amount, 0);
  const todayTotal = visibleItems.filter((i) => i.spentOn === today).reduce((sum, i) => sum + i.amount, 0);
  const dayCount = new Set(visibleItems.map((i) => i.spentOn)).size;
  const rateValue = currency === 'KRW' ? 0 : rates[currency] ?? 0;
  const toForeign = (n: number) =>
    rateValue > 0 ? `≈ ${(n / rateValue).toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}` : '';
  const splitBase = splitInput > 0 ? splitInput : total;
  const shareItems = items.filter((i) => i.spentOn >= shareFrom && i.spentOn <= shareTo);
  const shareTotal = shareItems.reduce((sum, i) => sum + i.amount, 0);
  const perPerson = splitAmount(splitBase, people);

  const byCategory = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, sum: visibleItems.filter((i) => i.category === c.name).reduce((s, i) => s + i.amount, 0) }))
        .filter((c) => c.sum > 0)
        .sort((a, b) => b.sum - a.sum),
    [visibleItems]
  );

  const byDate = useMemo(() => {
    const groups = new Map<string, ExpenseItem[]>();
    visibleItems.forEach((item) => groups.set(item.spentOn, [...(groups.get(item.spentOn) ?? []), item]));
    return [...groups.entries()];
  }, [visibleItems]);

  return (
    <View style={styles.screen}>
      <AppHeader title="여행 가계부" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {isMember ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripBar} contentContainerStyle={styles.tripBarInner}>
            {[{ id: null as number | null, name: '전체' }, ...trips].map((t) => (
              <Pressable
                key={t.id ?? 'all'}
                style={[styles.tripChip, t.id === tripId ? styles.tripChipOn : null]}
                onPress={() => setTripId(t.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: t.id === tripId }}
              >
                <Text style={[styles.tripChipText, t.id === tripId ? styles.tripChipTextOn : null]}>{t.name}</Text>
              </Pressable>
            ))}
            <Pressable style={styles.tripAdd} onPress={openTripSheet} accessibilityRole="button">
              <Feather name="plus" size={14} color={COLORS.teal} />
              <Text style={styles.tripAddText}>새 여행</Text>
            </Pressable>
          </ScrollView>
        ) : null}
        {/* 요약: 큰 총액 하나 + 환산 */}
        <View style={styles.summary}>
          <View style={styles.summaryTop}>
            <Text style={styles.summaryLabel}>
              {trip ? `${trip.name} · ${dayLabel(trip.startDate, today)} ~ ${dayLabel(trip.endDate, today)}` : '전체 지출'}
            </Text>
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

          {trip ? (
            <Pressable onPress={() => removeTrip(trip.id)} style={styles.tripDelete} accessibilityRole="button">
              <Text style={styles.tripDeleteText}>이 여행 삭제 (지출 기록은 남아요)</Text>
            </Pressable>
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
              <Text style={styles.statValue}>{visibleItems.length}건</Text>
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
            {visibleItems.length > 0 ? (
              <Pressable style={styles.shareButton} onPress={openShare} accessibilityRole="button">
                <Feather name="share-2" size={16} color={COLORS.teal} />
                <Text style={styles.shareButtonText}>공유하기</Text>
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

      {/* 새 여행: 이름 + 기간 */}
      <Modal visible={tripSheet} transparent animationType="slide" onRequestClose={() => setTripSheet(false)}>
        <Pressable style={styles.backdrop} onPress={() => setTripSheet(false)} accessibilityLabel="닫기" />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>새 여행</Text>
          <TextInput
            style={styles.titleInput}
            value={tripName}
            onChangeText={setTripName}
            placeholder="여행 이름 (예: 서울 여행)"
            placeholderTextColor={COLORS.muted}
            maxLength={40}
          />
          {(
            [
              ['시작', tripStart, (d: string) => {
                setTripStart(d);
                if (d > tripEnd) setTripEnd(d);
              }],
              ['끝', tripEnd, (d: string) => setTripEnd(d < tripStart ? tripStart : d)],
            ] as const
          ).map(([label, value, set]) => (
            <View key={label} style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>{label}</Text>
              <Pressable style={styles.dateArrow} onPress={() => set(shiftDate(value, -1))} accessibilityLabel={`${label} 하루 전`}>
                <Feather name="chevron-left" size={18} color={COLORS.ink} />
              </Pressable>
              <Text style={styles.dateText}>{dayLabel(value, today)}</Text>
              <Pressable style={styles.dateArrow} onPress={() => set(shiftDate(value, 1))} accessibilityLabel={`${label} 하루 뒤`}>
                <Feather name="chevron-right" size={18} color={COLORS.ink} />
              </Pressable>
            </View>
          ))}
          {tripMessage ? <Text style={styles.message}>{tripMessage}</Text> : null}
          <Pressable style={[styles.cta, styles.sheetCta]} onPress={createTrip} accessibilityRole="button">
            <Text style={styles.ctaText}>여행 만들기</Text>
          </Pressable>
        </View>
      </Modal>

      {/* 공유하기: 기간 선택 + 영수증 미리보기 */}
      <Modal visible={shareOpen} transparent animationType="slide" onRequestClose={() => setShareOpen(false)}>
        <View style={styles.shareBackdrop}>
          <View style={styles.shareSheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>공유할 기간</Text>
            {(
              [
                ['시작', shareFrom, (d: string) => setShareFrom(d > shareTo ? shareTo : d)],
                ['끝', shareTo, (d: string) => setShareTo(d < shareFrom ? shareFrom : d)],
              ] as const
            ).map(([label, value, set]) => (
              <View key={label} style={styles.rangeRow}>
                <Text style={styles.rangeLabel}>{label}</Text>
                <Pressable style={styles.dateArrow} onPress={() => set(shiftDate(value, -1))} accessibilityLabel={`${label} 하루 전`}>
                  <Feather name="chevron-left" size={18} color={COLORS.ink} />
                </Pressable>
                <Text style={styles.dateText}>{dayLabel(value, today)}</Text>
                <Pressable style={styles.dateArrow} onPress={() => set(shiftDate(value, 1))} accessibilityLabel={`${label} 하루 뒤`}>
                  <Feather name="chevron-right" size={18} color={COLORS.ink} />
                </Pressable>
              </View>
            ))}
            <ScrollView style={styles.receiptScroll} contentContainerStyle={styles.receiptWrap}>
              <View ref={receiptRef} collapsable={false}>
                <ExpenseReceipt
                  items={shareItems}
                  from={shareFrom}
                  to={shareTo}
                  people={people}
                  perPerson={splitAmount(shareTotal, people)}
                  currency={currency}
                  toForeign={toForeign}
                  createdOn={today}
                  tripName={trip?.name}
                />
              </View>
            </ScrollView>
            <Pressable
              style={[styles.cta, shareItems.length === 0 || isSharing ? styles.ctaDisabled : null]}
              onPress={shareReceipt}
              disabled={shareItems.length === 0 || isSharing}
              accessibilityRole="button"
            >
              <Feather name={Platform.OS === 'web' ? 'download' : 'share-2'} size={18} color={COLORS.white} />
              <Text style={styles.ctaText}>{Platform.OS === 'web' ? '파일로 저장' : '이미지로 공유'}</Text>
            </Pressable>
            <Pressable style={styles.closeLink} onPress={() => setShareOpen(false)} accessibilityRole="button">
              <Text style={styles.exportText}>닫기</Text>
            </Pressable>
          </View>
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
  tripBar: { backgroundColor: COLORS.white, flexGrow: 0 },
  tripBarInner: { paddingHorizontal: 22, paddingTop: 14, alignItems: 'center' },
  tripChip: { borderRadius: 16, backgroundColor: COLORS.card, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  tripChipOn: { backgroundColor: COLORS.ink },
  tripChipText: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  tripChipTextOn: { color: COLORS.white },
  tripAdd: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: COLORS.teal, paddingHorizontal: 12, paddingVertical: 7 },
  tripAddText: { color: COLORS.teal, fontSize: 13, fontWeight: '800', marginLeft: 4 },
  tripDelete: { alignSelf: 'flex-start', marginTop: 8 },
  tripDeleteText: { color: COLORS.muted, fontSize: 12, textDecorationLine: 'underline' },
  shareButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 46, borderRadius: radius.md, borderWidth: 1, borderColor: COLORS.teal, marginTop: 12 },
  shareButtonText: { color: COLORS.teal, fontSize: 15, fontWeight: '800', marginLeft: 6 },
  shareBackdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  shareSheet: { maxHeight: '92%', backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  rangeLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700', width: 36 },
  receiptScroll: { marginTop: 14, marginBottom: 12, backgroundColor: COLORS.screen, borderRadius: radius.lg },
  receiptWrap: { padding: 14 },
  closeLink: { alignItems: 'center', paddingTop: 12 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  dateArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  dateText: { color: COLORS.ink, fontSize: 15, fontWeight: '800', marginHorizontal: 12, minWidth: 110, textAlign: 'center' },
  todayChip: { borderRadius: 12, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 4 },
  todayChipText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
});
