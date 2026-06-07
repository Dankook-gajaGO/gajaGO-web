# Cleanup Test Report

## 실험 범위

- 실험 대상: `C:\Users\O2\Desktop\gajago fe - 복사본`
- 원본 보존: `C:\Users\O2\Desktop\gajago fe`는 이번 작업에서 수정하지 않음
- 삭제 방식: 현재 사본에서 재생성 가능한 `node_modules`만 삭제
- 작성일: 2026-06-06

## 용량 측정 결과

| 단계 | 전체 용량 | 바이트 |
| --- | ---: | ---: |
| 삭제 전 | 261.05 MB | 273,732,966 |
| `node_modules` 삭제 후 | 1.16 MB | 1,213,459 |
| `npm ci` 재설치 후 | 261.05 MB | 273,732,966 |

## 삭제 전 생성물 용량

| 항목 | 용량 | 바이트 | 처리 |
| --- | ---: | ---: | --- |
| `node_modules` | 259.89 MB | 272,519,507 | 삭제함 |
| `.expo` | 776 B | 776 | 삭제 후보로만 확인 |
| `expo-server.log`, `expo-server.err.log` | 270 B | 270 | 삭제 후보로만 확인 |

## 삭제한 항목

- `node_modules`

## `node_modules` 내부 코드 파일 확인

`node_modules` 내부에는 설치된 외부 패키지의 코드 파일이 포함되어 있다. 이번 추가 검증에서는 이 내부 코드 파일까지 포함해 `node_modules` 전체를 다시 삭제한 뒤 `npm ci`로 복구했다.

| 항목 | 개수 |
| --- | ---: |
| `node_modules` 전체 파일 수 | 22,868 |
| 코드성 파일 수 (`.js`, `.ts`, `.tsx`, `.cjs`, `.mjs`) | 11,408 |
| `.js` | 7,620 |
| `.ts` | 3,363 |
| `.tsx` | 267 |
| `.cjs` | 113 |
| `.mjs` | 45 |

검증 결과, `node_modules` 내부 코드 파일도 `npm ci` 후 동일한 규모로 재생성되었고 `npm run typecheck`가 통과했다. 따라서 `node_modules` 내부 코드 파일은 프로젝트 직접 작성 소스가 아니라 의존성 설치 산출물로 판단한다.

주의할 점은 `node_modules` 내부 파일을 개별 수정하거나 선별 삭제하지 않는 것이다. 정리할 때는 `node_modules` 전체를 삭제하고 `npm ci` 또는 `npm install`로 복구해야 lockfile 기준의 재현성을 유지할 수 있다.

## 삭제해도 되는 이유

- `node_modules`는 `package.json`과 `package-lock.json`을 기준으로 다시 설치할 수 있는 의존성 설치 결과물이다.
- 프로젝트에 `package-lock.json`이 있으므로 `npm ci`로 lockfile 기준의 재현 설치가 가능하다.
- 실제로 `node_modules` 삭제 후 `npm ci`가 성공했고, 이후 `npm run typecheck`도 통과했다.

## 삭제하면 안 되는 항목

- `src`
- `App.tsx`
- `index.ts`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `app.json`
- `pnpm-workspace.yaml`
- `guidelines`
- `md참고`
- `DEPENDENCY_AUDIT_REPORT.md`
- 기타 문서 파일 및 직접 작성한 소스/설정 파일

## 복구 명령어

```powershell
npm ci
```

`npm ci`를 사용할 수 없는 상황에서는 다음 명령으로 복구할 수 있다.

```powershell
npm install
```

## 검증 결과

- `npm ci`: 성공
  - 584 packages installed
  - 10 moderate severity vulnerabilities reported by `npm audit`
  - 일부 deprecated package 경고가 있었으나 설치는 정상 완료
- `npm run typecheck`: 성공
  - 실행 명령: `tsc --noEmit`

## 최종 결론

현재 사본 기준으로 `node_modules`만 삭제하면 전체 용량은 261.05 MB에서 1.16 MB로 줄어든다. 감소량은 약 259.89 MB이며, `npm ci`로 정상 복구되고 typecheck도 통과하므로 `node_modules`는 배포/보관/압축 전 삭제해도 되는 재생성 가능한 항목으로 판단된다.
