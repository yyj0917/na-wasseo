import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyToken, SESSION_COOKIE } from "@/lib/session";
import { getByTeamAndMonth } from "@/lib/firestore/attendance";
import { getTeamMembers } from "@/lib/firestore/users";
import { TopBar } from "@/components/dashboard/top-bar";
import { AttendanceAction } from "@/components/dashboard/attendance-action";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { MonthlyTotal } from "@/components/MonthlyTotal";
import type { CalendarRecord } from "@/types/calendar.types";
import type { AttendanceRecord } from "@/types/attendance.types";

interface PageProps {
  searchParams: Promise<{ month?: string }>;
}

function toCalendarRecord(r: AttendanceRecord): CalendarRecord {
  return {
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    date: r.date,
    checkInTime: r.checkInTime,
    checkOutTime: r.checkOutTime,
    totalMinutes: r.totalMinutes,
    state: r.state,
  };
}

export default async function TeamPage({ searchParams }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const now = new Date();
  let year: number;
  let month: number;

  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    [year, month] = params.month.split("-").map(Number);
  } else {
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const todayKst = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

  const [rawRecords, members] = await Promise.all([
    getByTeamAndMonth(session.teamId, year, month),
    getTeamMembers(session.teamId),
  ]);

  const records = rawRecords.map(toCalendarRecord);

  const todayRecord =
    records.find((r) => r.userId === session.userId && r.date === todayKst) ??
    null;

  return (
    <div className="min-h-screen bg-background">
      <TopBar teamName={session.teamName} year={year} month={month} />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <AttendanceAction
          currentUserName={session.userName}
          todayRecord={todayRecord}
        />

        <div className="mt-8 flex gap-6">
          <div className="flex-1 min-w-0">
            <MonthlyCalendar
              year={year}
              month={month}
              records={records}
              members={members}
              currentUserId={session.userId}
              today={todayKst}
            />
          </div>
          <div className="w-72 shrink-0">
            <MonthlyTotal
              year={year}
              month={month}
              records={records}
              members={members}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
