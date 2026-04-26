import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase-admin";
import type { AttendanceRecord, AttendanceState } from "@/types/attendance.types";

const COLLECTION = "attendance";

// 한국 시간(KST) 기준 현재 날짜 "YYYY-MM-DD" 반환
function getKstDateString(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

// 한국 시간(KST) 기준 현재 시각 "HH:mm" 반환
function getKstTimeString(): string {
  return new Date().toLocaleTimeString("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// "HH:mm" 두 값의 분 차이 계산 (checkOut - checkIn)
function calcTotalMinutes(checkIn: string, checkOut: string): number {
  const [inH, inM] = checkIn.split(":").map(Number);
  const [outH, outM] = checkOut.split(":").map(Number);
  return (outH * 60 + outM) - (inH * 60 + inM);
}

function docToRecord(
  id: string,
  data: FirebaseFirestore.DocumentData
): AttendanceRecord {
  return {
    id,
    userId: data.userId,
    userName: data.userName,
    teamId: data.teamId,
    date: data.date,
    checkInTime: data.checkInTime,
    checkOutTime: data.checkOutTime ?? null,
    totalMinutes: data.totalMinutes ?? null,
    state: data.state as AttendanceState,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/** 출근 기록 생성. 당일 이미 기록이 있으면 기존 문서 id를 반환(중복 방지). */
export async function checkIn(
  userId: string,
  userName: string,
  teamId: string
): Promise<AttendanceRecord> {
  const db = getDb();
  const date = getKstDateString();
  const time = getKstTimeString();

  // 중복 방지: 당일 기록이 이미 존재하면 그대로 반환
  const existing = await getByUserAndDate(userId, date);
  if (existing) return existing;

  const now = FieldValue.serverTimestamp();
  const docRef = await db.collection(COLLECTION).add({
    userId,
    userName,
    teamId,
    date,
    checkInTime: time,
    checkOutTime: null,
    totalMinutes: null,
    state: "checked_in" satisfies AttendanceState,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await docRef.get();
  return docToRecord(docRef.id, snap.data()!);
}

/** 퇴근 시간 기록 + totalMinutes 계산. state → "checked_out" */
export async function checkOut(
  userId: string,
  date: string
): Promise<AttendanceRecord | null> {
  const db = getDb();
  const time = getKstTimeString();

  const existing = await getByUserAndDate(userId, date);
  if (!existing) return null;

  const total = calcTotalMinutes(existing.checkInTime, time);

  await db.collection(COLLECTION).doc(existing.id).update({
    checkOutTime: time,
    totalMinutes: total,
    state: "checked_out" satisfies AttendanceState,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snap = await db.collection(COLLECTION).doc(existing.id).get();
  return docToRecord(existing.id, snap.data()!);
}

/** 팀의 특정 월 출퇴근 기록 전체 조회 */
export async function getByTeamAndMonth(
  teamId: string,
  year: number,
  month: number
): Promise<AttendanceRecord[]> {
  const db = getDb();
  // month는 1-based
  const from = `${year}-${String(month).padStart(2, "0")}-01`;
  const to = `${year}-${String(month).padStart(2, "0")}-31`; // "31"은 어떤 달도 초과하지 않음

  const snap = await db
    .collection(COLLECTION)
    .where("teamId", "==", teamId)
    .where("date", ">=", from)
    .where("date", "<=", to)
    .orderBy("date", "asc")
    .get();

  return snap.docs.map((doc) => docToRecord(doc.id, doc.data()));
}

/** ID로 단일 출퇴근 기록 조회 (없으면 null) */
export async function getById(id: string): Promise<AttendanceRecord | null> {
  const db = getDb();
  const snap = await db.collection(COLLECTION).doc(id).get();
  if (!snap.exists) return null;
  return docToRecord(snap.id, snap.data()!);
}

/** 유저의 특정 날짜 출퇴근 기록 조회 (없으면 null) */
export async function getByUserAndDate(
  userId: string,
  date: string
): Promise<AttendanceRecord | null> {
  const db = getDb();
  const snap = await db
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .where("date", "==", date)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return docToRecord(doc.id, doc.data());
}

/** 출퇴근 기록 수정. checkOutTime을 넣으면 totalMinutes 자동 재계산. */
export async function updateRecord(
  id: string,
  data: { checkInTime?: string; checkOutTime?: string | null }
): Promise<AttendanceRecord | null> {
  const db = getDb();
  const docRef = db.collection(COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  const current = docToRecord(id, snap.data()!);

  const checkIn = data.checkInTime ?? current.checkInTime;
  const checkOut =
    data.checkOutTime !== undefined ? data.checkOutTime : current.checkOutTime;

  const totalMinutes =
    checkOut ? calcTotalMinutes(checkIn, checkOut) : null;

  const state: AttendanceState =
    current.state === "done"
      ? "done"
      : checkOut
      ? "checked_out"
      : "checked_in";

  await docRef.update({
    checkInTime: checkIn,
    checkOutTime: checkOut ?? null,
    totalMinutes,
    state,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  return docToRecord(id, updated.data()!);
}

/** 오늘의 attendance_state 반환. 기록이 없으면 null. */
export async function getTodayState(
  userId: string
): Promise<AttendanceState | null> {
  const date = getKstDateString();
  const record = await getByUserAndDate(userId, date);
  return record?.state ?? null;
}

/** 출퇴근 기록 삭제 */
export async function deleteRecord(id: string): Promise<boolean> {
  const db = getDb();
  const docRef = db.collection(COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return false;
  await docRef.delete();
  return true;
}

/** 퇴근 취소: checkOutTime 제거, state → "checked_in" */
export async function resetCheckOut(id: string): Promise<AttendanceRecord | null> {
  const db = getDb();
  const docRef = db.collection(COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return null;

  await docRef.update({
    checkOutTime: null,
    totalMinutes: null,
    state: "checked_in" satisfies AttendanceState,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updated = await docRef.get();
  return docToRecord(id, updated.data()!);
}

/** 특정 날짜로 출퇴근 기록 직접 생성 (과거 날짜 수동 입력용). 중복 시 기존 기록 반환. */
export async function createRecordForDate(
  userId: string,
  userName: string,
  teamId: string,
  date: string,
  checkInTime: string,
  checkOutTime: string | null
): Promise<AttendanceRecord> {
  const db = getDb();

  const existing = await getByUserAndDate(userId, date);
  if (existing) return existing;

  const totalMinutes =
    checkOutTime ? calcTotalMinutes(checkInTime, checkOutTime) : null;
  const state: AttendanceState = checkOutTime ? "checked_out" : "checked_in";
  const now = FieldValue.serverTimestamp();

  const docRef = await db.collection(COLLECTION).add({
    userId,
    userName,
    teamId,
    date,
    checkInTime,
    checkOutTime: checkOutTime ?? null,
    totalMinutes,
    state,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await docRef.get();
  return docToRecord(docRef.id, snap.data()!);
}

/** "고생하셨습니다!" 상태(done)로 마킹 */
export async function markDone(
  userId: string,
  date: string
): Promise<AttendanceRecord | null> {
  const existing = await getByUserAndDate(userId, date);
  if (!existing) return null;

  const db = getDb();
  await db.collection(COLLECTION).doc(existing.id).update({
    state: "done" satisfies AttendanceState,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snap = await db.collection(COLLECTION).doc(existing.id).get();
  return docToRecord(existing.id, snap.data()!);
}
