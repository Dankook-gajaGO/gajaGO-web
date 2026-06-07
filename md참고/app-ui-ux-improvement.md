# GAJAGO UI/UX 개선 메모

## 목표

GAJAGO의 기존 디자인 분위기를 유지하면서 Android Expo React Native 화면에서 더 안정적으로 동작하도록 정리합니다.

## 유지할 디자인

- 흰색 기반 화면
- 청록색 Primary 액션
- 카드형 정보 구조
- 하단 네비게이션
- 넉넉한 여백과 둥근 컴포넌트

## 개선 방향

1. 화면마다 한 가지 핵심 행동을 명확히 둡니다.
2. 빈 상태에서는 다음 행동을 바로 제안합니다.
3. 웹 CSS 스타일 대신 React Native `StyleSheet`를 사용합니다.
4. 큰 목록은 `FlatList`, 일반 스크롤 화면은 `ScrollView`를 사용합니다.
5. 텍스트가 길어져도 카드 밖으로 넘치지 않도록 `numberOfLines`와 유동 폭을 사용합니다.

## 공통 컴포넌트

- `AppHeader`
- `Screen`
- `SearchField`
- `EmptyState`
- `DateChip`
- `BottomNavBar`
- `QuickActionsBar`

## 화면별 개선 포인트

### CalendarDetailScreen

- 월간 캘린더는 React Native 그리드로 유지합니다.
- 오늘, 선택일, 공휴일, 메모 dot를 구분합니다.
- 선택한 날짜 아래에 메모 입력 패널을 배치합니다.

### ScheduleScreen

- 날짜 칩, 경로 미리보기, 장소 목록, 장소 검색 순서로 구성합니다.
- 장소가 없을 때는 빈 상태 카드와 추가 버튼을 보여줍니다.
- 장소 추가/삭제는 상태 기반으로 처리합니다.

### TransportScreen

- 지도 API가 연결되기 전에는 route assistant placeholder를 유지합니다.
- 채팅형 입력과 추천 경로 카드를 분리합니다.

### FoodScreenAllergy

- 알러지 선택 칩은 `Pressable` 상태로 관리합니다.
- 음식 목록은 필터 결과에 따라 카드 리스트로 보여줍니다.

## Android 기준

- Safe Area를 모든 주요 화면에 적용합니다.
- 하단 네비게이션이 있는 화면은 스크롤 하단 여백을 확보합니다.
- Android shadow는 `elevation`을 사용합니다.
