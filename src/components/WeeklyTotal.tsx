import type { CalendarRecord, TeamMemberBasic } from "@/types/calendar.types";

interface CalendarDay {
  dateStr: string;
  isCurrentMonth: boolean;
}

interface WeeklyTotalProps {
  week: CalendarDay[];
  members: TeamMemberBasic[];
  recordMap: Map<string, Map<string, CalendarRecord>>;
}

function formatWeeklyMinutes(minutes: number): string {
  if (minutes === 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function WeeklyTotal({ week, members, recordMap }: WeeklyTotalProps) {
  const totals = members.map((member) => {
    const weekMinutes = week
      .filter((d) => d.isCurrentMonth)
      .reduce((sum, d) => {
        const rec = recordMap.get(d.dateStr)?.get(member.id);
        return sum + (rec?.totalMinutes ?? 0);
      }, 0);
    return { member, minutes: weekMinutes };
  });

  const hasAny = totals.some((t) => t.minutes > 0);

  return (
    <div className="border-b border-r border-border/30 p-2 bg-muted/10 flex flex-col justify-start gap-1.5 min-h-[120px]">
      {hasAny ? (
        totals.map(({ member, minutes }) => (
          <div key={member.id} className="flex flex-col justify-between gap-1 text-xs xl:flex-row xl:items-center">
            <span className="w-fit truncate font-medium text-foreground">
              {member.name}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatWeeklyMinutes(minutes)}
            </span>
          </div>
        ))
      ) : (
        <span className="text-xs text-muted-foreground/40 mt-2">-</span>
      )}
    </div>
  );
}
