import { useEffect, useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../../theme';
import { DateRangeRow } from './DateRangeRow';
import { shiftDate } from './expenseUtils';
import { sheetStyles as s } from './sheetStyles';

export type NewTrip = { name: string; startDate: string; endDate: string };

type Props = {
  visible: boolean;
  today: string;
  onClose: () => void;
  // 실패하면 오류 메시지를 던짐 (시트 안에 표시)
  onCreate: (trip: NewTrip, alarm: boolean) => Promise<void>;
};

// 새 여행: 이름 + 기간 (+ 시작일 알림 선택)
export function TripSheet({ visible, today, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(shiftDate(today, 2));
  const [alarm, setAlarm] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName('');
    setStart(today);
    setEnd(shiftDate(today, 2));
    setAlarm(false);
    setMessage('');
  }, [visible, today]);

  const submit = async () => {
    if (!name.trim()) {
      setMessage('여행 이름을 입력해주세요.');
      return;
    }
    try {
      await onCreate({ name: name.trim(), startDate: start, endDate: end }, alarm);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="닫기" />
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.sheetTitle}>새 여행</Text>
        <TextInput
          style={s.titleInput}
          value={name}
          onChangeText={setName}
          placeholder="여행 이름 (예: 서울 여행)"
          placeholderTextColor={COLORS.muted}
          maxLength={40}
        />
        <DateRangeRow
          label="시작"
          value={start}
          today={today}
          onChange={(d) => {
            setStart(d);
            if (d > end) setEnd(d);
          }}
        />
        <DateRangeRow label="끝" value={end} today={today} onChange={(d) => setEnd(d < start ? start : d)} />
        <Pressable style={styles.alarmToggle} onPress={() => setAlarm((v) => !v)} accessibilityRole="checkbox" accessibilityState={{ checked: alarm }}>
          <Feather name={alarm ? 'check-square' : 'square'} size={18} color={alarm ? COLORS.teal : COLORS.muted} />
          <Text style={styles.alarmToggleText}>여행 시작일 아침 8시에 알림 받기</Text>
        </Pressable>
        {message ? <Text style={s.message}>{message}</Text> : null}
        <Pressable style={[s.cta, s.sheetCta]} onPress={submit} accessibilityRole="button">
          <Text style={s.ctaText}>여행 만들기</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  alarmToggle: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  alarmToggleText: { color: COLORS.text, fontSize: 14, fontWeight: '600', marginLeft: 8 },
});
