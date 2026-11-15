import { useEffect, useRef, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Modal, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { getApiErrorMessage, type ExpenseItem } from '../../api';
import { COLORS, radius } from '../../theme';
import { DateRangeRow } from './DateRangeRow';
import { ExpenseReceipt } from './ExpenseReceipt';
import { CATEGORIES, detailOf, splitAmount, won } from './expenseUtils';
import { sheetStyles as s } from './sheetStyles';

type Props = {
  visible: boolean;
  initialFrom: string;
  initialTo: string;
  items: ExpenseItem[];
  people: number;
  currency: string;
  toForeign: (n: number) => string;
  today: string;
  tripName?: string;
  onClose: () => void;
  onMessage: (message: string) => void;
};

// 공유하기: 기간을 골라 영수증 미리보기 → 폰은 이미지 공유, PC(웹)는 텍스트 파일 저장
export function ShareSheet({ visible, initialFrom, initialTo, items, people, currency, toForeign, today, tripName, onClose, onMessage }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [isSharing, setIsSharing] = useState(false);
  const receiptRef = useRef<View>(null);

  useEffect(() => {
    if (!visible) return;
    setFrom(initialFrom);
    setTo(initialTo);
  }, [visible, initialFrom, initialTo]);

  const shareItems = items.filter((i) => i.spentOn >= from && i.spentOn <= to);
  const shareTotal = shareItems.reduce((sum, i) => sum + i.amount, 0);

  const downloadText = () => {
    const each = splitAmount(shareTotal, people);
    const fx = (n: number) => (toForeign(n) ? ` (${toForeign(n)})` : '');
    const cats = CATEGORIES.map((c) => ({ name: c.name, sum: shareItems.filter((i) => i.category === c.name).reduce((a, i) => a + i.amount, 0) }))
      .filter((c) => c.sum > 0)
      .sort((a, b) => b.sum - a.sum);
    const text = [
      `가자GO 여행 가계부 (${from} ~ ${to})`,
      '',
      '[요약]',
      `총 지출: ${won(shareTotal)}${fx(shareTotal)}`,
      `기록 ${shareItems.length}건`,
      '',
      '[N빵]',
      `${won(shareTotal)} ÷ ${people}명 → 한 사람당 ${won(each)}${fx(each)}`,
      '',
      '[어디에 썼을까요]',
      ...cats.map((c) => `${c.name} ${won(c.sum)} (${Math.round((c.sum / shareTotal) * 100)}%)`),
      '',
      '[내역] 날짜,분류,세부 내용,금액(원)',
      ...shareItems.map((i) => `${i.spentOn},${i.category},"${detailOf(i).replace(/"/g, '""')}",${i.amount}`),
    ].join('\n');
    const doc = (globalThis as unknown as { document: any }).document;
    const url = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }));
    const a = doc.createElement('a');
    a.href = url;
    a.download = `gajago-가계부-${from}_${to}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onMessage('파일로 저장했어요');
  };

  const share = async () => {
    setIsSharing(true);
    try {
      if (Platform.OS === 'web') {
        downloadText();
      } else {
        const uri = await captureRef(receiptRef, { format: 'png', quality: 1, result: 'tmpfile' });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: '가계부 공유' });
        } else {
          await Share.share({ url: uri, message: '가자GO 여행 가계부' });
        }
      }
      onClose();
    } catch (error) {
      onMessage(getApiErrorMessage(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>공유할 기간</Text>
          <DateRangeRow label="시작" value={from} today={today} onChange={(d) => setFrom(d > to ? to : d)} />
          <DateRangeRow label="끝" value={to} today={today} onChange={(d) => setTo(d < from ? from : d)} />
          <ScrollView style={styles.receiptScroll} contentContainerStyle={styles.receiptWrap}>
            <View ref={receiptRef} collapsable={false}>
              <ExpenseReceipt
                items={shareItems}
                from={from}
                to={to}
                people={people}
                perPerson={splitAmount(shareTotal, people)}
                currency={currency}
                toForeign={toForeign}
                createdOn={today}
                tripName={tripName}
              />
            </View>
          </ScrollView>
          <Pressable
            style={[s.cta, shareItems.length === 0 || isSharing ? s.ctaDisabled : null]}
            onPress={share}
            disabled={shareItems.length === 0 || isSharing}
            accessibilityRole="button"
          >
            <Feather name={Platform.OS === 'web' ? 'download' : 'share-2'} size={18} color={COLORS.white} />
            <Text style={s.ctaText}>{Platform.OS === 'web' ? '파일로 저장' : '이미지로 공유'}</Text>
          </Pressable>
          <Pressable style={styles.closeLink} onPress={onClose} accessibilityRole="button">
            <Text style={styles.closeText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  receiptScroll: { marginTop: 14, marginBottom: 12, backgroundColor: COLORS.screen, borderRadius: radius.lg },
  receiptWrap: { padding: 14 },
  closeLink: { alignItems: 'center', paddingTop: 12 },
  closeText: { color: COLORS.muted, fontSize: 13, fontWeight: '600', marginLeft: 6, textDecorationLine: 'underline' },
});
