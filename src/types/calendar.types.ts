import type { AttendanceState } from "@/types/attendance.types";

/** Timestamp 없는 직렬화 가능한 출퇴근 레코드 (Server → Client 전달용) */
export interface CalendarRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // "YYYY-MM-DD"
  checkInTime: string; // "HH:mm"
  checkOutTime: string | null;
  totalMinutes: number | null;
  state: AttendanceState;
}

export interface TeamMemberBasic {
  id: string;
  name: string;
}

/** 출퇴근 편집 모달 상태 — edit: 기존 기록 수정 / create: 새 기록 추가 / null: 닫힘 */
export type EditModalState =
  | { mode: "edit"; record: CalendarRecord }
  | { mode: "create"; date: string }
  | null;
