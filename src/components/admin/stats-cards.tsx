import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCircle, Clock, BarChart3 } from "lucide-react"
import type { DashboardStats } from "@/lib/firestore/stats"

interface Props {
  stats: DashboardStats
}

function formatHours(totalMinutes: number): string {
  if (totalMinutes <= 0) {
    return "0h"
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

export function StatsCards({ stats }: Props) {
  const items = [
    {
      label: "전체 팀 수",
      value: String(stats.totalTeams),
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      label: "전체 유저 수",
      value: String(stats.totalUsers),
      icon: UserCircle,
      color: "bg-green-500/10 text-green-600",
    },
    {
      label: "이번 달 총 시간",
      value: formatHours(stats.monthTotalMinutes),
      icon: Clock,
      color: "bg-primary/10 text-primary",
    },
    {
      label: "평균 일 근무 시간",
      value: formatHours(stats.avgDailyMinutes),
      icon: BarChart3,
      color: "bg-purple-500/10 text-purple-600",
    },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((stat) => (
        <Card key={stat.label} className="border border-border/50 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
