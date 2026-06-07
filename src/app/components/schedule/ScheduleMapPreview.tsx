import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface ScheduleMapPreviewProps {
  count: number;
}

export function ScheduleMapPreview({ count }: ScheduleMapPreviewProps) {
  return (
    <View style={styles.card}>
      <View style={styles.pin}>
        <Feather name="map" size={24} color={COLORS.teal} />
      </View>
      <Text style={styles.title}>경로 미리보기</Text>
      <Text style={styles.caption}>장소 {count}개</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 150,
    borderRadius: radius.lg,
    backgroundColor: '#EAF6F5',
    borderWidth: 1,
    borderColor: '#CDECEA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pin: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    color: COLORS.ink,
    fontSize: 16,
    fontWeight: '900',
  },
  caption: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
