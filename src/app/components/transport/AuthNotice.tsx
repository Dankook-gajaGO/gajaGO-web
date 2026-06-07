import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, radius } from '../../theme';

interface AuthNoticeProps {
  onLogin: () => void;
}

export function AuthNotice({ onLogin }: AuthNoticeProps) {
  return (
    <View style={styles.notice}>
      <Feather name="lock" size={18} color={COLORS.teal} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>로그인이 필요합니다</Text>
        <Text style={styles.text}>로그인 후 교통 경로 안내를 이용할 수 있습니다.</Text>
      </View>
      <Pressable style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>로그인</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#B8E5E2',
    backgroundColor: '#F4FCFB',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  textWrap: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },
  title: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  text: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  button: {
    minHeight: 34,
    borderRadius: radius.md,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },
});
