---
name: firebase-crud
description: >
  Firebase Firestore CRUD 구현. Admin SDK 사용, 타입 정의,
  Server Action과 연결을 한 세트로 처리.
  "firestore", "DB", "CRUD", "컬렉션" 키워드에 반응.
---

# Firebase Firestore CRUD Workflow

## Firebase Admin SDK 초기화

```typescript
// src/lib/firebase-admin.ts
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const apps = getApps();

if (apps.length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const db = getFirestore();
```

## CRUD 헬퍼 표준

| 작업        | 패턴                                      |
| ----------- | ----------------------------------------- |
| Create      | `db.collection("x").add(data)`            |
| Read (단건) | `db.collection("x").doc(id).get()`        |
| Read (목록) | `db.collection("x").where(...).get()`     |
| Update      | `db.collection("x").doc(id).update(data)` |
| Delete      | `db.collection("x").doc(id).delete()`     |

## 타입 → 헬퍼 → Action 순서

1. `src/types/{domain}.types.ts` — 인터페이스 정의
2. `src/lib/firestore/{domain}.ts` — Firestore 읽기/쓰기 함수
3. `app/{route}/actions.ts` — Server Action에서 헬퍼 호출

## Firestore 쿼리 결정표

| 상황                  | 방식                                            |
| --------------------- | ----------------------------------------------- |
| 팀별 월간 출퇴근 조회 | `where("teamId") + where("date" range)`         |
| 유저별 오늘 출퇴근    | `where("userId") + where("date")`               |
| 전체 팀 목록          | `collection("teams").get()`                     |
| 팀 소속 유저          | `where("teamId")` on users                      |
| 랭킹 (총 시간)        | 클라이언트에서 aggregate 또는 별도 stats 컬렉션 |

## 절대 하지 않을 것

- 클라이언트에서 Firestore 직접 접근 (Admin SDK 서버 전용)
- `service_role` 수준 키를 NEXT_PUBLIC으로 노출
- Timestamp 대신 문자열로 날짜 저장 시 형식 불일치 (YYYY-MM-DD 통일)
