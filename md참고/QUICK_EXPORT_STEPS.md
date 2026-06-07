# Expo Android 확인 절차

## 1. 의존성 설치

```bash
npm install
```

## 2. 타입 검사

```bash
npm run typecheck
```

## 3. Expo 서버 실행

```bash
npx expo start
```

Expo Go에서 QR 코드를 스캔하거나 Android Emulator가 연결된 상태에서 아래 명령을 사용합니다.

```bash
npx expo start --android
```

## 4. 네이티브 Android 빌드가 필요할 때

```bash
npx expo run:android
```

## 5. 번들 검증

Android 번들이 정상 생성되는지 확인할 때:

```bash
npx expo export --platform android --output-dir dist-expo
```

검증 후 `dist-expo`는 산출물이므로 커밋하지 않습니다.
