# GAJAGO 개발 가이드라인

## 플랫폼

- 기본 대상은 Android Expo React Native입니다.
- 웹 전용 DOM 태그, 브라우저 라우터, CSS class 기반 스타일을 추가하지 않습니다.
- 화면 이동은 React Navigation을 사용합니다.

## UI 원칙

- 기존 GAJAGO 디자인의 흰 배경, 청록 포인트, 둥근 카드형 모바일 레이아웃을 유지합니다.
- 공통 색상과 반경은 `src/app/theme.ts`를 우선 사용합니다.
- 화면 단위 레이아웃은 `SafeAreaView`, `ScrollView`, `FlatList`를 상황에 맞게 사용합니다.
- 입력 UI는 `TextInput`, 버튼은 `Pressable`을 사용합니다.

## Android 스타일

- 브라우저 전용 높이/너비 단위, 고정 포지션, 웹 그림자, 포인터/선택 제어 스타일을 사용하지 않습니다.
- Android 그림자는 `elevation`을 기본으로 하고, iOS 호환 shadow 속성은 `src/app/theme.ts`의 `shadow.card`를 사용합니다.
- 스크롤이 필요한 목록은 `ScrollView` 또는 `FlatList`로 구성합니다.

## 코드 원칙

- 화면 props와 route params는 `RootStackParamList`로 타입을 맞춥니다.
- API가 아직 없는 기능은 디자인을 유지한 placeholder UI로 둡니다.
- 실제 연동을 추가할 때도 현재 화면 구조와 디자인 토큰을 유지합니다.
