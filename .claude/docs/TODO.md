# 나 왔어! — TODO

## Phase 1: MVP (1주)

### 프로젝트 세팅
- [ ] Next.js 15 + TypeScript + Tailwind v4 초기화
- [ ] Firebase 프로젝트 생성 + Admin SDK 연결
- [ ] 환경변수 세팅 (.env.local)
- [ ] Vercel 프로젝트 연결
- [ ] 디렉토리 구조 생성 (src/types, src/lib, src/components, src/hooks)

### 인증
- [ ] 타입 정의: User, Team (src/types/auth.types.ts)
- [ ] Firebase Admin SDK 초기화 (src/lib/firebase-admin.ts)
- [ ] JWT 유틸 (src/lib/auth.ts) — jose 라이브러리
- [ ] 로그인 API (app/api/auth/login/route.ts) — loginKey → user 매칭
- [ ] 로그아웃 API (app/api/auth/logout/route.ts)
- [ ] 인증 미들웨어 (middleware.ts)
- [ ] 로그인 페이지 UI (app/(auth)/login/page.tsx)

### 출퇴근 기록
- [ ] 타입 정의: AttendanceRecord (src/types/attendance.types.ts)
- [ ] Firestore 헬퍼: attendance CRUD (src/lib/firestore/attendance.ts)
- [ ] 출근 Server Action (check-in)
- [ ] 퇴근 Server Action (check-out)
- [ ] 출퇴근 버튼 컴포넌트 (src/components/AttendanceButton.tsx)

### 캘린더 뷰
- [ ] 월간 캘린더 그리드 컴포넌트 (src/components/MonthlyCalendar.tsx)
- [ ] 날짜 셀 컴포넌트 (src/components/DayCell.tsx)
- [ ] 주간 Total 컴포넌트 (src/components/WeeklyTotal.tsx)
- [ ] 월간 Total 컴포넌트 (src/components/MonthlyTotal.tsx)
- [ ] 팀 대시보드 페이지 (app/(dashboard)/team/page.tsx)
- [ ] 월 네비게이션 (이전/다음 월)

### 기록 수정
- [ ] 수정 모달 컴포넌트 (src/components/EditAttendanceModal.tsx)
- [ ] 수정 Server Action
- [ ] 본인 기록만 수정 가능 검증

### 배포
- [ ] Vercel 배포 + 환경변수 세팅
- [ ] Firestore 인덱스 생성
- [ ] 초기 데이터 시딩 (우리 팀 등록)

---

## Phase 2: 어드민 (v1.1)

### 어드민 인증
- [ ] 어드민 로그인 페이지
- [ ] 어드민 미들웨어

### 팀/유저 관리
- [ ] 팀 CRUD API + UI
- [ ] 유저 등록 (loginKey 생성) API + UI
- [ ] 유저 목록/수정/삭제

### 통계 대시보드
- [ ] 팀별 총 시간 랭킹
- [ ] 유저별 총 시간 랭킹
- [ ] 이번 주/이번 달 통계
- [ ] 평균 출퇴근 시간

### 데이터 관리
- [ ] 어드민 출퇴근 기록 수정
- [ ] 팀/유저 데이터 직접 수정
