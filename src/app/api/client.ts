import AsyncStorage from '@react-native-async-storage/async-storage';

declare const process: {
  env?: {
    EXPO_PUBLIC_API_BASE_URL?: string;
  };
};

const DEFAULT_API_BASE_URL = 'http://10.0.2.2:8080';
const AUTH_TOKEN_STORAGE_KEY = 'gajago.authToken';

const envApiBaseUrl =
  typeof process === 'undefined' ? undefined : process.env?.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = envApiBaseUrl?.replace(/\/$/, '') ?? DEFAULT_API_BASE_URL;

let authToken: string | null = null;
let authTokenLoadPromise: Promise<string | null> | null = null;

type WebStorageHost = {
  localStorage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  };
};

function normalizeAuthToken(token: string | null | undefined) {
  const normalized = token?.trim().replace(/^"|"$/g, '') ?? '';
  return normalized || null;
}

function getWebStorage() {
  return globalThis as unknown as WebStorageHost;
}

function readLocalStorageToken() {
  try {
    return normalizeAuthToken(getWebStorage().localStorage?.getItem(AUTH_TOKEN_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeLocalStorageToken(token: string | null) {
  try {
    if (token) {
      getWebStorage().localStorage?.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      getWebStorage().localStorage?.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
  } catch {
    // AsyncStorage is the primary store for native. localStorage is only a web fallback.
  }
}

export async function setAuthToken(token: string | null) {
  const nextToken = normalizeAuthToken(token);
  authToken = nextToken;
  authTokenLoadPromise = Promise.resolve(nextToken);
  writeLocalStorageToken(nextToken);

  if (nextToken) {
    await AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, nextToken);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function getAuthToken() {
  return authToken;
}

export function hydrateAuthToken() {
  if (authToken) return Promise.resolve(authToken);

  authTokenLoadPromise ??= AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
    .then((storedToken) => {
      const token = normalizeAuthToken(storedToken) ?? readLocalStorageToken();
      authToken = token;

      if (token) writeLocalStorageToken(token);

      return authToken;
    })
    .catch(() => {
      authToken = readLocalStorageToken();
      return authToken;
    });

  return authTokenLoadPromise;
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

function buildUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function parseBody(text: string) {
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function readErrorText(parsed: unknown) {
  if (typeof parsed === 'string' && parsed.trim()) return parsed;
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return '';

  const record = parsed as Record<string, unknown>;
  const message = record.message ?? record.error ?? record.detail;
  return typeof message === 'string' ? message : '';
}

function getErrorMessage(status: number, statusText: string, parsed: unknown) {
  const bodyMessage = readErrorText(parsed);
  if (bodyMessage) return bodyMessage;
  if (status === 401 || status === 403) return '로그인 인증이 필요하거나 만료되었습니다. 다시 로그인해주세요.';
  return `API 요청 실패: ${status} ${statusText}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const token = options.auth === false ? null : authToken ?? (await hydrateAuthToken());

  if (options.auth !== false && !token) {
    throw new ApiError(401, '로그인 인증이 필요합니다. 다시 로그인해주세요.', null);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  const parsed = parseBody(text);

  if (!response.ok) {
    throw new ApiError(response.status, getErrorMessage(response.status, response.statusText, parsed), parsed);
  }

  return parsed as T;
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return '요청 중 알 수 없는 오류가 발생했습니다.';
}
