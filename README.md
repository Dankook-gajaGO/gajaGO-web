# 가자GO Frontend

가자GO는 한국을 방문한 외국인이 여행 중 필요한 행사 정보, 음식 알레르기 정보, 주변 편의시설, 교통 경로 추천, 일정 관리를 하나의 앱에서 사용할 수 있도록 만든 모바일 서비스입니다.

## 주요 기능

- 회원가입 및 로그인
- JWT 기반 인증 상태 유지
- 행사/축제 목록 및 상세 정보 조회
- 관심 행사 저장 및 마이페이지 연동
- 알레르기 선택 기반 안전 음식 추천
- 현재 위치 기반 주변 편의시설 조회
- Gemini + TMAP 기반 교통 챗봇 화면
- 추천 교통 경로 카드 및 상세 이동 단계 표시
- 일정/메모 등록, 수정, 삭제
- 월간 캘린더 기반 일정 확인

## 개발 스택

### Frontend

- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage
- Expo Location

### API 연동

- Spring Boot Backend API
- FastAPI AI/Transport API
- JWT Authentication
- TMAP POI / Transit API 연동 결과 사용
- Gemini API 분석 결과 사용

## 프로젝트 구조

```text
src/app
├── api              # 백엔드 API 호출 모듈
├── components       # 공통 UI 및 기능별 컴포넌트
├── data             # 화면용 정적/임시 데이터
├── hooks            # 기능별 커스텀 훅
├── screens          # 앱 화면 단위 컴포넌트
├── utils            # 날짜 등 공통 유틸
├── App.tsx          # 앱 진입 및 네비게이션 구성
├── routes.ts        # 라우트 이름 정의
└── theme.ts         # 색상/디자인 토큰
