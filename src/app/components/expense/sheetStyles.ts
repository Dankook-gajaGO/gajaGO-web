import { StyleSheet } from 'react-native';
import { COLORS, radius } from '../../theme';

// 가계부 바텀시트(지출·여행·공유)가 함께 쓰는 스타일
export const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#00000066' },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.line, marginBottom: 14 },
  sheetTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  titleInput: { minHeight: 46, borderRadius: radius.md, backgroundColor: COLORS.card, paddingHorizontal: 14, marginTop: 10, marginBottom: 6, color: COLORS.ink, fontSize: 15 },
  cta: { flexDirection: 'row', minHeight: 54, borderRadius: radius.md, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginLeft: 6 },
  sheetCta: { marginTop: 10 },
  message: { color: COLORS.red, fontSize: 13, marginTop: 8, paddingHorizontal: 22 },
  dateArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  dateText: { color: COLORS.ink, fontSize: 15, fontWeight: '700', marginHorizontal: 12, minWidth: 110, textAlign: 'center' },
  rangeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  rangeLabel: { color: COLORS.muted, fontSize: 13, fontWeight: '700', width: 36 },
});
