# GAJAGO 디자인 유지 가이드

이 문서는 GAJAGO FE를 Android Expo React Native로 전환한 뒤에도 기존 디자인 분위기를 유지하기 위한 기준입니다.

## 핵심 방향

- 흰 배경과 연한 회색 화면 배경을 유지합니다.
- 주요 액션은 청록색 `#00BDB0`을 사용합니다.
- 정보는 둥근 카드와 칩으로 정리합니다.
- 화면은 모바일 단일 컬럼을 기본으로 구성합니다.
- 하단 네비게이션은 Home, Trip, Calendar, My 4개 축을 유지합니다.

## 색상

`src/app/theme.ts`의 `COLORS`를 우선 사용합니다.

- Primary: `#00BDB0`
- Blue: `#0077C8`
- Orange: `#FF9500`
- Red: `#FF3B30`
- Purple: `#8E5CF6`
- Text: `#1C1C1E`, `#3C3C3E`
- Muted: `#8E8E93`
- Line: `#E5E5EA`
- Screen: `#F4F6F8`
- Card: `#F7F8FA`
- White: `#FFFFFF`

## 컴포넌트 기준

### Header

- 높이는 56px 내외로 유지합니다.
- 뒤로가기 버튼은 40px 정사각형, 연한 회색 배경, 14px 반경을 사용합니다.
- 제목은 가운데 정렬, 18px, 굵게 표시합니다.

### BottomNavBar

- 높이는 64px입니다.
- 활성 탭은 청록색, 비활성 탭은 회색으로 표시합니다.
- 아이콘은 `@expo/vector-icons/Feather`를 사용합니다.

### Cards

- 기본 배경은 흰색입니다.
- 반복 항목은 14-18px radius를 사용합니다.
- 강조 배너나 큰 카드만 24px radius를 허용합니다.
- Android 그림자는 `elevation`을 포함한 `shadow.card`를 사용합니다.

### Chips

- 선택 상태는 청록색 배경과 흰색 텍스트입니다.
- 기본 상태는 흰색 배경, 연한 회색 테두리입니다.
- 필터와 날짜 선택은 같은 형태를 재사용합니다.

### Buttons

- Primary 버튼은 청록색 배경과 흰색 굵은 텍스트입니다.
- Secondary 버튼은 흰색 또는 연한 회색 배경을 사용합니다.
- 버튼은 `Pressable`로 만들고 텍스트는 `Text`로 분리합니다.

## 화면별 보존 포인트

- `KoreaHomeScreen`: 이벤트 배너, 빠른 기능 카드, 캘린더/일정 카드 구조 유지
- `TransportScreen`: 채팅형 입력과 추천 경로 카드 구조 유지
- `FoodScreenAllergy`: 알러지 칩과 음식 추천 카드 구조 유지
- `AllEventsScreen`: 필터 칩과 이미지가 있는 이벤트 리스트 유지
- `ScheduleScreen`: 날짜 칩, 장소 카드, 경로 미리보기 유지
- `CalendarDetailScreen`: 월간 캘린더와 메모 패널 유지
- `EmergencyScreen`: 긴급 번호 카드와 문장 modal 유지
- `PaymentScreen`: 탭 + 정보 카드 구조 유지

## 금지 사항

- DOM 태그와 브라우저 이벤트를 새로 추가하지 않습니다.
- CSS 파일이나 `className` 기반 스타일을 다시 도입하지 않습니다.
- 화면 전체 구조를 마케팅 페이지처럼 바꾸지 않습니다.
- 색상 팔레트를 청록 단일 계열로만 구성하지 않습니다.

## 연동 예정 기능

- 교통: Tmap 또는 Kakao Map API, Gemini 기반 경로 추천
- 음식: OCR 또는 메뉴 입력 기반 알러지 분석
- 행사: 공공 관광 API
- 로그인: OAuth 또는 자체 API
- 알림: Expo Notifications
