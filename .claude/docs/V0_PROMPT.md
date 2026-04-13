# v0 프롬프트 — 나 왔어! UI 디자인

아래 3개 프롬프트를 v0에 순서대로 입력하세요.

---

## 프롬프트 1: 로그인 페이지

```
Create a login page for a team attendance tracking app called "나 왔어!" (Na-Wasseo, means "I'm here!" in Korean).

Tech: Next.js 15 App Router + TypeScript + Tailwind CSS v4

Design direction:
- Clean, modern, slightly playful Korean startup vibe
- Light background with warm accent colors (orange/coral as primary)
- The app name "나 왔어!" should be large and bold at the top, with a small hand-wave emoji 👋
- Subtitle: "소마 팀 출퇴근 기록 서비스"
- Single input field with placeholder "team-팀이름-비밀번호"
- Large "입장하기" (Enter) button below
- Error state: red text below input "올바른 팀 코드를 입력해주세요"
- Footer: "SW마에스트로 출퇴근 관리" in small gray text
- Card-style centered layout, max-width 400px
- Subtle shadow and rounded corners on the card
- Mobile responsive but optimized for desktop

No Google OAuth, no social login. Just the single code input.
```

---

## 프롬프트 2: 팀 대시보드 (메인 — 캘린더 뷰)

```
Create the main team dashboard page for "나 왔어!" attendance app.

Tech: Next.js 15 App Router + TypeScript + Tailwind CSS v4

Layout (desktop-first, min-width 1024px):

TOP BAR:
- Left: "나 왔어! 👋" logo/name
- Center: Team name badge (e.g., "팀 수관기피")
- Right side: Month navigation "◀ 2026년 4월 ▶" and "로그아웃" button

ATTENDANCE ACTION AREA (below top bar):
- Current user greeting: "안녕하세요, 정상영님!"
- Large attendance button with 3 states:
  1. "출석하기" — green background, white text, large
  2. "퇴근하기" — orange background, white text, large
  3. "고생하셨습니다!" — gray background, with confetti-like subtle decoration
- Current time display next to button
- Today's record summary: "오늘 출근: 10:00 | 퇴근: -"

CALENDAR GRID:
- 7 columns: 일/월/화/수/목/금/토 headers
- Each day cell contains for each team member (3 people):
  - Name (small, bold)
  - Check-in time — Check-out time (e.g., "10:00-19:00")
  - If no record: gray dash
  - Small ⚙️ edit icon on hover (only for own records)
- Weekend columns (일/토) have slightly different background color
- Today's date cell has a highlighted border (orange/coral)
- Days outside current month are grayed out

RIGHT SIDEBAR (or below on smaller screens):
- Weekly totals per member for the visible week
- Monthly total section at bottom:
  - Each member: name + total hours (e.g., "정상영: 267시간 33분")
  - Bar chart or simple visual showing relative hours

EDIT MODAL (when ⚙️ clicked):
- Modal overlay
- Title: "출퇴근 시간 수정"
- Date display (read-only)
- Two time pickers: 출근 시간, 퇴근 시간
- "저장" and "취소" buttons
- Only editable for own records

Color scheme: warm whites, soft grays, orange/coral accents for CTAs and highlights. Clean sans-serif Korean-friendly typography (Pretendard or similar).

The calendar should look similar to a spreadsheet but more polished — think Notion calendar meets Google Sheets attendance tracker.
```

---

## 프롬프트 3: 어드민 대시보드

```
Create an admin dashboard for "나 왔어!" attendance app.

Tech: Next.js 15 App Router + TypeScript + Tailwind CSS v4

LAYOUT:
- Left sidebar navigation (dark, 240px width):
  - "나 왔어! Admin" at top
  - Menu items with icons:
    - 📊 대시보드 (Dashboard)
    - 👥 팀 관리 (Teams)
    - 👤 유저 관리 (Users)  
    - 📋 출퇴근 관리 (Attendance)
  - "로그아웃" at bottom

DASHBOARD PAGE (main content):

Stats Cards Row (4 cards):
1. 전체 팀 수 (Total Teams) — with team icon
2. 전체 유저 수 (Total Users) — with user icon
3. 이번 달 총 시간 (Monthly Total Hours) — with clock icon
4. 평균 일 근무 시간 (Avg Daily Hours) — with chart icon

Rankings Section (2 columns):
Left: "팀 랭킹 (이번 달)" — table with rank, team name, total hours, bar visualization
Right: "유저 랭킹 (이번 달)" — table with rank, name, team, total hours

Recent Activity:
- Timeline of recent check-ins/check-outs
- "정상영 (수관기피) 출근 10:00" style entries

TEAMS PAGE:
- "새 팀 등록" button (top right)
- Table: 팀 이름, 멤버 수, 이번 달 총 시간, 생성일, 관리 버튼
- Click row → team detail with members list

USERS PAGE:
- "새 유저 등록" button
- Registration form: 이름, 팀 선택(dropdown), 로그인 키 (team-팀이름-비번 format auto-generate)
- Table: 이름, 팀, 로그인 키 (masked), 이번 달 시간, 관리 버튼

ATTENDANCE PAGE:
- Filters: 팀 선택, 날짜 범위
- Table: 날짜, 이름, 팀, 출근, 퇴근, 총 시간, 수정 버튼
- Inline editing capability

Color: Professional dark sidebar + clean white content area. Orange/coral accent for CTAs. Data-heavy but not cluttered.
```

---

## 디자인 참고사항

- 폰트: Pretendard (한글) 또는 Noto Sans KR — v0에서 사용 가능한 것으로
- Primary Color: #FF6B35 (warm orange/coral)
- Secondary: #1E293B (dark navy for sidebar/headers)
- Success: #22C55E (green for 출석)
- Warning: #F59E0B (orange for 퇴근)
- Background: #FAFAFA or #F8FAFC
- Card: white with subtle shadow (shadow-sm)
- Border radius: rounded-xl for cards, rounded-lg for buttons
