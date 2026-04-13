import { getDb } from "@/lib/firebase-admin"
import { getAllTeams } from "@/lib/firestore/teams"
import { getAllUsers } from "@/lib/firestore/users"
import type { AttendanceRecord } from "@/types/attendance.types"

const COLLECTION = "attendance"

export interface DashboardStats {
  totalTeams: number
  totalUsers: number
  monthTotalMinutes: number
  avgDailyMinutes: number
}

export interface TeamRankItem {
  teamId: string
  teamName: string
  totalMinutes: number
}

export interface UserRankItem {
  userId: string
  userName: string
  teamName: string
  totalMinutes: number
}

function docToAttendanceRecord(
  id: string,
  data: FirebaseFirestore.DocumentData
): AttendanceRecord {
  return {
    id,
    userId: data.userId as string,
    userName: data.userName as string,
    teamId: data.teamId as string,
    date: data.date as string,
    checkInTime: data.checkInTime as string,
    checkOutTime: (data.checkOutTime as string | null | undefined) ?? null,
    totalMinutes: (data.totalMinutes as number | null | undefined) ?? null,
    state: data.state as AttendanceRecord["state"],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  }
}

async function getMonthAttendance(year: number, month: number): Promise<AttendanceRecord[]> {
  const db = getDb()
  const from = `${year}-${String(month).padStart(2, "0")}-01`
  const to = `${year}-${String(month).padStart(2, "0")}-31`

  const snap = await db
    .collection(COLLECTION)
    .where("date", ">=", from)
    .where("date", "<=", to)
    .orderBy("date", "asc")
    .get()

  return snap.docs.map((doc) => docToAttendanceRecord(doc.id, doc.data()))
}

export async function getDashboardStats(
  year: number,
  month: number
): Promise<DashboardStats> {
  const [teams, users, records] = await Promise.all([
    getAllTeams(),
    getAllUsers(),
    getMonthAttendance(year, month),
  ])

  const completedRecords = records.filter(
    (record) => typeof record.totalMinutes === "number" && record.totalMinutes >= 0
  )

  const monthTotalMinutes = completedRecords.reduce(
    (sum, record) => sum + (record.totalMinutes ?? 0),
    0
  )

  const distinctDates = new Set(completedRecords.map((record) => record.date))
  const avgDailyMinutes = distinctDates.size > 0 ? Math.round(monthTotalMinutes / distinctDates.size) : 0

  return {
    totalTeams: teams.length,
    totalUsers: users.length,
    monthTotalMinutes,
    avgDailyMinutes,
  }
}

export async function getTeamRanking(
  year: number,
  month: number
): Promise<TeamRankItem[]> {
  const [teams, records] = await Promise.all([
    getAllTeams(),
    getMonthAttendance(year, month),
  ])

  const teamNameById = new Map(teams.map((team) => [team.id, team.name]))
  const totals = new Map<string, number>()

  for (const record of records) {
    if (typeof record.totalMinutes !== "number" || record.totalMinutes < 0) {
      continue
    }

    totals.set(record.teamId, (totals.get(record.teamId) ?? 0) + record.totalMinutes)
  }

  return Array.from(totals.entries())
    .map(([teamId, totalMinutes]) => ({
      teamId,
      teamName: teamNameById.get(teamId) ?? "알 수 없는 팀",
      totalMinutes,
    }))
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
}

export async function getUserRanking(
  year: number,
  month: number
): Promise<UserRankItem[]> {
  const [users, records] = await Promise.all([
    getAllUsers(),
    getMonthAttendance(year, month),
  ])

  const userMetaById = new Map(
    users.map((user) => [
      user.id,
      {
        userName: user.name,
        teamName: user.teamName,
      },
    ])
  )
  const totals = new Map<string, number>()

  for (const record of records) {
    if (typeof record.totalMinutes !== "number" || record.totalMinutes < 0) {
      continue
    }

    totals.set(record.userId, (totals.get(record.userId) ?? 0) + record.totalMinutes)
  }

  return Array.from(totals.entries())
    .map(([userId, totalMinutes]) => {
      const meta = userMetaById.get(userId)

      return {
        userId,
        userName: meta?.userName ?? "알 수 없는 유저",
        teamName: meta?.teamName ?? "알 수 없는 팀",
        totalMinutes,
      }
    })
    .sort((a, b) => b.totalMinutes - a.totalMinutes)
}
