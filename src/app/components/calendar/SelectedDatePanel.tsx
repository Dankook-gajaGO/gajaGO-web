import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Memo } from '../../data/calendar';
import { COLORS, radius } from '../../theme';

interface SelectedDatePanelProps {
  selectedDate: string;
  memos: Memo[];
  draft: string;
  onChangeDraft: (value: string) => void;
  onAddMemo: () => void;
}

export function SelectedDatePanel({
  selectedDate,
  memos,
  draft,
  onChangeDraft,
  onAddMemo,
}: SelectedDatePanelProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.date}>{selectedDate}</Text>
      {memos.length > 0 ? (
        memos.map((memo) => (
          <View key={memo.id} style={styles.memo}>
            <Text style={styles.memoTitle}>{memo.title}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>이 날짜에는 메모가 없습니다.</Text>
      )}
      <View style={styles.inputRow}>
        <TextInput
          value={draft}
          onChangeText={onChangeDraft}
          placeholder="메모 추가"
          placeholderTextColor={COLORS.muted}
          style={styles.input}
        />
        <Pressable style={styles.addButton} onPress={onAddMemo}>
          <Feather name="plus" size={20} color={COLORS.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: radius.lg,
    padding: 16,
  },
  date: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 12,
  },
  memo: {
    borderRadius: radius.md,
    backgroundColor: '#E5F7F7',
    padding: 12,
    marginBottom: 8,
  },
  memoTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyText: {
    color: COLORS.muted,
    fontSize: 13,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: COLORS.card,
    color: COLORS.ink,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
