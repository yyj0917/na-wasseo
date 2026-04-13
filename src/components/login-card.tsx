"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface LoginCardProps {
  teamCode: string
  onTeamCodeChange: (value: string) => void
  onSubmit: (e: React.FormEvent) => void
  error: string
  isLoading: boolean
}

export function LoginCard({
  teamCode,
  onTeamCodeChange,
  onSubmit,
  error,
  isLoading,
}: LoginCardProps) {
  return (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      <Card className="w-full shadow-sm border border-border/50 rounded-xl bg-card">
        <CardContent className="pt-10 pb-8 px-8 rounded-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
              나 왔어! <span className="inline-block animate-wave">👋</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              소마 팀 출퇴근 기록 서비스
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="team-팀이름-비밀번호"
                value={teamCode}
                onChange={(e) => onTeamCodeChange(e.target.value)}
                className="h-12 text-center bg-muted border border-border/50 rounded-lg placeholder:text-muted-foreground/70 focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary"
                disabled={isLoading}
              />
              {error && (
                <p className="text-destructive text-sm text-center font-medium">
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  확인 중...
                </span>
              ) : (
                "입장하기"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground">
        SW마에스트로 출퇴근 관리
      </p>
    </div>
  )
}
