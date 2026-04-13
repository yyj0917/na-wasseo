"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  record: {
    date: string
    memberId: string
    checkIn: string | null
    checkOut: string | null
  } | null
  onSave: (checkIn: string | null, checkOut: string | null) => void
}

export function EditModal({ isOpen, onClose, record, onSave }: EditModalProps) {
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")

  useEffect(() => {
    if (record) {
      setCheckIn(record.checkIn || "")
      setCheckOut(record.checkOut || "")
    }
  }, [record])

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-")
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`
  }

  const handleSave = () => {
    onSave(checkIn || null, checkOut || null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">출퇴근 시간 수정</DialogTitle>
        </DialogHeader>

        {record && (
          <div className="py-4 space-y-6">
            {/* Date Display */}
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">날짜</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDateDisplay(record.date)}
              </p>
            </div>

            {/* Time Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check-in" className="text-sm font-medium">
                  출근 시간
                </Label>
                <Input
                  id="check-in"
                  type="time"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="h-11 rounded-lg text-center"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="check-out" className="text-sm font-medium">
                  퇴근 시간
                </Label>
                <Input
                  id="check-out"
                  type="time"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="h-11 rounded-lg text-center"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-lg"
          >
            취소
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          >
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
