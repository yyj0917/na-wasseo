"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ClipboardList, Pencil, Search } from "lucide-react"
import {
  formatDuration,
  useAdminAttendance,
  type AdminAttendanceRecord,
  type AttendanceEditDraft,
} from "@/hooks/use-admin-attendance"

export default function AttendancePage() {
  const {
    teams,
    selectedTeamId,
    setSelectedTeamId,
    year,
    setYear,
    month,
    setMonth,
    records,
    isLoadingTeams,
    isLoadingRecords,
    error,
    fetchRecords,
    saveRecord,
  } = useAdminAttendance()

  const [editRecord, setEditRecord] = useState<AttendanceEditDraft | null>(null)
  const [editCheckIn, setEditCheckIn] = useState("")
  const [editCheckOut, setEditCheckOut] = useState("")
  const [editError, setEditError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const openEditModal = (record: AdminAttendanceRecord) => {
    setEditRecord({
      id: record.id,
      date: record.date,
      userName: record.userName,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
    })
    setEditCheckIn(record.checkInTime)
    setEditCheckOut(record.checkOutTime ?? "")
    setEditError("")
  }

  const handleSaveEdit = async () => {
    if (!editRecord) {
      return
    }

    setIsSaving(true)
    setEditError("")

    try {
      await saveRecord({
        ...editRecord,
        checkInTime: editCheckIn,
        checkOutTime: editCheckOut || null,
      })
      setEditRecord(null)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "수정에 실패했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">출퇴근 관리</h1>
        <p className="mt-1 text-muted-foreground">출퇴근 기록을 조회하고 수정하세요</p>
      </div>

      <Card className="rounded-xl border border-border/50 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>팀 선택</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId} disabled={isLoadingTeams || teams.length === 0}>
                <SelectTrigger className="w-48 rounded-lg">
                  <SelectValue placeholder="팀을 선택하세요" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendance-year">연도</Label>
              <Input id="attendance-year" type="number" min="2000" max="2100" value={year} onChange={(e) => setYear(e.target.value)} className="w-32 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label>월</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-32 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {Array.from({ length: 12 }, (_, index) => {
                    const value = String(index + 1)
                    return (
                      <SelectItem key={value} value={value}>
                        {value}월
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="rounded-lg" onClick={() => void fetchRecords()} disabled={isLoadingTeams || isLoadingRecords || !selectedTeamId}>
              <Search className="mr-2 h-4 w-4" />검색
            </Button>
          </div>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-primary" />출퇴근 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRecords ? (
            <div className="py-8 text-center text-muted-foreground">불러오는 중...</div>
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">조회된 출퇴근 기록이 없습니다</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>날짜</TableHead>
                  <TableHead>이름</TableHead>
                  <TableHead className="text-center">출근</TableHead>
                  <TableHead className="text-center">퇴근</TableHead>
                  <TableHead className="text-center">상태</TableHead>
                  <TableHead className="text-center">총 시간</TableHead>
                  <TableHead className="text-right">수정</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>{record.userName}</TableCell>
                    <TableCell className="text-center"><span className="font-medium text-success">{record.checkInTime}</span></TableCell>
                    <TableCell className="text-center"><span className="font-medium text-warning">{record.checkOutTime ?? "-"}</span></TableCell>
                    <TableCell className="text-center">{record.state}</TableCell>
                    <TableCell className="text-center font-medium">{formatDuration(record.totalMinutes)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(record)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editRecord} onOpenChange={(open) => { if (!open) setEditRecord(null) }}>
        <DialogContent className="rounded-xl">
          <DialogHeader>
            <DialogTitle>출퇴근 시간 수정</DialogTitle>
          </DialogHeader>
          {editRecord && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 rounded-lg bg-muted p-3">
                <span className="text-sm text-muted-foreground">날짜:</span>
                <span className="font-medium">{editRecord.date}</span>
                <span className="ml-4 text-sm text-muted-foreground">이름:</span>
                <span className="font-medium">{editRecord.userName}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-checkin">출근 시간</Label>
                  <Input id="edit-checkin" type="time" value={editCheckIn} onChange={(e) => setEditCheckIn(e.target.value)} className="rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-checkout">퇴근 시간</Label>
                  <Input id="edit-checkout" type="time" value={editCheckOut} onChange={(e) => setEditCheckOut(e.target.value)} className="rounded-lg" />
                </div>
              </div>
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditRecord(null)} className="rounded-lg">취소</Button>
                <Button onClick={() => void handleSaveEdit()} disabled={!editCheckIn || isSaving} className="rounded-lg bg-primary hover:bg-primary/90">저장</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
