"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Users, Pencil, Trash2 } from "lucide-react"

interface Team {
  id: string
  name: string
  createdAt: { _seconds: number } | null
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [createError, setCreateError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const [editTeam, setEditTeam] = useState<Team | null>(null)
  const [editName, setEditName] = useState("")
  const [editError, setEditError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams")
      if (res.ok) {
        const data = (await res.json()) as Team[]
        setTeams(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTeams()
  }, [fetchTeams])

  const handleCreate = async () => {
    if (!newTeamName.trim()) return
    setCreateError("")
    setIsCreating(true)
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName.trim() }),
      })
      if (res.ok) {
        setIsCreateOpen(false)
        setNewTeamName("")
        await fetchTeams()
      } else {
        const json = (await res.json()) as { error?: string }
        setCreateError(json.error ?? "팀 생성에 실패했습니다")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleEdit = async () => {
    if (!editTeam || !editName.trim()) return
    setEditError("")
    setIsEditing(true)
    try {
      const res = await fetch(`/api/teams/${editTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      })
      if (res.ok) {
        setEditTeam(null)
        await fetchTeams()
      } else {
        const json = (await res.json()) as { error?: string }
        setEditError(json.error ?? "수정에 실패했습니다")
      }
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("팀을 삭제하시겠습니까?")) return
    const res = await fetch(`/api/teams/${id}`, { method: "DELETE" })
    if (res.ok) {
      await fetchTeams()
    }
  }

  const formatDate = (createdAt: Team["createdAt"]) => {
    if (!createdAt) return "-"
    return new Date(createdAt._seconds * 1000).toLocaleDateString("ko-KR")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">팀 관리</h1>
          <p className="text-muted-foreground mt-1">등록된 팀을 관리하세요</p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              새 팀 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-xl">
            <DialogHeader>
              <DialogTitle>새 팀 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">팀 이름</Label>
                <Input
                  id="team-name"
                  placeholder="팀 이름을 입력하세요"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") void handleCreate() }}
                  className="rounded-lg"
                />
                {createError && (
                  <p className="text-destructive text-sm">{createError}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-lg">
                  취소
                </Button>
                <Button
                  onClick={() => void handleCreate()}
                  disabled={!newTeamName.trim() || isCreating}
                  className="bg-primary hover:bg-primary/90 rounded-lg"
                >
                  등록하기
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-border/50 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-primary" />
            전체 팀 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>
          ) : teams.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">등록된 팀이 없습니다</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>팀 이름</TableHead>
                  <TableHead className="text-center">생성일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => (
                  <TableRow key={team.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{team.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDate(team.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => { setEditTeam(team); setEditName(team.name) }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => void handleDelete(team.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editTeam} onOpenChange={(open) => { if (!open) setEditTeam(null) }}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>팀 이름 수정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">팀 이름</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleEdit() }}
                className="rounded-lg"
              />
              {editError && (
                <p className="text-destructive text-sm">{editError}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditTeam(null)} className="rounded-lg">
                취소
              </Button>
              <Button
                onClick={() => void handleEdit()}
                disabled={!editName.trim() || isEditing}
                className="bg-primary hover:bg-primary/90 rounded-lg"
              >
                저장
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
