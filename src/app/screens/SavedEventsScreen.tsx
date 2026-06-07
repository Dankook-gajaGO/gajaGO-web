import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppHeader } from '../components/common/AppHeader';
import { EmptyState } from '../components/common/EmptyState';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SavedEvents'>;

export default function SavedEventsScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <AppHeader title="저장한 행사" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <EmptyState
          title="저장한 행사가 없습니다"
          description="관심 있는 행사를 저장하면 이곳에서 확인할 수 있습니다."
          actionLabel="행사 둘러보기"
          onAction={() => navigation.navigate('AllEvents', { country: 'korea' })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
