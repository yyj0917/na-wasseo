import { StatsCards } from "@/components/admin/stats-cards"
import { TeamRanking } from "@/components/admin/team-ranking"
import { UserRanking } from "@/components/admin/user-ranking"
import {
  getDashboardStats,
  getTeamRanking,
  getUserRanking,
} from "@/lib/firestore/stats"

export default async function AdminDashboardPage() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const [stats, teamRanking, userRanking] = await Promise.all([
    getDashboardStats(year, month),
    getTeamRanking(year, month),
    getUserRanking(year, month),
  ])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">대시보드</h1>
        <p className="text-muted-foreground mt-1">전체 출퇴근 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamRanking ranking={teamRanking} />
        <UserRanking ranking={userRanking} />
      </div>
    </div>
  )
}
