# Claude Code 구현 프롬프트 — 나 왔어!

아래 프롬프트를 Claude Code에서 단계별로 실행하세요.
각 프롬프트는 `/discuss → /plan → /build` 하네스 워크플로우의 `/build` 단계에 해당합니다.

---

## 0단계: 프로젝트 초기화

```
나 왔어! 프로젝트를 초기화해줘.

1. Next.js 15 (App Router) + TypeScript strict + Tailwind CSS v4 프로젝트 생성
2. 필요한 패키지 설치:
   - firebase-admin (서버 사이드 Firestore)
   - jose (JWT 생성/검증)
   - zod (validation)
   - bcryptjs (비밀번호 해시)
   - date-fns (날짜 처리)
3. 디렉토리 구조 생성:
   - src/types/ (타입 정의)
   - src/lib/ (유틸, firebase-admin, auth)
   - src/lib/firestore/ (Firestore 헬퍼 함수)
   - src/components/ (React 컴포넌트)
   - src/hooks/ (커스텀 훅)
   - app/(auth)/ (로그인 라우트 그룹)
   - app/(dashboard)/ (팀 대시보드 라우트 그룹)
   - app/(admin)/ (어드민 라우트 그룹)
   - app/api/ (API routes)
4. .env.local.example 생성 (필요한 환경변수 목록)
5. CLAUDE.md, TODO.md가 이미 있으니 참고해서 진행

tsconfig.json에서 strict: true, paths에 @/* 설정 확인해줘.
```

---

## 1단계: 타입 정의 + Firebase 초기화

```
PRD.md의 데이터 모델을 기반으로:

1. src/types/auth.types.ts — Team, User 인터페이스
2. src/types/attendance.types.ts — AttendanceRecord 인터페이스, AttendanceState 타입
3. src/lib/firebase-admin.ts — Firebase Admin SDK 초기화 (싱글턴)
4. src/lib/auth.ts — JWT 생성/검증 유틸 (jose 사용)
   - createToken(payload): JWT 생성
   - verifyToken(token): JWT 검증
   - hashPassword(password): bcrypt 해시
   - comparePassword(password, hash): bcrypt 비교

모든 파일은 300줄 이하, any 금지, strict 타입.
```

---

## 2단계: 인증 시스템

```
로그인/로그아웃 시스템 구현:

1. app/api/auth/login/route.ts
   - POST 요청: { loginKey: string }
   - Firestore에서 loginKey(해시) 매칭하여 user 찾기
   - JWT 생성 → HTTP-only cookie에 저장 (7일 유효)
   - 응답: { user: { name, teamId, teamName }, success: true }
   - 실패: { error: "올바른 팀 코드를 입력해주세요" }

2. app/api/auth/logout/route.ts
   - POST 요청: cookie 삭제
   
3. middleware.ts
   - /team, /admin 경로 → JWT 검증
   - 미인증 → /login으로 리다이렉트
   - /admin → role === "admin" 검증

4. app/(auth)/login/page.tsx
   - "use client" — 폼 인터랙션 필요
   - 팀 코드 입력 필드 + 입장하기 버튼
   - 에러 표시
   - 성공 시 /team으로 리다이렉트

v0에서 만든 로그인 디자인을 참고해서 UI 구현해줘.
Zod validation 필수.
```

---

## 3단계: 출퇴근 기록 핵심 로직

```
출퇴근 기록 CRUD 구현:

1. src/lib/firestore/attendance.ts — Firestore 헬퍼
   - checkIn(userId, userName, teamId): 출근 기록 생성
   - checkOut(userId, date): 퇴근 시간 기록 + totalMinutes 계산
   - getByTeamAndMonth(teamId, year, month): 팀 월간 기록 조회
   - getByUserAndDate(userId, date): 유저 당일 기록 조회
   - updateRecord(id, data): 기록 수정
   - getTodayState(userId): 오늘의 attendance_state 반환

2. app/(dashboard)/team/actions.ts — Server Actions
   - checkInAction(): 현재 유저 출근 처리
   - checkOutAction(): 현재 유저 퇴근 처리
   - updateAttendanceAction(id, checkInTime, checkOutTime): 수정

모든 시간은 한국 시간(KST, Asia/Seoul) 기준.
날짜 형식: YYYY-MM-DD, 시간 형식: HH:mm.
totalMinutes는 퇴근 시 자동 계산.
```

---

## 4단계: 출퇴근 버튼 컴포넌트

```
출퇴근 버튼 컴포넌트 구현:

src/components/AttendanceButton.tsx ("use client")

3가지 상태 전이:
1. state === null 또는 없음 → "출석하기" 버튼 (초록 bg-green-500)
   - 클릭 → checkInAction() 호출 → state = "checked_in"
2. state === "checked_in" → "퇴근하기" 버튼 (주황 bg-orange-500)  
   - 클릭 → checkOutAction() 호출 → state = "checked_out"
3. state === "checked_out" 또는 "done" → "고생하셨습니다!" 버튼 (회색 bg-gray-400)
   - 클릭 → alert("오늘 하루도 고생하셨습니다!")

추가 표시:
- 현재 시간 (실시간 업데이트, 1초 간격)
- 오늘 출근 시간 / 퇴근 시간 요약
- "안녕하세요, {userName}님!" 인사

useOptimistic으로 버튼 즉시 전환, 서버 확인 후 최종 반영.
로딩 중에는 버튼 disabled + 스피너.
```

---

## 5단계: 월간 캘린더 뷰

```
팀 대시보드의 월간 캘린더 뷰 구현:

1. app/(dashboard)/team/page.tsx (Server Component)
   - searchParams에서 month 파라미터 읽기 (?month=2026-04)
   - 없으면 현재 월
   - Firestore에서 해당 월 팀 출퇴근 데이터 조회
   - 데이터를 날짜별로 그룹화하여 캘린더에 전달

2. src/components/MonthlyCalendar.tsx
   - 7열(일~토) × 4~6행 그리드
   - 각 셀: DayCell 컴포넌트
   - 오늘 날짜 하이라이트
   - 주말 배경색 다르게

3. src/components/DayCell.tsx
   - 날짜 숫자
   - 팀원별 출퇴근 기록 (이름 + 시간)
   - hover 시 본인 기록에 ⚙️ 수정 아이콘
   - 기록 없으면 회색 대시

4. src/components/WeeklyTotal.tsx
   - 각 주 우측에 팀원별 주간 누적 시간

5. src/components/MonthlyTotal.tsx  
   - 캘린더 우측 사이드바에 월간 누적 시간
   - 팀원별 total (시간h 분m 형식)

6. src/components/MonthNavigation.tsx ("use client")
   - ◀ 이전 월 / ▶ 다음 월 버튼
   - router.push로 month 파라미터 변경

7. src/components/EditAttendanceModal.tsx ("use client")
   - ⚙️ 클릭 시 모달 오픈
   - 출근/퇴근 시간 time picker
   - 저장 버튼 → updateAttendanceAction 호출
   - 본인 기록만 수정 가능

date-fns 사용해서 날짜 계산 (startOfMonth, endOfMonth, eachDayOfInterval 등).
시간 계산: totalMinutes를 "Xh Ym" 또는 "X시간 Y분" 형식으로 표시.
```

---

## 6단계: 어드민 — 인증 + 레이아웃

```
어드민 시스템 기초:

1. app/(admin)/admin/layout.tsx
   - 좌측 사이드바 네비게이션 (대시보드/팀관리/유저관리/출퇴근관리)
   - 어드민 인증 체크 (role === "admin")

2. 어드민 로그인은 환경변수 ADMIN_PASSWORD와 비교
   - /admin 접근 시 role !== "admin"이면 별도 어드민 로그인 폼

3. app/api/teams/route.ts — 팀 CRUD API
4. app/api/users/route.ts — 유저 CRUD API (loginKey 자동 생성)
```

---

## 7단계: 어드민 — 대시보드 + 통계

```
어드민 대시보드 구현:

1. app/(admin)/admin/page.tsx — 통계 대시보드
   - 상단 4개 스탯 카드 (전체 팀 수, 전체 유저 수, 이번 달 총 시간, 평균 일 근무 시간)
   - 팀 랭킹 테이블 (이번 달 총 시간 순)
   - 유저 랭킹 테이블 (이번 달 총 시간 순)

2. app/(admin)/admin/teams/page.tsx — 팀 관리
   - 팀 목록 테이블 + 새 팀 등록 폼
   - 팀 삭제 기능

3. app/(admin)/admin/users/page.tsx — 유저 관리
   - 유저 목록 + 새 유저 등록
   - loginKey 형식: team-{팀이름}-{비번} 자동 생성 UI
   - 유저 수정/삭제

4. app/(admin)/admin/attendance/page.tsx — 출퇴근 관리
   - 팀/날짜 필터
   - 전체 기록 테이블
   - 인라인 수정 기능

src/lib/firestore/stats.ts — 통계 계산 헬퍼 함수
```

---

## 8단계: 마무리 + 배포

```
최종 점검 및 배포:

1. 모든 페이지에 loading.tsx, error.tsx 추가
2. 메타데이터 설정 (title, description, favicon)
3. npx tsc --noEmit — 타입 에러 0
4. npx next lint — lint 에러 0
5. Vercel 배포 설정:
   - 환경변수 등록
   - Firebase 서비스 계정 키 등록
6. Firestore 인덱스 생성 (attendance: teamId + date)
7. 초기 데이터 시딩 스크립트:
   - 우리 팀 등록
   - 3명 유저 등록 (loginKey 생성)
   - scripts/seed.ts 파일로 만들어줘

시딩 스크립트는 tsx나 ts-node로 직접 실행 가능하게.
```

---

## 프롬프트 사용 팁

1. 각 단계를 **독립 세션**에서 실행 (한 세션 = 한 태스크)
2. 세션 시작 시 `CLAUDE.md`, `TODO.md` 읽기 → 현재 진행 상황 파악
3. 완료 후 `TODO.md` 업데이트 + git commit
4. 막히면 `/discuss`로 돌아가서 의도 재정렬
5. v0에서 생성한 컴포넌트 코드는 `src/components/`에 복사 후 데이터 연결
