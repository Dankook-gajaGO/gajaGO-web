import { StyleSheet, Text, View } from 'react-native';
import type { Memo } from '../../data/calendar';
import { COLORS, radius, shadow } from '../../theme';

interface MemoPreviewCardProps {
  memo: Memo;
}

export function MemoPreviewCard({ memo }: MemoPreviewCardProps) {
  return (
    <View style={[styles.card, shadow.card]}>
      <Text style={styles.date}>{memo.date}</Text>
      <Text style={styles.title}>{memo.title}</Text>
      {memo.content ? <Text style={styles.content}>{memo.content}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
  },
  date: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  title: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  content: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
});
