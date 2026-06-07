import { apiRequest, setAuthToken } from './client';

interface SignupRequest {
  loginId: string;
  password: string;
  nickname?: string;
  email?: string;
}

interface LoginRequest {
  loginId: string;
  password: string;
}

export async function signupMember(payload: SignupRequest) {
  return apiRequest<unknown>('/api/member/signup', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export async function loginMember(payload: LoginRequest) {
  const response = await apiRequest<string | { token?: string; accessToken?: string; jwt?: string }>(
    '/api/member/login',
    {
      method: 'POST',
      body: payload,
      auth: false,
    }
  );

  const token =
    typeof response === 'string'
      ? response
      : response.token ?? response.accessToken ?? response.jwt ?? '';

  if (!token) {
    throw new Error('로그인 응답에서 JWT 토큰을 찾지 못했습니다.');
  }

  await setAuthToken(token);
  return token;
}
