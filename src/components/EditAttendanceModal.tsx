"use client";

import { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  updateAttendanceAction,
  deleteAttendanceAction,
  resetCheckOutAction,
  createAttendanceForDateAction,
} from "@/app/(dashboard)/team/actions";
import type { EditModalState } from "@/types/calendar.types";

interface EditAttendanceModalProps {
  state: EditModalState;
  onClose: () => void;
}

function formatDateDisplay(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
}

export function EditAttendanceModal({ state, onClose }: EditAttendanceModalProps) {
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditMode = state?.mode === "edit";
  const isCreateMode = state?.mode === "create";
  const record = isEditMode ? state.record : null;
  const activeDate = isEditMode ? state.record.date : isCreateMode ? state.date : null;

  useEffect(() => {
    if (isEditMode) {
      setCheckInTime(state.record.checkInTime ?? "");
      setCheckOutTime(state.record.checkOutTime ?? "");
    } else if (isCreateMode) {
      setCheckInTime("");
      setCheckOutTime("");
    }
    setError(null);
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!state) return;
    if (!checkInTime) {
      setError("출근 시간을 입력해주세요.");
      return;
    }
    setError(null);

    startTransition(async () => {
      if (isEditMode) {
        const result = await updateAttendanceAction(
          state.record.id,
          checkInTime,
          checkOutTime || null
        );
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      } else if (isCreateMode) {
        const result = await createAttendanceForDateAction(
          state.date,
          checkInTime,
          checkOutTime || null
        );
        if (result.success) {
          onClose();
        } else {
          setError(result.error);
        }
      }
    });
  };

  const handleResetCheckOut = () => {
    if (!record) return;
    startTransition(async () => {
      const result = await resetCheckOutAction(record.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  const handleDelete = () => {
    if (!record) return;
    startTransition(async () => {
      const result = await deleteAttendanceAction(record.id);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    });
  };

  const hasCheckOut = !!record?.checkOutTime;

  return (
    <Dialog open={!!state} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {isCreateMode ? "출퇴근 기록 추가" : "출퇴근 시간 수정"}
          </DialogTitle>
        </DialogHeader>

        {activeDate && (
          <div className="py-4 space-y-6">
            {/* 날짜 표시 */}
            <div className="text-center p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">날짜</p>
              <p className="text-lg font-semibold text-foreground">
                {formatDateDisplay(activeDate)}
              </p>
            </div>

            {/* 시간 입력 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="check-in" className="text-sm font-medium">
                  출근 시간
                </Label>
                <Input
                  id="check-in"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
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
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                  className="h-11 rounded-lg text-center"
                />
              </div>
            </div>

            {/* 취소/초기화 버튼 — edit 모드에서만 표시 */}
            {isEditMode && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">실수로 눌렀을 때</p>
                <div className="flex gap-2">
                  {hasCheckOut && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          className="flex-1 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                        >
                          퇴근 취소
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>퇴근을 취소할까요?</AlertDialogTitle>
                          <AlertDialogDescription>
                            퇴근 기록이 삭제되고 출근 상태로 돌아갑니다.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>아니요</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleResetCheckOut}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            퇴근 취소
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                      >
                        기록 삭제
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>기록을 삭제할까요?</AlertDialogTitle>
                        <AlertDialogDescription>
                          출퇴근 기록이 완전히 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>아니요</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          삭제
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="rounded-lg">
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          >
            {isPending ? "저장 중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
