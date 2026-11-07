import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowCard'>;

// 직원·기사에게 화면을 그대로 보여주는 큰 글씨 한국어 카드
export default function ShowCardScreen({ navigation, route }: Props) {
  const { title, korean, english } = route.params;

  return (
    <View style={styles.screen}>
      <AppHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>Show this screen to the staff or driver</Text>
        <View style={styles.card}>
          <Text style={styles.korean} accessibilityLanguage="ko">
            {korean}
          </Text>
        </View>
        <Text style={styles.english}>{english}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.screen },
  content: { padding: 20 },
  hint: { color: COLORS.muted, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.teal,
    padding: 24,
  },
  korean: { color: COLORS.ink, fontSize: 26, lineHeight: 38, fontWeight: '800' },
  english: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginTop: 16 },
});
