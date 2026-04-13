"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { MoreHorizontal, UserCircle, Pencil, Trash2, RefreshCw, Copy, Check } from "lucide-react"
import { useAdminUsers } from "@/hooks/use-admin-users"
import { CreateUserDialog } from "@/components/admin/create-user-dialog"
import type { AdminUser } from "@/hooks/use-admin-users"

export default function UsersPage() {
  const { teams, users, isLoading, createUser, updateUser, deleteUser, regenerateKey } =
    useAdminUsers()

  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editName, setEditName] = useState("")
  const [editError, setEditError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const [regenKey, setRegenKey] = useState<{ userName: string; key: string } | null>(null)
  const [regenCopied, setRegenCopied] = useState(false)

  const handleEdit = async () => {
    if (!editUser || !editName.trim()) return
    setEditError("")
    setIsEditing(true)
    try {
      await updateUser(editUser.id, editName.trim())
      setEditUser(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정에 실패했습니다")
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`"${user.name}" 유저를 삭제하시겠습니까?`)) return
    await deleteUser(user.id)
  }

  const handleRegenerateKey = async (user: AdminUser) => {
    if (!confirm(`"${user.name}"의 로그인 키를 재생성하시겠습니까?\n기존 키는 더 이상 사용할 수 없습니다.`)) return
    const key = await regenerateKey(user.id)
    if (key) {
      setRegenKey({ userName: user.name, key })
      setRegenCopied(false)
    }
  }

  const handleCopy = async (text: string, onDone: (v: boolean) => void) => {
    await navigator.clipboard.writeText(text)
    onDone(true)
    setTimeout(() => onDone(false), 2000)
  }

  const formatDate = (createdAt: AdminUser["createdAt"]) => {
    if (!createdAt) return "-"
    return new Date(createdAt._seconds * 1000).toLocaleDateString("ko-KR")
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">유저 관리</h1>
          <p className="text-muted-foreground mt-1">등록된 유저를 관리하세요</p>
        </div>
        <CreateUserDialog teams={teams} onCreate={createUser} />
      </div>

      <Card className="border border-border/50 shadow-sm rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCircle className="h-5 w-5 text-primary" />
            전체 유저 목록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">불러오는 중...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">등록된 유저가 없습니다</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이름</TableHead>
                  <TableHead>팀</TableHead>
                  <TableHead className="text-center">생성일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded-md text-sm">{user.teamName}</span>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-lg">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => { setEditUser(user); setEditName(user.name) }}>
                            <Pencil className="h-4 w-4 mr-2" />이름 수정
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => void handleRegenerateKey(user)}>
                            <RefreshCw className="h-4 w-4 mr-2" />키 재생성
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => void handleDelete(user)}>
                            <Trash2 className="h-4 w-4 mr-2" />삭제
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
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent className="rounded-xl">
          <DialogHeader><DialogTitle>이름 수정</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">이름</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void handleEdit() }}
                className="rounded-lg"
              />
              {editError && <p className="text-destructive text-sm">{editError}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditUser(null)} className="rounded-lg">취소</Button>
              <Button onClick={() => void handleEdit()} disabled={!editName.trim() || isEditing} className="bg-primary hover:bg-primary/90 rounded-lg">저장</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Regenerated Key Dialog */}
      <Dialog open={!!regenKey} onOpenChange={(open) => { if (!open) setRegenKey(null) }}>
        <DialogContent className="rounded-xl">
          <DialogHeader><DialogTitle>새 로그인 키</DialogTitle></DialogHeader>
          {regenKey && (
            <div className="space-y-4 pt-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm font-medium text-yellow-800 mb-1">{regenKey.userName}의 새 로그인 키</p>
                <p className="text-xs text-yellow-700 mb-3">이 키는 다시 확인할 수 없습니다. 유저에게 전달하세요.</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border break-all">{regenKey.key}</code>
                  <Button variant="outline" size="icon" className="shrink-0" onClick={() => void handleCopy(regenKey.key, setRegenCopied)}>
                    {regenCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setRegenKey(null)} className="rounded-lg">닫기</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
