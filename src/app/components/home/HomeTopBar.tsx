import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../theme';

// 알림 종 아이콘은 눌러도 아무 기능이 없어서 뺐어요 (알림은 일정 등록 때 선택)
export function HomeTopBar() {
  return (
    <View style={styles.topBar}>
      <Text style={styles.logo}>가자GO</Text>
      <Text style={styles.tagline}>한국 여행 도우미</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingTop: 16,
  },
  logo: {
    color: COLORS.teal,
    fontSize: 22,
    fontWeight: '800',
  },
  tagline: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});
