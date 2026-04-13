"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Lock } from "lucide-react"

export function AdminLoginForm() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.refresh()
        return
      }

      const json = (await res.json()) as { error?: string }
      setError(json.error ?? "올바른 비밀번호를 입력해주세요")
    } catch {
      setError("서버 오류가 발생했습니다")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background">
      <div className="w-full max-w-[400px]">
        <Card className="w-full shadow-sm border border-border/50 rounded-xl bg-card">
          <CardContent className="pt-10 pb-8 px-8 rounded-xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">어드민 로그인</h1>
              <p className="text-muted-foreground text-sm">어드민 비밀번호를 입력해주세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-muted border border-border/50 rounded-lg"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {error && (
                  <p className="text-destructive text-sm text-center font-medium">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 rounded-lg"
                disabled={isLoading || !password}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    확인 중...
                  </span>
                ) : (
                  "입장"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
