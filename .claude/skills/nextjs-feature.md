---
name: nextjs-feature
description: >
  Next.js App Router + Firebase feature 구현. page, layout, component,
  server action, API route, Firestore query 등 feature 단위 작업.
  반드시 /discuss 또는 /plan 이후에 사용.
---

# Next.js + Firebase Feature Implementation

## 전제조건

- /discuss로 의도 정렬 완료
- /plan으로 구현 계획 존재
- TODO.md에 해당 태스크 등록됨

## 구현 순서 (반드시 이 순서)

| Step | 할 일                            | 완료 기준                            |
| ---- | -------------------------------- | ------------------------------------ |
| 1    | 타입 정의                        | `src/types/{domain}.types.ts` 작성   |
| 2    | Firestore 헬퍼 함수              | `src/lib/firestore/{domain}.ts` 작성 |
| 3    | Server Action 또는 Route Handler | Zod validation 포함                  |
| 4    | Server Component (UI)            | 데이터 표시 확인                     |
| 5    | Client Component (필요시만)      | interactivity 부분만                 |
| 6    | `npx tsc --noEmit`               | 타입 에러 0                          |

## Server Action 표준 패턴

```typescript
"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const Schema = z.object({
  title: z.string().min(1).max(100),
});

type ActionResult =
  | { success: true; data: unknown }
  | { error: string; fieldErrors?: Record<string, string[]> };

export async function myAction(formData: FormData): Promise<ActionResult> {
  const parsed = Schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error: "유효성 검사 실패",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  // Firestore 작업
  revalidatePath("/path");
  return { success: true, data: result };
}
```

## Route 구조 결정표

| 상황        | 패턴                            |
| ----------- | ------------------------------- |
| 팀 대시보드 | `app/(dashboard)/team/page.tsx` |
| 어드민      | `app/(admin)/admin/page.tsx`    |
| API         | `app/api/{resource}/route.ts`   |
| 인증        | `app/(auth)/login/page.tsx`     |

## Firestore 헬퍼 표준 패턴

```typescript
// src/lib/firestore/attendance.ts
import { db } from "@/lib/firebase-admin";
import type { AttendanceRecord } from "@/types/attendance.types";

export async function getAttendanceByTeamAndMonth(
  teamId: string,
  year: number,
  month: number,
): Promise<AttendanceRecord[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const snapshot = await db
    .collection("attendance")
    .where("teamId", "==", teamId)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .get();

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as AttendanceRecord,
  );
}
```
