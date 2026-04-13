"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Copy, Check } from "lucide-react"
import type { AdminTeam } from "@/hooks/use-admin-users"

interface Props {
  teams: AdminTeam[]
  onCreate: (name: string, teamId: string, teamName: string) => Promise<string>
}

export function CreateUserDialog({ teams, onCreate }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [teamId, setTeamId] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginKey, setLoginKey] = useState("")
  const [copied, setCopied] = useState(false)

  const selectedTeam = teams.find((t) => t.id === teamId)

  const handleSubmit = async () => {
    if (!name.trim() || !teamId || !selectedTeam) return
    setError("")
    setIsSubmitting(true)
    try {
      const key = await onCreate(name.trim(), teamId, selectedTeam.name)
      setLoginKey(key)
    } catch (err) {
      setError(err instanceof Error ? err.message : "유저 생성에 실패했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setName("")
    setTeamId("")
    setError("")
    setLoginKey("")
    setCopied(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(loginKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); else setIsOpen(true) }}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          새 유저 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle>새 유저 등록</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {loginKey ? (
            <>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-1">유저가 등록되었습니다!</p>
                <p className="text-xs text-green-700 mb-3">
                  아래 로그인 키를 유저에게 전달하세요. 이 키는 다시 확인할 수 없습니다.
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border break-all">
                    {loginKey}
                  </code>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => void handleCopy()}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleClose} className="rounded-lg">닫기</Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="user-name">이름</Label>
                <Input
                  id="user-name"
                  placeholder="이름을 입력하세요"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label>팀 선택</Label>
                <Select value={teamId} onValueChange={setTeamId}>
                  <SelectTrigger className="rounded-lg">
                    <SelectValue placeholder="팀을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={handleClose} className="rounded-lg">취소</Button>
                <Button
                  onClick={() => void handleSubmit()}
                  disabled={!name.trim() || !teamId || isSubmitting}
                  className="bg-primary hover:bg-primary/90 rounded-lg"
                >
                  등록하기
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
