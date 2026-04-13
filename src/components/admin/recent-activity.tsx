import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, LogIn, LogOut } from "lucide-react"

const activities = [
  { id: 1, name: "정상영", team: "수관기피", type: "in", time: "10:00" },
  { id: 2, name: "김민수", team: "코드마스터", type: "in", time: "10:05" },
  { id: 3, name: "이지원", team: "수관기피", type: "out", time: "09:55" },
  { id: 4, name: "박서준", team: "빌더스", type: "in", time: "09:50" },
  { id: 5, name: "최유나", team: "AI혁신팀", type: "in", time: "09:45" },
  { id: 6, name: "한지민", team: "프론트엔드", type: "out", time: "09:40" },
]

export function RecentActivity() {
  return (
    <Card className="border border-border/50 shadow-sm rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          최근 활동
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center gap-4 py-2 border-b border-border/50 last:border-0"
            >
              <div
                className={`p-2 rounded-full ${
                  activity.type === "in"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {activity.type === "in" ? (
                  <LogIn className="h-4 w-4" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-medium text-foreground">{activity.name}</span>
                <span className="text-muted-foreground ml-1">({activity.team})</span>
                <span
                  className={`ml-2 text-sm font-medium ${
                    activity.type === "in" ? "text-success" : "text-warning"
                  }`}
                >
                  {activity.type === "in" ? "출근" : "퇴근"}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{activity.time}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
