import { useCallback, useRef } from 'react';
import { useFocusEffect, type NavigationProp } from '@react-navigation/native';
import { getAuthToken, hydrateAuthToken } from '../api';
import type { RootStackParamList } from '../routes';

type Nav = NavigationProp<RootStackParamList>;

export async function isLoggedIn() {
  return Boolean(getAuthToken() ?? (await hydrateAuthToken()));
}

// 저장·기록처럼 회원만 할 수 있는 동작 전에 호출. 비회원이면 로그인 화면을 띄우고 false (로그인하면 이 화면으로 돌아옴)
export async function ensureLoggedIn(navigation: Nav) {
  if (await isLoggedIn()) return true;
  navigation.navigate('Login', { returnAfterLogin: true });
  return false;
}

// 내 일정·저장한 행사처럼 회원 전용 화면: 비회원이 들어오면 로그인 화면을 한 번 띄움
// (로그인 없이 돌아오면 다시 띄우지 않아 화면 간 반복 이동을 막음)
export function useLoginPromptOnFocus(navigation: Nav) {
  const promptedRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void isLoggedIn().then((loggedIn) => {
        if (loggedIn || promptedRef.current) return;
        promptedRef.current = true;
        navigation.navigate('Login', { returnAfterLogin: true });
      });
    }, [navigation])
  );
}

export const LOGIN_REQUIRED_MESSAGE = '로그인하면 저장하고 다시 볼 수 있어요.';
