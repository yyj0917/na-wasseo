---
name: review
description: 마지막 구현에 대한 코드 리뷰. anti-patterns 기준.
---

마지막 커밋의 변경사항을 리뷰.

## 필수 체크

| #   | 항목                        | 검증 방법              |
| --- | --------------------------- | ---------------------- |
| 1   | `any` 타입 없음             | grep `: any`           |
| 2   | `console.log` 없음          | grep `console.log`     |
| 3   | 파일 300줄 이하             | `wc -l`                |
| 4   | Server/Client 구분 적절     | rules 결정표 대조      |
| 5   | Zod validation 적용         | Server Action input    |
| 6   | error.tsx 존재              | 해당 route segment     |
| 7   | TypeScript strict 위반 없음 | `tsc --noEmit`         |
| 8   | Firebase Admin SDK만 사용   | client SDK import 없음 |

## 품질 체크 (권장)

| #   | 항목                    |
| --- | ----------------------- |
| 1   | 불필요한 re-render 없음 |
| 2   | 에러 상태 처리          |
| 3   | 로딩 상태 처리          |
| 4   | 접근성 (semantic HTML)  |

## 출력: 통과/실패 + 구체적 수정 내용
