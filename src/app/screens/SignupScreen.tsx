import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getApiErrorMessage, loginMember, signupMember } from '../api';
import { AuthBrand } from '../components/auth/AuthBrand';
import { AuthSubmitButton } from '../components/auth/AuthSubmitButton';
import { AuthTextInput } from '../components/auth/AuthTextInput';
import { Screen } from '../components/common/Screen';
import type { RootStackParamList } from '../routes';
import { COLORS } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const signup = async () => {
    const trimmedLoginId = loginId.trim();

    if (!trimmedLoginId || !password || !passwordConfirm) {
      setStatusMessage('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setStatusMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      await signupMember({
        loginId: trimmedLoginId,
        password,
        nickname: trimmedLoginId,
        email: `${trimmedLoginId}@gajago.local`,
      });
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
      <Pressable style={styles.backButton} onPress={() => navigation.replace('Login')}>
        <Feather name="chevron-left" size={20} color={COLORS.text} />
        <Text style={styles.backText}>로그인</Text>
      </Pressable>

      <AuthBrand
        icon="user-plus"
        title="회원가입"
        tagline="아이디와 비밀번호로 가자고를 시작하세요."
      />

      <View style={styles.form}>
        <AuthTextInput value={loginId} onChangeText={setLoginId} placeholder="아이디" />
        <AuthTextInput
          value={password}
          onChangeText={setPassword}
          placeholder="비밀번호"
          secureTextEntry
        />
        <AuthTextInput
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          placeholder="비밀번호 다시 입력"
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={signup}
        />
        {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
        <AuthSubmitButton label="회원가입" isLoading={isLoading} onPress={signup} />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>이미 계정이 있나요?</Text>
        <Pressable onPress={() => navigation.replace('Login')}>
          <Text style={styles.bottomLink}>로그인하기</Text>
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
  backButton: {
    position: 'absolute',
    top: 18,
    left: 18,
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 2,
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
  bottomRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 8,
  },
  bottomLink: {
    color: COLORS.teal,
    fontSize: 14,
    fontWeight: '900',
  },
});
