import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiErrorMessage, loginMember } from '../api';
import { AuthBrand } from '../components/auth/AuthBrand';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { AuthTextInput } from '../components/auth/AuthTextInput';
import { Screen } from '../components/common/Screen';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    const trimmedLoginId = loginId.trim();
    if (!trimmedLoginId || !password) {
      setStatusMessage('아이디와 비밀번호를 입력하세요.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      await loginMember({ loginId: trimmedLoginId, password });
      navigation.replace('Home');
    } catch (error) {
      setStatusMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen keyboard scroll contentContainerStyle={styles.screen}>
      <AuthBrand
        icon="send"
        title="가자고"
        tagline="한국 여행을 더 쉽고 안전하게 준비하세요."
      />

      <View style={styles.form}>
        <AuthTextInput value={loginId} onChangeText={setLoginId} placeholder="아이디" />
        <AuthTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={login}
        />
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
        <AuthSubmitButton label="로그인" isLoading={isLoading} onPress={login} />
      </View>

      <View style={styles.bottomActions}>
        <Pressable style={styles.bottomAction} onPress={() => navigation.replace('Home')}>
          <Text style={styles.guestText}>게스트로 둘러보기</Text>
        </Pressable>
        <View style={styles.bottomDivider} />
        <Pressable style={styles.bottomAction} onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>회원가입하기</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  form: {
    marginBottom: 20,
  },
  statusText: {
    color: COLORS.red,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  bottomActions: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAction: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  bottomDivider: {
    width: 1,
    height: 14,
    backgroundColor: COLORS.line,
    marginHorizontal: 2,
  },
  guestText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  signupText: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: '900',
  },
});
