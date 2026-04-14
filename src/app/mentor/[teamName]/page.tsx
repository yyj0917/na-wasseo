import { notFound } from "next/navigation";
import { getTeamByName } from "@/lib/firestore/teams";
import { getTeamMembers } from "@/lib/firestore/users";
import { getByTeamAndMonth } from "@/lib/firestore/attendance";
import { MentorHeader } from "@/components/mentor/MentorHeader";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { MonthlyTotal } from "@/components/MonthlyTotal";
import type { CalendarRecord } from "@/types/calendar.types";
import type { AttendanceRecord } from "@/types/attendance.types";

interface PageProps {
  params: Promise<{ teamName: string }>;
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

export default async function MentorTeamPage({ params, searchParams }: PageProps) {
  const { teamName: encodedTeamName } = await params;
  const teamName = decodeURIComponent(encodedTeamName);

  const team = await getTeamByName(teamName);
  if (!team) notFound();

  const now = new Date();
  const sp = await searchParams;
  let year: number;
  let month: number;

  if (sp.month && /^\d{4}-\d{2}$/.test(sp.month)) {
    [year, month] = sp.month.split("-").map(Number);
  } else {
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const todayKst = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

  const [rawRecords, members] = await Promise.all([
    getByTeamAndMonth(team.id, year, month),
    getTeamMembers(team.id),
  ]);

  const records = rawRecords.map(toCalendarRecord);

  return (
    <div className="min-h-screen bg-background">
      <MentorHeader teamName={team.name} year={year} month={month} />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <MonthlyCalendar
              year={year}
              month={month}
              records={records}
              members={members}
              today={todayKst}
              readOnly
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
