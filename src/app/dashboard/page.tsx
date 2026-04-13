"use client"

import { useState } from "react"
import { TopBar } from "@/components/dashboard/top-bar"
import { AttendanceAction } from "@/components/dashboard/attendance-action"
import { CalendarGrid } from "@/components/dashboard/calendar-grid"
import { StatsSidebar } from "@/components/dashboard/stats-sidebar"
import { EditModal } from "@/components/dashboard/edit-modal"

// Mock data types
export interface TeamMember {
  id: string
  name: string
}

export interface AttendanceRecord {
  date: string // YYYY-MM-DD
  memberId: string
  checkIn: string | null // HH:mm
  checkOut: string | null // HH:mm
}

export type AttendanceStatus = "not-checked-in" | "checked-in" | "checked-out"

// Mock data
const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "정상영" },
  { id: "2", name: "김민수" },
  { id: "3", name: "이지현" },
]

const mockCurrentUser: TeamMember = mockTeamMembers[0]

const mockAttendanceRecords: AttendanceRecord[] = [
  { date: "2026-04-01", memberId: "1", checkIn: "09:30", checkOut: "18:45" },
  { date: "2026-04-01", memberId: "2", checkIn: "10:00", checkOut: "19:00" },
  { date: "2026-04-01", memberId: "3", checkIn: "09:15", checkOut: "18:30" },
  { date: "2026-04-02", memberId: "1", checkIn: "09:45", checkOut: "19:15" },
  { date: "2026-04-02", memberId: "2", checkIn: "10:30", checkOut: "19:30" },
  { date: "2026-04-02", memberId: "3", checkIn: "09:00", checkOut: "18:00" },
  { date: "2026-04-03", memberId: "1", checkIn: "10:00", checkOut: "19:00" },
  { date: "2026-04-03", memberId: "2", checkIn: "09:30", checkOut: "18:30" },
  { date: "2026-04-03", memberId: "3", checkIn: "10:15", checkOut: "19:15" },
  { date: "2026-04-07", memberId: "1", checkIn: "09:00", checkOut: "18:30" },
  { date: "2026-04-07", memberId: "2", checkIn: "09:45", checkOut: "19:00" },
  { date: "2026-04-07", memberId: "3", checkIn: "10:00", checkOut: "18:45" },
  { date: "2026-04-08", memberId: "1", checkIn: "09:30", checkOut: "19:00" },
  { date: "2026-04-08", memberId: "2", checkIn: "10:00", checkOut: "19:30" },
  { date: "2026-04-08", memberId: "3", checkIn: "09:15", checkOut: "18:15" },
  { date: "2026-04-09", memberId: "1", checkIn: "10:00", checkOut: "19:15" },
  { date: "2026-04-09", memberId: "2", checkIn: "09:30", checkOut: "18:45" },
  { date: "2026-04-09", memberId: "3", checkIn: "09:45", checkOut: "19:00" },
  { date: "2026-04-10", memberId: "1", checkIn: "09:15", checkOut: "18:30" },
  { date: "2026-04-10", memberId: "2", checkIn: "10:15", checkOut: "19:15" },
  { date: "2026-04-10", memberId: "3", checkIn: "09:30", checkOut: "18:45" },
  { date: "2026-04-11", memberId: "1", checkIn: "09:45", checkOut: "19:00" },
  { date: "2026-04-11", memberId: "2", checkIn: "09:00", checkOut: "18:30" },
  { date: "2026-04-11", memberId: "3", checkIn: "10:00", checkOut: "19:30" },
  { date: "2026-04-14", memberId: "1", checkIn: "10:00", checkOut: null },
  { date: "2026-04-14", memberId: "2", checkIn: "09:30", checkOut: null },
  { date: "2026-04-14", memberId: "3", checkIn: null, checkOut: null },
]

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 14)) // April 14, 2026
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords)
  const [editingRecord, setEditingRecord] = useState<{
    date: string
    memberId: string
    checkIn: string | null
    checkOut: string | null
  } | null>(null)

  const teamName = "수관기피"

  // Get today's date string
  const today = "2026-04-14"

  // Find current user's today record
  const todayRecord = attendanceRecords.find(
    (r) => r.date === today && r.memberId === mockCurrentUser.id
  )

  // Determine attendance status
  const getAttendanceStatus = (): AttendanceStatus => {
    if (!todayRecord || !todayRecord.checkIn) return "not-checked-in"
    if (todayRecord.checkIn && !todayRecord.checkOut) return "checked-in"
    return "checked-out"
  }

  const handleCheckIn = () => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    if (todayRecord) {
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.date === today && r.memberId === mockCurrentUser.id
            ? { ...r, checkIn: timeStr }
            : r
        )
      )
    } else {
      setAttendanceRecords((prev) => [
        ...prev,
        { date: today, memberId: mockCurrentUser.id, checkIn: timeStr, checkOut: null },
      ])
    }
  }

  const handleCheckOut = () => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.date === today && r.memberId === mockCurrentUser.id
          ? { ...r, checkOut: timeStr }
          : r
      )
    )
  }

  const handleEditRecord = (date: string, memberId: string) => {
    const record = attendanceRecords.find(
      (r) => r.date === date && r.memberId === memberId
    )
    setEditingRecord({
      date,
      memberId,
      checkIn: record?.checkIn || null,
      checkOut: record?.checkOut || null,
    })
  }

  const handleSaveEdit = (checkIn: string | null, checkOut: string | null) => {
    if (!editingRecord) return

    const existingRecord = attendanceRecords.find(
      (r) => r.date === editingRecord.date && r.memberId === editingRecord.memberId
    )

    if (existingRecord) {
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.date === editingRecord.date && r.memberId === editingRecord.memberId
            ? { ...r, checkIn, checkOut }
            : r
        )
      )
    } else {
      setAttendanceRecords((prev) => [
        ...prev,
        { date: editingRecord.date, memberId: editingRecord.memberId, checkIn, checkOut },
      ])
    }
    setEditingRecord(null)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        teamName={teamName}
        year={currentDate.getFullYear()}
        month={currentDate.getMonth() + 1}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <AttendanceAction
          currentUserName={mockCurrentUser.name}
          todayRecord={null}
        />

        <div className="mt-8 flex gap-6">
          <div className="flex-1 min-w-0">
            <CalendarGrid
              currentDate={currentDate}
              teamMembers={mockTeamMembers}
              attendanceRecords={attendanceRecords}
              currentUserId={mockCurrentUser.id}
              onEditRecord={handleEditRecord}
            />
          </div>
          <div className="w-72 shrink-0">
            <StatsSidebar
              currentDate={currentDate}
              teamMembers={mockTeamMembers}
              attendanceRecords={attendanceRecords}
            />
          </div>
        </div>
      </main>

      <EditModal
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        record={editingRecord}
        onSave={handleSaveEdit}
      />
    </div>
  )
}
