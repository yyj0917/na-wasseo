"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamMember, AttendanceRecord } from "@/app/dashboard/page"

interface StatsSidebarProps {
  currentDate: Date
  teamMembers: TeamMember[]
  attendanceRecords: AttendanceRecord[]
}

function calculateHours(checkIn: string | null, checkOut: string | null): number {
  if (!checkIn || !checkOut) return 0

  const [inHour, inMin] = checkIn.split(":").map(Number)
  const [outHour, outMin] = checkOut.split(":").map(Number)

  const inMinutes = inHour * 60 + inMin
  const outMinutes = outHour * 60 + outMin

  return Math.max(0, outMinutes - inMinutes)
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}시간 ${minutes}분`
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay()
  const start = new Date(date)
  start.setDate(date.getDate() - day)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const day = date.getDate().toString().padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function StatsSidebar({
  currentDate,
  teamMembers,
  attendanceRecords,
}: StatsSidebarProps) {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Calculate monthly totals
  const monthlyTotals = teamMembers.map((member) => {
    const memberRecords = attendanceRecords.filter(
      (r) =>
        r.memberId === member.id &&
        r.date.startsWith(`${year}-${(month + 1).toString().padStart(2, "0")}`)
    )
    const totalMinutes = memberRecords.reduce(
      (acc, r) => acc + calculateHours(r.checkIn, r.checkOut),
      0
    )
    return { member, totalMinutes }
  })

  const maxMinutes = Math.max(...monthlyTotals.map((t) => t.totalMinutes), 1)

  // Calculate weekly totals
  const weekRange = getWeekRange(currentDate)
  const weeklyTotals = teamMembers.map((member) => {
    const memberRecords = attendanceRecords.filter((r) => {
      if (r.memberId !== member.id) return false
      const recordDate = new Date(r.date)
      return recordDate >= weekRange.start && recordDate <= weekRange.end
    })
    const totalMinutes = memberRecords.reduce(
      (acc, r) => acc + calculateHours(r.checkIn, r.checkOut),
      0
    )
    return { member, totalMinutes }
  })

  return (
    <div className="space-y-4">
      {/* Weekly Totals */}
      <Card className="shadow-sm border border-border/50 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            이번 주 근무시간
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {weekRange.start.getMonth() + 1}/{weekRange.start.getDate()} -{" "}
            {weekRange.end.getMonth() + 1}/{weekRange.end.getDate()}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {weeklyTotals.map(({ member, totalMinutes }) => (
              <div key={member.id} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {member.name}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {formatMinutes(totalMinutes)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Totals */}
      <Card className="shadow-sm border border-border/50 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            {month + 1}월 총 근무시간
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {monthlyTotals.map(({ member, totalMinutes }) => {
              const percentage = (totalMinutes / maxMinutes) * 100

              return (
                <div key={member.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-foreground">
                      {member.name}
                    </span>
                    <span className="text-sm font-semibold text-primary tabular-nums">
                      {formatMinutes(totalMinutes)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
