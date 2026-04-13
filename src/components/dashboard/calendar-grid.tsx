"use client"

import { Card } from "@/components/ui/card"
import { Settings } from "lucide-react"
import type { TeamMember, AttendanceRecord } from "@/app/dashboard/page"

interface CalendarGridProps {
  currentDate: Date
  teamMembers: TeamMember[]
  attendanceRecords: AttendanceRecord[]
  currentUserId: string
  onEditRecord: (date: string, memberId: string) => void
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()

  const days: { date: Date; isCurrentMonth: boolean }[] = []

  // Previous month days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i)
    days.push({ date, isCurrentMonth: false })
  }

  // Current month days
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({ date, isCurrentMonth: true })
  }

  // Next month days to fill the grid (up to 6 weeks)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i)
    days.push({ date, isCurrentMonth: false })
  }

  return days
}

function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function CalendarGrid({
  currentDate,
  teamMembers,
  attendanceRecords,
  currentUserId,
  onEditRecord,
}: CalendarGridProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const calendarDays = getCalendarDays(year, month)
  const today = "2026-04-14"

  const getRecordsForDay = (dateStr: string) => {
    return teamMembers.map((member) => {
      const record = attendanceRecords.find(
        (r) => r.date === dateStr && r.memberId === member.id
      )
      return {
        member,
        checkIn: record?.checkIn || null,
        checkOut: record?.checkOut || null,
      }
    })
  }

  return (
    <Card className="shadow-sm border border-border/50 rounded-xl overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-border/50">
        {WEEKDAYS.map((day, idx) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-semibold ${
              idx === 0
                ? "text-destructive bg-destructive/5"
                : idx === 6
                ? "text-primary bg-primary/5"
                : "text-foreground bg-muted/30"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const dateStr = formatDateString(date)
          const dayOfWeek = date.getDay()
          const isToday = dateStr === today
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          const records = getRecordsForDay(dateStr)

          return (
            <div
              key={idx}
              className={`min-h-[120px] border-b border-r border-border/30 p-2 ${
                !isCurrentMonth
                  ? "bg-muted/20"
                  : isWeekend
                  ? dayOfWeek === 0
                    ? "bg-destructive/[0.03]"
                    : "bg-primary/[0.03]"
                  : "bg-card"
              } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
            >
              {/* Date Number */}
              <div
                className={`text-sm font-medium mb-2 ${
                  !isCurrentMonth
                    ? "text-muted-foreground/40"
                    : dayOfWeek === 0
                    ? "text-destructive"
                    : dayOfWeek === 6
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {date.getDate()}
              </div>

              {/* Member Records */}
              {isCurrentMonth && (
                <div className="space-y-1">
                  {records.map(({ member, checkIn, checkOut }) => {
                    const isOwnRecord = member.id === currentUserId
                    const hasRecord = checkIn || checkOut

                    return (
                      <div
                        key={member.id}
                        className="group flex items-center gap-1 text-xs"
                      >
                        <span className="font-semibold text-foreground truncate w-12">
                          {member.name.slice(0, 3)}
                        </span>
                        <span className="text-muted-foreground tabular-nums">
                          {hasRecord ? (
                            <>
                              {checkIn || "--:--"}-{checkOut || "--:--"}
                            </>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </span>
                        {isOwnRecord && (
                          <button
                            onClick={() => onEditRecord(dateStr, member.id)}
                            className="opacity-0 group-hover:opacity-100 ml-auto p-0.5 hover:bg-muted rounded transition-opacity"
                            title="수정"
                          >
                            <Settings className="h-3 w-3 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
