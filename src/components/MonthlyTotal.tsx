import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CalendarRecord, TeamMemberBasic } from "@/types/calendar.types";

interface MonthlyTotalProps {
  year: number;
  month: number;
  records: CalendarRecord[];
  members: TeamMemberBasic[];
}

function formatTotalMinutes(minutes: number): string {
  if (minutes === 0) return "0시간";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

export function MonthlyTotal({ year, month, records, members }: MonthlyTotalProps) {
  const prefix = `${year}-${String(month).padStart(2, "0")}`;

  const totals = members.map((member) => {
    const minutes = records
      .filter((r) => r.userId === member.id && r.date.startsWith(prefix))
      .reduce((sum, r) => sum + (r.totalMinutes ?? 0), 0);
    return { member, minutes };
  });

  const maxMinutes = Math.max(...totals.map((t) => t.minutes), 1);

  return (
    <Card className="shadow-sm border border-border/50 rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-foreground">
          {month}월 총 근무시간
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {totals.map(({ member, minutes }) => {
            const percentage = (minutes / maxMinutes) * 100;
            return (
              <div key={member.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">
                    {member.name}
                  </span>
                  <span className="text-sm font-semibold text-primary tabular-nums">
                    {formatTotalMinutes(minutes)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
