"use client";

import { Settings } from "lucide-react";
import type { CalendarRecord, TeamMemberBasic } from "@/types/calendar.types";

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
}

interface DayCellProps {
  day: CalendarDay;
  members: TeamMemberBasic[];
  /** dateStr → userId → CalendarRecord (해당 날짜의 레코드 맵) */
  recordsForDay: Map<string, CalendarRecord>;
  currentUserId: string;
  today: string;
  onEdit: (recordId: string) => void;
}

export function DayCell({
  day,
  members,
  recordsForDay,
  currentUserId,
  today,
  onEdit,
}: DayCellProps) {
  const { date, dateStr, isCurrentMonth } = day;
  const dayOfWeek = date.getDay();
  const isToday = dateStr === today;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <div
      className={[
        "min-h-[120px] border-b border-r border-border/30 p-1.5 sm:p-2",
        !isCurrentMonth
          ? "bg-muted/20"
          : isWeekend
          ? dayOfWeek === 0
            ? "bg-red-500/[0.03]"
            : "bg-primary/[0.03]"
          : "bg-card",
        isToday ? "ring-2 ring-primary ring-inset" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 날짜 숫자 */}
      <div
        className={[
          "mb-1.5 text-sm font-medium",
          !isCurrentMonth
            ? "text-muted-foreground/40"
            : dayOfWeek === 0
            ? "text-destructive"
            : dayOfWeek === 6
            ? "text-primary"
            : "text-foreground",
        ].join(" ")}
      >
        {date.getDate()}
      </div>

      {/* 팀원별 출퇴근 기록 */}
      {isCurrentMonth && (
        <div className="space-y-1">
          {members.map((member) => {
            const rec = recordsForDay.get(member.id);
            const isOwn = member.id === currentUserId;
            const hasRecord = rec?.checkInTime;

            return (
              <div key={member.id} className="group flex flex-col justify-between gap-1 text-[11px] leading-tight xl:flex-row xl:items-center">
                <span className="w-fit shrink-0 truncate font-semibold text-foreground">
                  {member.name.slice(0, 3)}
                </span>
                <span className="min-w-0 flex-1 truncate tabular-nums text-[10px] text-muted-foreground">
                  {hasRecord ? (
                    <>
                      {rec!.checkInTime}
                      {rec!.checkOutTime ? `-${rec!.checkOutTime}` : "~"}
                    </>
                  ) : (
                    <span className="text-muted-foreground/40">-</span>
                  )}
                </span>
                {isOwn && rec && (
                  <button
                    onClick={() => onEdit(rec.id)}
                    className="ml-auto rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 shrink-0"
                    title="수정"
                  >
                    <Settings className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
