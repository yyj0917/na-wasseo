import type { Timestamp } from "firebase-admin/firestore";

export type AttendanceState = "checked_in" | "checked_out" | "done";

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  teamId: string;
  date: string; // "YYYY-MM-DD"
  checkInTime: string; // "HH:mm"
  checkOutTime: string | null; // "HH:mm" or null
  totalMinutes: number | null;
  state: AttendanceState;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
