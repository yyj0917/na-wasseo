"use client"

import { useEffect, useState } from "react"
import type { AdminTeam } from "@/hooks/use-admin-users"
import type { AttendanceState } from "@/types/attendance.types"

export interface AdminAttendanceRecord {
  id: string
  userId: string
  userName: string
  teamId: string
  date: string
  checkInTime: string
  checkOutTime: string | null
  totalMinutes: number | null
  state: AttendanceState
}

export interface AttendanceEditDraft {
  id: string
  date: string
  userName: string
  checkInTime: string
  checkOutTime: string | null
}

export function formatDuration(totalMinutes: number | null): string {
  if (totalMinutes === null) {
    return "-"
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`
}

export function useAdminAttendance() {
  const today = new Date()
  const [teams, setTeams] = useState<AdminTeam[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [year, setYear] = useState(String(today.getFullYear()))
  const [month, setMonth] = useState(String(today.getMonth() + 1))
  const [records, setRecords] = useState<AdminAttendanceRecord[]>([])
  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await fetch("/api/teams")
        if (!res.ok) {
          throw new Error("팀 목록을 불러오지 못했습니다")
        }

        const data = (await res.json()) as AdminTeam[]
        setTeams(data)
        if (data.length > 0) {
          setSelectedTeamId((current) => current || data[0].id)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "팀 목록을 불러오지 못했습니다")
      } finally {
        setIsLoadingTeams(false)
      }
    }

    void fetchTeams()
  }, [])

  const fetchRecords = async () => {
    if (!selectedTeamId) {
      setError("조회할 팀을 선택해주세요")
      return
    }

    setIsLoadingRecords(true)
    setError("")

    try {
      const query = new URLSearchParams({ teamId: selectedTeamId, year, month })
      const res = await fetch(`/api/admin/attendance?${query.toString()}`)
      const data = (await res.json()) as AdminAttendanceRecord[] | { error?: string }

      if (!res.ok) {
        throw new Error(
          "error" in data ? data.error ?? "출퇴근 기록을 불러오지 못했습니다" : "출퇴근 기록을 불러오지 못했습니다"
        )
      }

      setRecords(data as AdminAttendanceRecord[])
    } catch (err) {
      setRecords([])
      setError(err instanceof Error ? err.message : "출퇴근 기록을 불러오지 못했습니다")
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const saveRecord = async (draft: AttendanceEditDraft) => {
    const res = await fetch(`/api/admin/attendance/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        checkInTime: draft.checkInTime,
        checkOutTime: draft.checkOutTime || null,
      }),
    })
    const data = (await res.json()) as AdminAttendanceRecord | { error?: string }

    if (!res.ok) {
      throw new Error("error" in data ? data.error ?? "수정에 실패했습니다" : "수정에 실패했습니다")
    }

    await fetchRecords()
  }

  return {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    year,
    setYear,
    month,
    setMonth,
    records,
    isLoadingTeams,
    isLoadingRecords,
    error,
    fetchRecords,
    saveRecord,
  }
}
