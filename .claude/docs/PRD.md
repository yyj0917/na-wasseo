# 나 왔어! (Na-Wasseo) — PRD v1.0

> 소마(SW마에스트로) 팀 출퇴근 기록 & 자기성찰 서비스

---

## 1. 개요

### 1-1. 문제 정의

소마 연수생들은 센터에 출퇴근하며 팀 단위로 프로젝트를 진행한다. 현재 출퇴근 기록은 Google 스프레드시트로 수동 관리하고 있으며, 다음 문제가 있다:

- 매번 스프레드시트를 열어 수동 기입해야 함
- 시간 계산(일별/주별/월별 total)을 수식으로 직접 관리
- 팀 간 비교, 개인 랭킹 등 통계를 보기 어려움
- 출퇴근 시간 입력 실수 시 수정이 번거로움

### 1-2. 솔루션

**나 왔어!** — 버튼 한 번으로 출퇴근을 기록하고, 팀 단위 월간 캘린더 뷰에서 한눈에 확인하는 웹 서비스.

### 1-3. 목표

| 목표 | 측정 기준 |
|---|---|
| MVP 1주 내 배포 | Vercel 배포 완료 |
| 우리 팀(3명) 실사용 | 1주일 연속 사용 |
| 타 팀 확산 | 2팀 이상 사용 |

---

## 2. 기술 스택

| 영역 | 기술 | 이유 |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR/SSG, 풀스택 |
| Language | TypeScript (strict) | 타입 안전성 |
| Styling | Tailwind CSS v4 | 빠른 UI 구현 |
| Database | Firebase Firestore | 실시간, 서버리스, 무료 티어 |
| Auth | Firebase (커스텀 토큰 기반) | 팀 코드 로그인 구현 |
| Hosting | Vercel | Next.js 최적화, 무료 |
| State | React 19 (built-in) | 외부 상태 라이브러리 불필요 |

---

## 3. 사용자 & 역할

| 역할 | 설명 | 접근 권한 |
|---|---|---|
| **팀원 (User)** | 소마 연수생. 팀 코드로 로그인 | 본인 팀 출퇴근 기록/조회, 본인 기록 수정 |
| **어드민 (Admin)** | 서비스 운영자 (나) | 팀/유저 생성, 전체 통계, 데이터 수정 |

---

## 4. 핵심 기능

### 4-1. 인증 (Auth)

**로그인 방식**: 팀 코드 기반 (Google OAuth 없음)

- 로그인 키 형식: `team-[팀이름]-[개인비번]`
- 예시: `team-수관기피-abc123` → "정상영"으로 로그인
- 어드민이 팀 생성 시 각 멤버별 로그인 키를 등록

**플로우**:
```
입력: team-수관기피-abc123
  → Firestore에서 매칭 조회
  → 매칭 성공 → JWT/세션 발급 → 팀 대시보드로 이동
  → 매칭 실패 → "올바른 팀 코드를 입력해주세요" 에러
```

**세션 관리**:
- 로그인 성공 시 쿠키에 세션 저장 (7일 유효)
- 새로고침해도 로그인 유지
- 로그아웃 버튼으로 세션 삭제

### 4-2. 출퇴근 기록 (Attendance)

**버튼 상태 전이**:
```
[출석하기] → 클릭 → [퇴근하기] → 클릭 → [고생하셨습니다!]
                                              → 클릭 → alert("오늘 하루도 고생하셨습니다!")
```

**출석하기 클릭 시**:
- 현재 유저 이름 + 현재 시간(HH:mm) 기록
- Firestore에 출근 기록 생성
- attendance_state: `checked_in`

**퇴근하기 클릭 시**:
- 현재 유저 이름 + 현재 시간(HH:mm) 기록
- Firestore에 퇴근 시간 업데이트
- attendance_state: `checked_out`
- 자동으로 근무 시간(시:분) 계산

**고생하셨습니다! 클릭 시**:
- `alert("오늘 하루도 고생하셨습니다!")` 표시
- attendance_state: `done`

### 4-3. 월간 캘린더 뷰 (Calendar View)

**레이아웃**: 노트북 최적화 (min-width: 1024px)

```
┌─────────────────────────────────────────────────────────────┐
│  나 왔어!    [팀이름]    [◀ 3월] 2026년 4월 [5월 ▶]  [로그아웃]  │
├─────┬─────┬─────┬─────┬─────┬─────┬─────┬──────────────────┤
│ 일  │ 월  │ 화  │ 수  │ 목  │ 금  │ 토  │ Total            │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────────────────┤
│     │     │ 1   │ 2   │ 3   │ 4   │ 5   │                  │
│     │     │     │     │정상영│정상영│정상영│ 정상영: 22h 40m  │
│     │     │     │     │13-20│10-19│13-19│ 강민관: 23h 30m  │
│     │     │     │     │강민관│강민관│강민관│ 마준영: 20h 40m  │
│     │     │     │     │13-19│10-19│13-21│                  │
│     │     │     │     │마준영│마준영│마준영│                  │
│     │     │     │     │13-18│10-18│13-19│                  │
├─────┼─────┼─────┼─────┼─────┼─────┼─────┼──────────────────┤
│ 6   │ 7   │ 8   │ ... │     │     │     │ (주간 total)     │
│ ... │     │     │     │     │     │     │                  │
├─────┴─────┴─────┴─────┴─────┴─────┴─────┼──────────────────┤
│                                          │ Monthly Total    │
│                                          │ 정상영: 267h 33m │
│                                          │ 강민관: 251h 45m │
│                                          │ 마준영: 272h 43m │
└──────────────────────────────────────────┴──────────────────┘
```

**각 날짜 셀 구성**:
- 날짜 숫자
- 팀원별: 이름 / 출근시간 / 퇴근시간
- ⚙️ 수정 버튼 (본인 기록만 수정 가능)

**주간(Weekly) Total**:
- 각 주의 오른쪽에 팀원별 주간 누적 시간 표시
- 일~토 기준

**월간(Monthly) Total**:
- 캘린더 하단 또는 우측 사이드바에 월간 누적 시간

**월 이동**:
- ◀ / ▶ 버튼으로 이전/다음 월 이동
- 현재 달 강조 표시

### 4-4. 기록 수정

- 각 셀의 ⚙️ 버튼 클릭 → 모달 팝업
- 출근 시간 / 퇴근 시간 수정 가능 (time picker)
- 본인 기록만 수정 가능
- 수정 시 Firestore 업데이트 + 총 시간 자동 재계산

### 4-5. 어드민 대시보드 (/admin)

**접근**: 별도 어드민 비밀번호로 로그인 (환경변수 관리)

**기능**:

| 기능 | 설명 |
|---|---|
| 팀 관리 | 팀 생성/삭제/수정 |
| 유저 관리 | 유저 등록 (team-[팀이름]-[개인비번] → 이름 매핑), 삭제/수정 |
| 출퇴근 수정 | 모든 팀/유저의 기록 직접 수정 |
| 통계 대시보드 | 팀별 총 시간, 유저별 총 시간, 유저 랭킹, 팀 랭킹 |

**통계 항목**:
- 팀 전체 누적 시간 랭킹
- 팀 내 유저 누적 시간 랭킹
- 이번 주 가장 많이 근무한 유저
- 이번 달 가장 많이 근무한 팀
- 평균 출근 시간 / 평균 퇴근 시간
- 일별 출석률 (출석한 인원 / 전체 인원)

---

## 5. 데이터 모델 (Firestore)

### Collection: `teams`

```typescript
interface Team {
  id: string              // auto-generated
  name: string            // "수관기피"
  createdAt: Timestamp
}
```

### Collection: `users`

```typescript
interface User {
  id: string              // auto-generated
  name: string            // "정상영"
  teamId: string          // teams/{teamId}
  teamName: string        // "수관기피" (denormalized)
  loginKey: string        // "team-수관기피-abc123" (hashed 저장)
  role: "user" | "admin"
  createdAt: Timestamp
}
```

### Collection: `attendance`

```typescript
interface AttendanceRecord {
  id: string              // auto-generated
  userId: string          // users/{userId}
  userName: string        // "정상영" (denormalized)
  teamId: string          // teams/{teamId}
  date: string            // "2026-04-14" (YYYY-MM-DD)
  checkInTime: string     // "13:00" (HH:mm)
  checkOutTime: string | null  // "20:00" or null
  totalMinutes: number | null  // 420 (분 단위)
  state: "checked_in" | "checked_out" | "done"
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### Firestore 인덱스 (필요)

| Collection | Fields | 용도 |
|---|---|---|
| attendance | teamId + date | 팀별 일자 조회 |
| attendance | userId + date | 유저별 일자 조회 |
| attendance | teamId + date (range) | 월간 조회 |

---

## 6. 페이지 구조

```
app/
├── page.tsx                    # 로그인 페이지 (랜딩)
├── (auth)/
│   └── login/page.tsx          # 로그인 폼
├── (dashboard)/
│   ├── layout.tsx              # 인증 체크 + 네비게이션
│   └── team/
│       └── page.tsx            # 팀 출퇴근 캘린더 뷰 (메인)
├── (admin)/
│   ├── layout.tsx              # 어드민 인증 체크
│   └── admin/
│       ├── page.tsx            # 어드민 대시보드 (통계)
│       ├── teams/page.tsx      # 팀 관리
│       ├── users/page.tsx      # 유저 관리
│       └── attendance/page.tsx # 출퇴근 기록 관리
└── api/
    ├── auth/
    │   ├── login/route.ts      # 로그인 API
    │   └── logout/route.ts     # 로그아웃 API
    ├── attendance/
    │   ├── route.ts            # 출퇴근 기록 CRUD
    │   └── [id]/route.ts       # 개별 기록 수정
    ├── teams/route.ts          # 팀 CRUD
    └── users/route.ts          # 유저 CRUD
```

---

## 7. API 설계

### Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | /api/auth/login | `{ loginKey: string }` | `{ user, team, token }` |
| POST | /api/auth/logout | — | `{ success: true }` |

### Attendance

| Method | Path | Params/Body | Response |
|---|---|---|---|
| GET | /api/attendance | `?teamId=xxx&month=2026-04` | `AttendanceRecord[]` |
| POST | /api/attendance | `{ type: "check_in" }` | `AttendanceRecord` |
| PATCH | /api/attendance/[id] | `{ checkInTime?, checkOutTime? }` | `AttendanceRecord` |
| POST | /api/attendance | `{ type: "check_out" }` | `AttendanceRecord` |

### Admin

| Method | Path | Body | Response |
|---|---|---|---|
| GET | /api/teams | — | `Team[]` |
| POST | /api/teams | `{ name }` | `Team` |
| DELETE | /api/teams/[id] | — | `{ success }` |
| GET | /api/users | `?teamId=xxx` | `User[]` |
| POST | /api/users | `{ name, teamName, loginKey }` | `User` |
| DELETE | /api/users/[id] | — | `{ success }` |
| PATCH | /api/users/[id] | `{ name?, loginKey? }` | `User` |

---

## 8. UI/UX 세부사항

### 8-1. 로그인 페이지

- 중앙 정렬, 심플한 카드 UI
- 서비스 로고/이름: "나 왔어!"
- 입력 필드: 팀 코드 입력 (placeholder: "team-팀이름-비밀번호")
- 로그인 버튼
- 에러 시: 입력 필드 하단에 빨간 텍스트

### 8-2. 팀 대시보드 (메인)

- **상단 바**: 서비스명 + 팀 이름 + 월 네비게이션 + 로그아웃
- **출퇴근 버튼 영역**: 상단에 크게, 현재 상태에 따라 버튼 변경
  - 출석하기: 초록색 배경
  - 퇴근하기: 주황색 배경
  - 고생하셨습니다!: 회색 배경
- **캘린더 그리드**: 주 단위 행, 요일별 열, 우측에 주간 total
- **하단**: 월간 total 요약

### 8-3. 어드민 대시보드

- 좌측 사이드바: 네비게이션 (대시보드/팀관리/유저관리/출퇴근관리)
- 메인 영역: 선택된 메뉴에 따른 컨텐츠
- 통계 카드: 상단에 핵심 지표 4개 (총 팀 수, 총 유저 수, 이번 달 총 시간, 평균 일 근무시간)
- 랭킹 테이블: 팀/유저 랭킹

---

## 9. 보안

| 항목 | 구현 |
|---|---|
| 로그인 키 저장 | bcrypt 해시 |
| 세션 | HTTP-only cookie + JWT |
| API 보호 | 미들웨어에서 세션 검증 |
| 어드민 접근 | 별도 어드민 비밀번호 (환경변수) |
| 기록 수정 | 본인 기록만 (userId 검증) |
| Firestore Rules | 서버 사이드에서만 접근 (Admin SDK) |

---

## 10. 우선순위

### MVP (1주)

- [x] 프로젝트 세팅 (Next.js + Firebase + Vercel)
- [ ] 로그인/로그아웃
- [ ] 출퇴근 버튼 (출석/퇴근/고생하셨습니다)
- [ ] 월간 캘린더 뷰 (팀원 출퇴근 기록)
- [ ] 기록 수정 (본인)
- [ ] 주간/월간 total 계산
- [ ] Vercel 배포

### v1.1

- [ ] 어드민 대시보드
- [ ] 팀/유저 관리
- [ ] 통계 (랭킹, 평균 등)
- [ ] 어드민 데이터 수정

### v1.2 (확산)

- [ ] 모바일 반응형
- [ ] PWA (홈 화면 추가)
- [ ] 출퇴근 알림 (선택적)
- [ ] 팀 간 랭킹 공개 페이지

---

## 11. 환경변수

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (서버 사이드)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Auth
JWT_SECRET=
ADMIN_PASSWORD=

# App
NEXT_PUBLIC_APP_URL=https://na-wasseo.vercel.app
```
