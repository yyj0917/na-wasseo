import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import type { TeamRankItem } from "@/lib/firestore/stats"

interface Props {
  ranking: TeamRankItem[]
}

function getRankBadgeColor(rank: number) {
  switch (rank) {
    case 1:
      return "bg-yellow-500 text-white"
    case 2:
      return "bg-gray-400 text-white"
    case 3:
      return "bg-amber-600 text-white"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export function TeamRanking({ ranking }: Props) {
  const maxMinutes = ranking[0]?.totalMinutes ?? 1

  return (
    <Card className="border border-border/50 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          팀 랭킹 (이번 달)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">집계된 팀 데이터가 없습니다</div>
        ) : (
          <div className="space-y-4">
            {ranking.map((team, index) => (
              <div key={team.teamId} className="flex items-center gap-4">
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(index + 1)}`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">{team.teamName}</span>
                    <span className="text-sm text-muted-foreground">{Math.floor(team.totalMinutes / 60)}h</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(team.totalMinutes / maxMinutes) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
