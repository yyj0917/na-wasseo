"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";
import {
  checkIn,
  checkOut,
  updateRecord,
  markDone,
  deleteRecord,
  resetCheckOut,
  getById,
  createRecordForDate,
} from "@/lib/firestore/attendance";

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** 현재 로그인 유저의 오늘 출근 처리 */
export async function checkInAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    await checkIn(session.userId, session.userName, session.teamId);
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "출근 처리 중 오류가 발생했습니다." };
  }
}

/** 현재 로그인 유저의 오늘 퇴근 처리 */
export async function checkOutAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  try {
    const record = await checkOut(session.userId, today);
    if (!record) {
      return { success: false, error: "출근 기록이 없습니다." };
    }
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "퇴근 처리 중 오류가 발생했습니다." };
  }
}

/** 오늘 기록을 "done" 상태로 마킹 */
export async function markDoneAction(): Promise<
  { success: true } | { success: false; error: string }
> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const today = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });

  try {
    const record = await markDone(session.userId, today);
    if (!record) {
      return { success: false, error: "기록을 찾을 수 없습니다." };
    }
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "상태 업데이트 중 오류가 발생했습니다." };
  }
}

/** 출퇴근 기록 삭제 (본인 기록만) */
export async function deleteAttendanceAction(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const existing = await getById(id);
    if (!existing) {
      return { success: false, error: "기록을 찾을 수 없습니다." };
    }
    if (existing.userId !== session.userId && session.role !== "admin") {
      return { success: false, error: "본인 기록만 삭제할 수 있습니다." };
    }

    await deleteRecord(id);
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "기록 삭제 중 오류가 발생했습니다." };
  }
}

/** 퇴근 취소: checked_out/done → checked_in (본인 기록만) */
export async function resetCheckOutAction(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const existing = await getById(id);
    if (!existing) {
      return { success: false, error: "기록을 찾을 수 없습니다." };
    }
    if (existing.userId !== session.userId && session.role !== "admin") {
      return { success: false, error: "본인 기록만 수정할 수 있습니다." };
    }

    const record = await resetCheckOut(id);
    if (!record) {
      return { success: false, error: "기록을 찾을 수 없습니다." };
    }
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "퇴근 취소 중 오류가 발생했습니다." };
  }
}

/** 특정 날짜 출퇴근 기록 신규 생성 (과거 날짜 수동 입력용, 본인만) */
export async function createAttendanceForDateAction(
  date: string,
  checkInTime: string,
  checkOutTime: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  const todayKst = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Asia/Seoul",
  });
  if (date > todayKst) {
    return { success: false, error: "미래 날짜는 기록할 수 없습니다." };
  }

  try {
    await createRecordForDate(
      session.userId,
      session.userName,
      session.teamId,
      date,
      checkInTime,
      checkOutTime
    );
    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "기록 생성 중 오류가 발생했습니다." };
  }
}

/** 출퇴근 기록 수정 (본인 기록만) */
export async function updateAttendanceAction(
  id: string,
  checkInTime: string,
  checkOutTime: string | null
): Promise<{ success: true } | { success: false; error: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "로그인이 필요합니다." };
  }

  try {
    const record = await updateRecord(id, {
      checkInTime,
      checkOutTime: checkOutTime ?? null,
    });

    if (!record) {
      return { success: false, error: "기록을 찾을 수 없습니다." };
    }

    // 본인 기록인지 검증
    if (record.userId !== session.userId && session.role !== "admin") {
      return { success: false, error: "본인 기록만 수정할 수 있습니다." };
    }

    revalidatePath("/team");
    return { success: true };
  } catch {
    return { success: false, error: "기록 수정 중 오류가 발생했습니다." };
  }
}
