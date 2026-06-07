# Figma Export Guide

GAJAGO FE는 Expo React Native 앱입니다. Figma 작업은 웹 화면 캡처가 아니라 Android 모바일 화면 기준으로 확인합니다.

## 기준 프레임

- Android compact viewport: 360 x 800
- 넓은 Android viewport: 412 x 915
- Safe Area를 고려해 상단/하단 여백을 둡니다.

## 디자인 토큰

Figma 변수와 앱 토큰을 아래처럼 맞춥니다.

| Figma | React Native |
| --- | --- |
| Primary / Teal | `COLORS.teal` |
| Info / Blue | `COLORS.blue` |
| Warning / Orange | `COLORS.orange` |
| Danger / Red | `COLORS.red` |
| Surface / Card | `COLORS.card` |
| Border / Line | `COLORS.line` |

## 컴포넌트 매핑

| Figma Component | Code |
| --- | --- |
| App Bar | `components/common/AppHeader.tsx` |
| Bottom Navigation | `components/BottomNavBar.tsx` |
| Search Field | `components/common/SearchField.tsx` |
| Date Chip | `components/common/DateChip.tsx` |
| Empty State | `components/common/EmptyState.tsx` |
| Quick Actions | `components/QuickActionsBar.tsx` |
| Calendar Month | `components/calendar/MonthCalendar.tsx` |
| Schedule Place Card | `components/schedule/DayScheduleSection.tsx` |

## 확인 절차

1. `npx expo start` 실행
2. Expo Go 또는 Android Emulator에서 화면 확인
3. 필요한 화면을 Android 기기 스크린샷으로 저장
4. Figma Phone Frame에 스크린샷 배치
5. 디자인과 코드 사이의 간격, 색상, 카드 반경을 비교

## 화면 목록

- Splash
- Onboarding
- Login
- Home
- Transport
- Food
- Facilities
- Emergency
- Schedule
- SavedEvents
- MyPage
- AllEvents
- EventDetails
- CalendarDetail
- Payment

## 주의

- Figma에서 CSS 단위나 웹 레이아웃 값을 기준으로 잡지 않습니다.
- Android에서는 shadow가 다르게 보이므로 `elevation` 기준으로 확인합니다.
- 텍스트가 길어질 수 있는 영역은 Figma에서도 2줄 이상을 고려합니다.
