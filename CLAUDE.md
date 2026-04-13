# 나 왔어! (Na-Wasseo)

소마 팀 출퇴근 기록 서비스. 버튼 하나로 출퇴근 기록, 월간 캘린더 뷰로 확인.

## Stack
Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, Firebase (Firestore + Admin SDK), Vercel, React 19

## Docs
- PRD: @PRD.md
- Anti-Patterns: @.claude/skills/anti-patterns/SKILL.md
- Architecture: @docs/architecture.md (생성 후)

## Workflow
/discuss → /plan → /build → /review → /ship
한 세션 = 한 태스크. TODO.md로 진행 추적.

## Core Rules

### Server vs Client
| 상황 | 선택 |
|---|---|
| DB/API 호출 | Server Component |
| onClick/onChange | `"use client"` |
| useState/useEffect | `"use client"` |
| form → 서버 | Server Action |
| 정적 텍스트 | Server Component |

### 파일 네이밍
| 종류 | 패턴 | 위치 |
|---|---|---|
| 페이지 | `page.tsx` | `app/{route}/` |
| Server Action | `actions.ts` | `app/{route}/` |
| Firebase 관련 | `firebase.ts` | `src/lib/` |
| Component | `PascalCase.tsx` | `src/components/` |
| Hook | `use{Name}.ts` | `src/hooks/` |
| 타입 | `{domain}.types.ts` | `src/types/` |
| Util | `camelCase.ts` | `src/lib/` |

### Import
- `@/` alias 필수, 상대 경로 금지
- barrel export 금지
- `import type` 구분 사용

### 금지
- `any`, `@ts-ignore`, `console.log` (테스트 제외)
- Pages Router 문법 (`getServerSideProps` 등)
- `"use client"` 남발 — 필요할 때만
- 300줄 초과 파일
- Firebase client SDK를 서버에서 사용

## Key Decisions
- Firebase Admin SDK → 서버 사이드에서만 Firestore 접근
- 로그인 키는 bcrypt 해시 후 Firestore 저장
- 세션은 HTTP-only cookie (JWT)
- 출퇴근 상태: checked_in → checked_out → done
