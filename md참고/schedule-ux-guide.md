# Schedule UX Guide

## 핵심 목적

일정 화면은 사용자가 여행 날짜별로 방문 장소를 추가하고 확인하는 도구입니다.

## 현재 구현 구조

- `ScheduleScreen`
- `DateSummaryCard`
- `ScheduleDatePicker`
- `ScheduleMapPreview`
- `DayScheduleSection`
- `PlaceSearchResults`
- `SearchField`

## 기본 흐름

1. 사용자가 날짜 칩을 선택합니다.
2. 선택한 날짜의 장소 목록을 확인합니다.
3. 장소를 검색합니다.
4. 결과에서 장소를 추가합니다.
5. 장소 카드는 일정 순서대로 표시됩니다.

## 빈 상태

장소가 없을 때는 단순히 "없음"만 보여주지 않고, 다음 행동을 안내합니다.

```text
No places yet
Search below and add a stop to this day.
```

## 지도 영역

실제 지도 API가 연결되기 전까지는 `ScheduleMapPreview` placeholder를 유지합니다.

- 장소가 0개: 안내 문구
- 장소가 1개 이상: stops count 표시
- 향후 Kakao Map 또는 Google Maps API 연결 가능

## 디자인 기준

- 배경: `COLORS.screen`
- 카드: 흰색 배경, 18px 반경
- Primary: `COLORS.teal`
- 날짜 칩 선택 상태: 청록 배경과 흰색 텍스트
- 장소 순번 badge: 청록 원형

## Android 구현 기준

- 버튼은 `Pressable`
- 입력은 `TextInput`
- 스크롤은 `ScrollView`
- 목록성 결과는 필요 시 `FlatList`로 확장
- route params는 `RootStackParamList`를 사용
