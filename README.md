# gajaGO-web

가자GO 프로젝트의 프론트엔드 레포지토리입니다.  
사용자 화면(UI) 구현, 페이지 라우팅, API 연동 및 클라이언트 로직을 담당합니다.

## 기술 스택
- React
- TypeScript
- Vite
- Axios
- React Router

## 실행 방법
### 1. 저장소 클론
git clone https://github.com/Dankook-gajaGO/gajaGO-web.git

### 2. 폴더 이동
cd gajaGO-web

### 3. 패키지 설치
npm install

### 4. 개발 서버 실행
npm run dev

## 브랜치 전략
- main: 최종 배포 및 안정 버전
- develop: 개발 통합 브랜치
- feature/*: 기능 개발 브랜치
- fix/*: 버그 수정 브랜치

작업 순서
1. develop 브랜치에서 최신 코드 pull
2. feature 브랜치 생성
3. 작업 후 commit / push
4. Pull Request를 통해 develop 브랜치로 merge
5. 최종 점검 후 main 브랜치에 반영

브랜치 예시
- feature/login-page
- feature/signup-page
- fix/navbar-error

## 커밋 규칙
- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 포맷팅
- refactor: 리팩토링
- chore: 설정/패키지 변경
- test: 테스트 관련 작업

예시
- feat: 로그인 페이지 UI 추가
- fix: 회원가입 버튼 오류 수정
- docs: README 실행 방법 수정

## PR 규칙
- PR은 develop 브랜치로 생성합니다.
- main 브랜치에는 직접 push하지 않습니다.
- PR 생성 전 lint, format, build를 확인합니다.
- 최소 1명 이상의 리뷰 후 merge합니다.

PR 체크리스트
- [ ] develop 브랜치 기준으로 작업했는가
- [ ] 불필요한 파일이 포함되지 않았는가
- [ ] lint 오류가 없는가
- [ ] 실행 확인을 했는가
- [ ] 작업 내용을 PR 설명에 작성했는가

## 폴더 구조
src/
 ┣ components/
 ┣ pages/
 ┣ api/
 ┣ hooks/
 ┣ utils/
 ┣ styles/
 ┗ assets/