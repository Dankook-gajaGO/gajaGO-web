# Expo Android 전환 검토

현재 GAJAGO FE는 Android 실행을 목표로 한 Expo React Native + TypeScript 구조입니다.

## 현재 상태

- 앱 진입점: `index.ts`, `App.tsx`
- Expo 설정: `app.json`
- 라우팅: `@react-navigation/native`, `@react-navigation/native-stack`
- 화면 구현: React Native `View`, `Text`, `Pressable`, `TextInput`, `Image`, `ScrollView`, `FlatList`
- 스타일: `StyleSheet.create()`와 `src/app/theme.ts`의 공통 토큰
- Android Safe Area: `react-native-safe-area-context`
- 아이콘: `@expo/vector-icons`

## 전환 완료 항목

- React DOM 기반 진입점 제거
- 브라우저 라우팅 제거
- 웹 전용 태그와 `className` 제거
- CSS/Tailwind/Vite 기반 실행 구조 제거
- 하단 탭, 헤더, 검색 필드, 빈 상태, 날짜 칩을 React Native 컴포넌트로 교체
- 주요 화면을 Stack Screen으로 등록
- Android 번들 export 검증 완료

## 실행 명령

```bash
npm install
npx expo start
```

Android 실행:

```bash
npx expo start --android
npx expo run:android
```

## 아직 실제 연동이 필요한 부분

- 로그인 API와 사용자 토큰 저장
- 지도/대중교통 API 연결
- 결제 서비스 연결
- 위치 권한, 알림, 공유 기능 등 네이티브 권한 처리

현재 구현은 위 연동부를 placeholder UI로 유지하면서도 Android Expo 환경에서 실행 가능한 구조입니다.
