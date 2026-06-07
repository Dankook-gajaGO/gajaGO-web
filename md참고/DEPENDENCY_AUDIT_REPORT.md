# Gajago FE Dependency Audit Report

작성일: 2026-06-06

## 요약

- 직접 의존성 중 삭제 가능한 패키지는 발견되지 않았습니다.
- `npm prune --dry-run` 결과 extraneous 삭제 대상은 0개였습니다.
- `npm dedupe --no-audit --no-fund`로 중복 전이 패키지 5개를 제거했습니다.
- 정리 후 `npm find-dupes --json` 결과 추가 중복 제거 대상은 0개입니다.
- 정리 후 `npm run typecheck`는 통과했습니다.
- 정리 후 `node_modules` 총 파일 용량은 약 260MB입니다.

## 실행한 정리

```bash
npm dedupe --no-audit --no-fund
npm prune --no-audit --no-fund
```

결과:

- `npm dedupe`: 전이 패키지 5개 제거, 20개 패키지 배치/버전 해소
- `npm prune`: 추가 제거 대상 없음

`dedupe`가 제거한 중복 후보:

- `simple-plist/node_modules/bplist-parser@0.3.1`
- `babel-plugin-syntax-hermes-parser/node_modules/hermes-parser@0.32.0`
- `babel-plugin-syntax-hermes-parser/node_modules/hermes-estree@0.32.0`
- `@react-native/codegen/node_modules/hermes-parser@0.32.0`
- `@react-native/codegen/node_modules/hermes-estree@0.32.0`

## 직접 의존성 판단

| 패키지 | 판단 | 근거 |
| --- | --- | --- |
| `@expo/vector-icons` | 유지 | 여러 컴포넌트에서 `@expo/vector-icons/Feather` 직접 import |
| `@react-navigation/native` | 유지 | `NavigationContainer`, `NavigationProp` 사용 |
| `@react-navigation/native-stack` | 유지 | `createNativeStackNavigator`, `NativeStackScreenProps` 사용 |
| `expo` | 유지 | `index.ts`의 `registerRootComponent`, npm scripts, `tsconfig.json`의 `expo/tsconfig.base` 사용 |
| `react` | 유지 | hooks, React 타입, TSX/React Native peer 의존성 |
| `react-native` | 유지 | 앱 전반의 core component와 API 사용 |
| `react-native-safe-area-context` | 유지 | `SafeAreaView` 직접 사용, React Navigation native stack peer 의존성 |
| `react-native-screens` | 유지 | 코드 직접 import는 없지만 `@react-navigation/native-stack`의 peer/runtime 의존성 |
| `@types/react` | 유지 | TypeScript/TSX 타입 선언용 dev dependency |
| `typescript` | 유지 | `npm run typecheck`의 `tsc --noEmit` 실행용 dev dependency |

## 애매하지만 유지해야 하는 의존성

### `react-native-screens`

- 직접 import는 없습니다.
- 하지만 `@react-navigation/native-stack`이 `react-native-screens >= 4.0.0`을 peer 의존성으로 요구합니다.
- native stack navigator의 화면 관리 런타임에 연결되므로 제거하면 네비게이션 동작 또는 peer dependency 상태가 깨질 수 있습니다.
- 결론: 유지.

### `@types/react`

- 런타임 앱 코드에는 포함되지 않는 dev dependency입니다.
- TSX 타입 검사와 React 타입 import에 필요합니다.
- 결론: 로컬 타입체크를 유지한다면 유지.

### `typescript`

- 앱 런타임에는 포함되지 않는 dev dependency입니다.
- `package.json`의 `typecheck` 스크립트가 직접 사용합니다.
- 결론: 타입체크 스크립트를 유지한다면 유지.

### `lightningcss-win32-x64-msvc`

- 직접 의존성이 아니라 Windows optional native package입니다.
- `expo -> @expo/metro-config -> lightningcss` 경로로 설치됩니다.
- Windows 개발 환경에서 Metro/Expo CSS 처리 도구 체인의 일부라 수동 삭제 대상이 아닙니다.
- 결론: 유지.

## 용량 상위 전이 의존성

정리 후 상위 항목:

| 패키지/스코프 | 약 용량 | 유입 경로 |
| --- | ---: | --- |
| `hermes-compiler` | 42.67MB | `react-native` |
| `expo-modules-core` | 29.71MB | `expo` |
| `typescript` | 22.53MB | root dev dependency |
| `react-native` | 21.09MB | root dependency |
| `@react-native` | 18.58MB | `react-native` toolchain |
| `react-devtools-core` | 16.07MB | `react-native` |
| `expo` | 12.55MB | root dependency |
| `@babel` | 10.32MB | Metro/React Native build toolchain |
| `@expo` | 10.28MB | `expo` toolchain |
| `lightningcss-win32-x64-msvc` | 9.07MB | `expo -> @expo/metro-config -> lightningcss` |

대부분 Expo/React Native 개발 서버, Metro bundler, Hermes, native stack을 위한 전이 의존성입니다. 앱 구조를 유지하는 한 수동 삭제 대상이 아닙니다.

## 검증

```bash
npm ls --depth=0
npm find-dupes --json
npm run typecheck
```

검증 결과:

- 최상위 의존성 tree 정상
- 추가 dedupe 후보 없음
- TypeScript typecheck 통과

