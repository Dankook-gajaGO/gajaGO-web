# GAJAGO Figma Design Guide

이 문서는 Expo React Native 앱 기준의 GAJAGO 디자인 가이드입니다.

## 제품 개요

GAJAGO는 한국 여행자를 위한 모바일 여행 보조 앱입니다. 행사, 교통, 음식 알러지, 편의시설, 긴급 정보, 일정, 결제 정보를 한 화면 흐름 안에서 다룹니다.

## 디자인 원칙

- Clean: 흰색과 연한 회색 배경을 중심으로 정보를 정리합니다.
- Card-based: 대부분의 콘텐츠는 카드와 리스트로 구성합니다.
- Practical: 반복 사용을 고려해 밀도와 가독성을 우선합니다.
- Mobile-first: Android 화면에서 손가락 조작이 쉬운 크기를 유지합니다.

## 색상

- Teal: `#00BDB0`
- Blue: `#0077C8`
- Orange: `#FF9500`
- Purple: `#8E5CF6`
- Red: `#FF3B30`
- Ink: `#1C1C1E`
- Text: `#3C3C3E`
- Muted: `#8E8E93`
- Line: `#E5E5EA`
- Screen: `#F4F6F8`
- Card: `#F7F8FA`
- White: `#FFFFFF`

## Typography

- Screen title: 18-25px, bold
- Section title: 17-18px, bold
- Body: 13-15px
- Label: 11-13px, semibold
- Button text: 14-16px, bold

## Radius

- Small: 10px
- Medium: 14px
- Large: 18px
- XL: 24px
- Full: 999px

## 화면 구조

### Splash

- 중앙 로고 마크
- 브랜드명
- 짧은 설명
- 하단 로딩 dot

### Onboarding

- 상단 Skip
- 중앙 아이콘 카드
- 제목과 설명
- 하단 pager와 CTA

### Login

- 브랜드 영역
- 이메일/비밀번호 입력
- Primary 로그인 버튼
- 소셜/게스트 로그인 버튼

### Home

- 상단 브랜드 바
- 이벤트 배너 가로 스크롤
- 빠른 기능 가로 스크롤
- 캘린더/일정 2열 카드
- 주말 추천 배너

### Feature Screens

- `AppHeader`
- 검색 또는 필터 영역
- 카드 또는 리스트 콘텐츠
- 필요한 경우 하단 입력 영역

## 코드 기준

- 디자인 토큰은 `src/app/theme.ts`에 반영합니다.
- Figma 컴포넌트 이름과 코드 컴포넌트 이름을 최대한 맞춥니다.
- React Native에서 불가능한 CSS 효과는 `elevation`과 단순 shadow로 대체합니다.
- 화면 이동은 React Navigation route 이름 기준으로 설계합니다.
