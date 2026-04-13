import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Medal } from "lucide-react"
import type { UserRankItem } from "@/lib/firestore/stats"

interface Props {
  ranking: UserRankItem[]
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

export function UserRanking({ ranking }: Props) {
  return (
    <Card className="border border-border/50 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Medal className="h-5 w-5 text-primary" />
          유저 랭킹 (이번 달)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">집계된 유저 데이터가 없습니다</div>
        ) : (
          <div className="space-y-3">
            {ranking.map((user, index) => (
              <div
                key={user.userId}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadgeColor(index + 1)}`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-foreground">{user.userName}</span>
                  <span className="text-sm text-muted-foreground ml-2">({user.teamName})</span>
                </div>
                <span className="font-semibold text-foreground">{Math.floor(user.totalMinutes / 60)}h</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
