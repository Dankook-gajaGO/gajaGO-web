# GAJAGO 화면 구조

## 앱 구조

```txt
src/
  app/
    App.tsx
    routes.ts
    theme.ts
    components/
    data/
    screens/
    utils/
```

`src/app/App.tsx`에서 Native Stack Navigator를 구성하고 모든 화면을 등록합니다.

## 네비게이션

`RootStackParamList`는 `src/app/routes.ts`에서 관리합니다.

주요 화면:

- `Splash`
- `Onboarding`
- `Login`
- `Home`
- `Transport`
- `Food`
- `Facilities`
- `Emergency`
- `Schedule`
- `SavedEvents`
- `MyPage`
- `AllEvents`
- `EventDetails`
- `CalendarDetail`
- `Payment`

## 공통 컴포넌트

- `AppHeader`: 상단 헤더와 뒤로가기 버튼
- `BottomNavBar`: Home, Trip, Calendar, My 하단 네비게이션
- `Screen`: Safe Area, ScrollView, KeyboardAvoidingView 래퍼
- `SearchField`: React Native `TextInput` 기반 검색 필드
- `EmptyState`: 목록이 비었을 때 보여주는 상태 UI
- `DateChip`: 날짜/필터 선택 칩

## 화면별 역할

- `KoreaHomeScreen`: 이벤트 배너, 빠른 기능, 캘린더/일정 카드
- `AllEventsScreen`: 행사 목록과 카테고리 필터
- `EventDetailScreen`: 행사 상세와 저장/일정 추가 CTA
- `TransportScreen`: 교통 경로 placeholder와 채팅형 입력
- `FoodScreenAllergy`: 알러지 필터 기반 음식 추천
- `FacilitiesScreen`: 편의시설 목록과 전화 연결
- `EmergencyScreen`: 긴급 전화, 대사관 placeholder, 긴급 문장 modal
- `ScheduleScreen`: 날짜별 장소 추가/삭제와 경로 미리보기
- `CalendarDetailScreen`: 월간 캘린더, 공휴일/메모 표시, 메모 추가
- `PaymentScreen`: 결제/교통카드/주의사항 정보
- `MyPageScreen`: 사용자 정보, 저장 행사, 로그아웃

## 디자인 기준

- 기존 GAJAGO의 모바일 카드형 구조를 유지합니다.
- 기본 배경은 흰색 또는 연한 회색입니다.
- 주요 액션 컬러는 `#00BDB0` 청록색입니다.
- 카드, 칩, 버튼은 14-24px 반경을 중심으로 구성합니다.
- Android에서 지원되지 않는 웹 스타일 대신 `elevation`과 RN shadow 속성을 사용합니다.
