import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  addExpense,
  deleteExpense,
  getApiErrorMessage,
  getExpenses,
  getSavedFestivals,
  getServerTodayKey,
  type ExpenseItem,
} from '../api';
import { AppHeader } from '../components/common/AppHeader';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';
import { getFallbackTodayKey } from '../utils/date';
import { LOGIN_REQUIRED_MESSAGE, isLoggedIn, useLoginPromptOnFocus } from '../utils/requireLogin';

type Props = NativeStackScreenProps<RootStackParamList, 'Expense'>;

const CATEGORIES = ['교통', '식비', '쇼핑', '숙박', '입장료', '기타'];
// 환율은 사용자가 직접 입력 (외부 환율 API 없이 가볍게). 기기에만 저장
const RATE_KEY = 'gajago.expense.rate';
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
  useLoginPromptOnFocus(navigation);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rate, setRate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [people, setPeople] = useState('2');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!(await isLoggedIn())) {
      setMessage(LOGIN_REQUIRED_MESSAGE);
      return;
    }
    try {
      setItems(await getExpenses());
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
    void AsyncStorage.multiGet([RATE_KEY, CURRENCY_KEY])
      .then(([[, r], [, c]]) => {
        if (r) setRate(r);
        if (c) setCurrency(c);
      })
      .catch(() => undefined);
  }, []);

  const saveRate = (nextRate: string, nextCurrency: string) => {
    setRate(nextRate);
    setCurrency(nextCurrency);
    void AsyncStorage.multiSet([
      [RATE_KEY, nextRate],
      [CURRENCY_KEY, nextCurrency],
    ]).catch(() => undefined);
  };

  const add = async () => {
    const value = Number(amount.replace(/[^0-9]/g, ''));
    if (!title.trim() || !(value > 0)) {
      setMessage('내용과 금액(원)을 입력해주세요.');
      return;
    }
    try {
      const spentOn = await getServerTodayKey().catch(() => getFallbackTodayKey());
      const created = await addExpense({ spentOn, title: title.trim(), amount: value, category });
      setItems((current) => [created, ...current]);
      setTitle('');
      setAmount('');
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
  const rateValue = Number(rate);
  const converted = rateValue > 0 ? total / rateValue : null;
  const perPerson = splitAmount(total, Number(people));

  return (
    <View style={styles.screen}>
      <AppHeader title="여행 가계부" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>총 지출</Text>
          <Text style={styles.total}>{won(total)}</Text>
          {converted !== null ? (
            <Text style={styles.sub}>
              ≈ {converted.toFixed(2)} {currency}
            </Text>
          ) : null}
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.small]} value={currency} onChangeText={(c) => saveRate(rate, c.toUpperCase())} placeholder="USD" autoCapitalize="characters" />
            <TextInput
              style={[styles.input, styles.flex]}
              value={rate}
              onChangeText={(r) => saveRate(r.replace(/[^0-9.]/g, ''), currency)}
              placeholder="환율: 1 단위 = 몇 원? (예: 1400)"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>N빵 정산</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.small]} value={people} onChangeText={(p) => setPeople(p.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
            <Text style={styles.sub}>명이면 1인당 {won(perPerson)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>지출 추가</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable key={c} style={[styles.chip, c === category ? styles.chipOn : null]} onPress={() => setCategory(c)}>
                <Text style={[styles.chipText, c === category ? styles.chipTextOn : null]}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="내용 (예: 지하철, 비빔밥)" />
          <TextInput style={styles.input} value={amount} onChangeText={setAmount} placeholder="금액 (원)" keyboardType="number-pad" />
          <Pressable style={styles.primary} onPress={add} accessibilityRole="button">
            <Text style={styles.primaryText}>추가</Text>
          </Pressable>
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>

        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.sub}>
                {item.spentOn} · {item.category}
              </Text>
            </View>
            <Text style={styles.itemAmount}>{won(item.amount)}</Text>
            <Pressable onPress={() => remove(item.id)} accessibilityLabel={`${item.title} 삭제`}>
              <Text style={styles.delete}>삭제</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.secondary} onPress={exportData} accessibilityRole="button">
          <Text style={styles.secondaryText}>내 기록 내보내기 (백업)</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screen },
  content: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12 },
  label: { color: COLORS.ink, fontSize: 14, fontWeight: '900', marginBottom: 8 },
  total: { color: COLORS.ink, fontSize: 28, fontWeight: '900' },
  sub: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginLeft: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  flex: { flex: 1 },
  small: { width: 70, marginRight: 8 },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingHorizontal: 12,
    marginTop: 8,
    color: COLORS.ink,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { borderRadius: 16, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6, marginBottom: 6 },
  chipOn: { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  chipText: { color: COLORS.ink, fontSize: 13, fontWeight: '700' },
  chipTextOn: { color: COLORS.white },
  primary: { minHeight: 46, borderRadius: 12, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  primaryText: { color: COLORS.white, fontSize: 15, fontWeight: '900' },
  secondary: { minHeight: 46, borderRadius: 12, borderWidth: 1, borderColor: COLORS.teal, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  secondaryText: { color: COLORS.teal, fontSize: 14, fontWeight: '800' },
  message: { color: COLORS.red, fontSize: 12, marginTop: 8 },
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 8 },
  itemTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '800' },
  itemAmount: { color: COLORS.ink, fontSize: 15, fontWeight: '900', marginHorizontal: 10 },
  delete: { color: COLORS.red, fontSize: 13, fontWeight: '700' },
});
