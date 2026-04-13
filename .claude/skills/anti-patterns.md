---
name: anti-patterns
description: >
  Next.js + Firebase 프로젝트에서 절대 하면 안 되는 것들.
  모든 구현 스킬에서 참조. 항상 활성화.
---

# Anti-Patterns (절대 하지 않을 것)

## TypeScript

| ❌ 금지                | ✅ 대안                  | 이유              |
| ---------------------- | ------------------------ | ----------------- |
| `any`                  | 구체적 타입 / `unknown`  | 타입 안전성 파괴  |
| `as` 남용              | type guard / Zod parse   | 런타임 에러 은폐  |
| `@ts-ignore`           | 타입 정의 수정           | 문제 은폐         |
| `!` non-null assertion | optional chaining + 처리 | null 에러         |
| `console.log` 남기기   | 디버깅 후 제거           | 프로덕션 노이즈   |
| `enum`                 | `as const` / union type  | tree-shaking 방해 |

## Next.js

| ❌ 금지                    | ✅ 대안                        | 이유         |
| -------------------------- | ------------------------------ | ------------ |
| Pages Router 문법          | App Router                     | 레거시       |
| `getServerSideProps`       | Server Component 직접 fetch    | App Router   |
| Client에서 DB 접근         | Server Action 경유             | 보안         |
| `"use client"` 남발        | 필요할 때만                    | 번들 크기    |
| `useEffect`로 데이터 fetch | Server Component / React Query | waterfall    |
| barrel export              | 직접 import                    | tree-shaking |
| 상대 경로 `../../../`      | `@/` alias                     | 가독성       |

## Firebase

| ❌ 금지                            | ✅ 대안               | 이유         |
| ---------------------------------- | --------------------- | ------------ |
| Client SDK로 Firestore 접근        | Admin SDK (서버)      | 보안, 일관성 |
| FIREBASE_PRIVATE_KEY를 NEXT_PUBLIC | 서버 환경변수만       | 키 노출      |
| Timestamp 형식 불일치              | YYYY-MM-DD 통일       | 쿼리 오류    |
| 인덱스 없이 복합 쿼리              | Firestore 인덱스 생성 | 쿼리 실패    |

## 코드 품질

| ❌ 금지             | ✅ 대안                 | 이유          |
| ------------------- | ----------------------- | ------------- |
| 파일 300줄 초과     | 분리                    | 유지보수 불가 |
| 컴포넌트 200줄 초과 | 훅 + 하위 컴포넌트      | 단일 책임     |
| 함수 50줄 초과      | 헬퍼 분리               | 가독성        |
| props 5개 초과      | 객체 묶기 / composition | 복잡도        |
| 중첩 삼항           | 조건부 렌더링           | 가독성        |
| 주석 비활성화 코드  | 삭제 (git이 기억)       | 코드 오염     |
