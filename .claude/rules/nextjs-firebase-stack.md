# Na-Wasseo Stack Rules

## Stack

Next.js 15 (App Router), TypeScript strict, Tailwind CSS v4, Firebase Firestore, Firebase Admin SDK, Vercel, React 19

## Server vs Client Component 결정표

| 상황                        | 선택                             | 이유                     |
| --------------------------- | -------------------------------- | ------------------------ |
| Firestore 쿼리              | Server Component / Route Handler | Admin SDK 서버 전용      |
| onClick/onChange 이벤트     | `"use client"`                   | 브라우저 전용            |
| useState, useEffect, useRef | `"use client"`                   | React hooks = 클라이언트 |
| form 제출 → 서버            | Server Action                    | progressive enhancement  |
| 정적 텍스트/마크업          | Server Component                 | JS 번들 0                |
| 차트, 에디터 등             | `"use client"`                   | window/document 의존     |
| URL searchParams            | Server Component                 | page.tsx props           |
| URL pathname                | `"use client"` + usePathname     | 네비게이션 훅            |

## 데이터 패턴 결정표

| 상황               | 패턴                             | 예시                            |
| ------------------ | -------------------------------- | ------------------------------- |
| 페이지 진입 데이터 | Server Component에서 직접 fetch  | page.tsx에서 Firestore 조회     |
| 출퇴근 기록        | Server Action                    | "use server" + revalidatePath   |
| 캘린더 월 변경     | Server Component + searchParams  | ?month=2026-04                  |
| 출퇴근 버튼 상태   | Client Component + Server Action | 버튼 UI는 client, 저장은 server |

## Firebase 패턴 결정표

| 상황                             | 방식                                                            | 이유                                |
| -------------------------------- | --------------------------------------------------------------- | ----------------------------------- |
| Firestore 읽기/쓰기 (서버)       | Firebase Admin SDK                                              | 서버 사이드, Firestore Rules 우회   |
| Firestore 읽기/쓰기 (클라이언트) | ❌ 사용 금지                                                    | 보안, Admin SDK로 통일              |
| 인증                             | 커스텀 JWT (jose 라이브러리)                                    | Firebase Auth 불사용, 팀코드 로그인 |
| 환경변수                         | `FIREBASE_*` (서버), `NEXT_PUBLIC_FIREBASE_*` (클라이언트 최소) | Admin SDK는 서버 전용               |

## 파일 네이밍 결정표

| 파일 종류       | 네이밍              | 위치              |
| --------------- | ------------------- | ----------------- |
| 페이지          | `page.tsx`          | `app/{route}/`    |
| 레이아웃        | `layout.tsx`        | `app/{route}/`    |
| 로딩 UI         | `loading.tsx`       | `app/{route}/`    |
| 에러 처리       | `error.tsx`         | `app/{route}/`    |
| Server Action   | `actions.ts`        | `app/{route}/`    |
| Firebase config | `firebase-admin.ts` | `src/lib/`        |
| Component       | `PascalCase.tsx`    | `src/components/` |
| Hook            | `use{Name}.ts`      | `src/hooks/`      |
| Util            | `camelCase.ts`      | `src/lib/`        |
| 타입            | `{domain}.types.ts` | `src/types/`      |
| 상수            | `constants.ts`      | `src/lib/`        |

## Import 규칙

| 규칙               | 예시                                                               |
| ------------------ | ------------------------------------------------------------------ |
| `@/` alias 필수    | `import { db } from "@/lib/firebase-admin"`                        |
| 상대 경로 금지     | ❌ `import { db } from "../../../lib/firebase-admin"`              |
| barrel export 금지 | ❌ `export * from "./Button"`                                      |
| 타입 import 구분   | `import type { AttendanceRecord } from "@/types/attendance.types"` |
