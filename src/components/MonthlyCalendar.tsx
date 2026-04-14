"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DayCell } from "@/components/DayCell";
import { WeeklyTotal } from "@/components/WeeklyTotal";
import { EditAttendanceModal } from "@/components/EditAttendanceModal";
import type { CalendarRecord, TeamMemberBasic } from "@/types/calendar.types";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

interface CalendarDay {
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
}

function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildCalendarWeeks(year: number, month: number): CalendarDay[][] {
  // month는 1-based
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startDow = firstDay.getDay();

  const days: CalendarDay[] = [];

  // 이전 달 채우기
  for (let i = startDow - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, -i);
    days.push({ date, dateStr: toDateStr(date), isCurrentMonth: false });
  }

  // 현재 달
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month - 1, d);
    days.push({ date, dateStr: toDateStr(date), isCurrentMonth: true });
  }

  // 다음 달로 7의 배수 채우기
  while (days.length % 7 !== 0) {
    const date = new Date(year, month, days.length - (startDow + lastDay.getDate() - 1));
    days.push({ date, dateStr: toDateStr(date), isCurrentMonth: false });
  }

  // 주 단위로 분리
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

interface MonthlyCalendarProps {
  year: number;
  month: number;
  records: CalendarRecord[];
  members: TeamMemberBasic[];
  currentUserId?: string;
  today: string; // "YYYY-MM-DD"
  readOnly?: boolean;
}

export function MonthlyCalendar({
  year,
  month,
  records,
  members,
  currentUserId = "",
  today,
  readOnly = false,
}: MonthlyCalendarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const weeks = buildCalendarWeeks(year, month);

  // date → userId → record 이중 맵
  const recordMap = new Map<string, Map<string, CalendarRecord>>();
  for (const rec of records) {
    if (!recordMap.has(rec.date)) recordMap.set(rec.date, new Map());
    recordMap.get(rec.date)!.set(rec.userId, rec);
  }

  const editingRecord = editingId
    ? (records.find((r) => r.id === editingId) ?? null)
    : null;

  return (
    <>
      <Card className="shadow-sm border border-border/50 rounded-xl overflow-hidden">
        {/* 요일 헤더 (7 + 1 Total) */}
        <div
          className="grid border-b border-border/50"
          style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr)) 160px" }}
        >
          {WEEKDAYS.map((day, idx) => (
            <div
              key={day}
              className={[
                "py-3 text-center text-sm font-semibold",
                idx === 0
                  ? "text-destructive bg-destructive/5"
                  : idx === 6
                  ? "text-primary bg-primary/5"
                  : "text-foreground bg-muted/30",
              ].join(" ")}
            >
              {day}
            </div>
          ))}
          <div className="py-3 text-center text-sm font-semibold text-foreground bg-muted/30">
            주간 Total
          </div>
        </div>

        {/* 주 단위 행 */}
        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className="grid"
            style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr)) 160px" }}
          >
            {week.map((day) => (
              <DayCell
                key={day.dateStr}
                day={day}
                members={members}
                recordsForDay={recordMap.get(day.dateStr) ?? new Map()}
                currentUserId={currentUserId}
                today={today}
                onEdit={(id) => setEditingId(id)}
                readOnly={readOnly}
              />
            ))}
            <WeeklyTotal week={week} members={members} recordMap={recordMap} />
          </div>
        ))}
      </Card>

      {!readOnly && (
        <EditAttendanceModal
          record={editingRecord}
          onClose={() => setEditingId(null)}
        />
      )}
    </>
  );
}
