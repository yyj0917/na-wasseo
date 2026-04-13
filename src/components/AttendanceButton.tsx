"use client";

import { useOptimistic, useTransition, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { AttendanceState } from "@/types/attendance.types";

interface AttendanceButtonProps {
  userName: string;
  initialState: AttendanceState | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInAction: () => Promise<void>;
  checkOutAction: () => Promise<void>;
}

export function AttendanceButton({
  userName,
  initialState,
  checkInTime,
  checkOutTime,
  checkInAction,
  checkOutAction,
}: AttendanceButtonProps) {
  const [currentTime, setCurrentTime] = useState("");
  // "고생하셨습니다!" 클릭 후 done 처리 (서버 액션 불필요)
  const [localDone, setLocalDone] = useState(initialState === "done");

  const [isPending, startTransition] = useTransition();

  const [optimisticState, applyOptimistic] = useOptimistic(
    initialState,
    (_current, next: AttendanceState) => next
  );

  // 1초 간격 실시간 시계
  useEffect(() => {
    const update = () =>
      setCurrentTime(
        new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const handleCheckIn = () => {
    startTransition(async () => {
      applyOptimistic("checked_in");
      await checkInAction();
    });
  };

  const handleCheckOut = () => {
    startTransition(async () => {
      applyOptimistic("checked_out");
      await checkOutAction();
    });
  };

  const handleDone = () => {
    alert("오늘 하루도 고생하셨습니다!");
    setLocalDone(true);
  };

  // 렌더링 기준 state: 로컬 done > optimistic > 서버 초기값
  const displayState: AttendanceState | null = localDone
    ? "done"
    : optimisticState;

  return (
    <Card className="p-6 shadow-sm border border-border/50 rounded-xl">
      <div className="flex items-center justify-between">
        {/* 왼쪽: 인사 + 출퇴근 요약 + 시계 */}
        <div className="flex items-center gap-6">
          <div>
            <p className="text-lg font-medium text-foreground">
              안녕하세요, <span className="font-bold">{userName}</span>님!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              오늘 출근: {checkInTime ?? "-"} | 퇴근: {checkOutTime ?? "-"}
            </p>
          </div>
          <div className="text-2xl font-mono font-bold text-muted-foreground tabular-nums">
            {currentTime}
          </div>
        </div>

        {/* 오른쪽: 상태별 버튼 */}
        <div className="flex items-center gap-4">
          {/* 출석하기 */}
          {(displayState === null || displayState === undefined) && (
            <Button
              onClick={handleCheckIn}
              disabled={isPending}
              size="lg"
              className="h-14 px-10 text-lg font-bold bg-success hover:bg-success/90 text-success-foreground rounded-lg shadow-md transition-all hover:scale-[1.02]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-5 w-5" />
                  처리 중...
                </span>
              ) : (
                "출석하기"
              )}
            </Button>
          )}

          {/* 퇴근하기 */}
          {displayState === "checked_in" && (
            <Button
              onClick={handleCheckOut}
              disabled={isPending}
              size="lg"
              className="h-14 px-10 text-lg font-bold bg-warning hover:bg-warning/90 text-warning-foreground rounded-lg shadow-md transition-all hover:scale-[1.02]"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-5 w-5" />
                  처리 중...
                </span>
              ) : (
                "퇴근하기"
              )}
            </Button>
          )}

          {/* 고생하셨습니다! — checked_out: 클릭 가능 / done: disabled */}
          {(displayState === "checked_out" || displayState === "done") && (
            <div className="relative">
              <Button
                onClick={displayState === "checked_out" ? handleDone : undefined}
                disabled={displayState === "done"}
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-muted text-muted-foreground rounded-lg cursor-default"
              >
                고생하셨습니다!
              </Button>
              {/* 원본 장식 유지 */}
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
              <div
                className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-success/60 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute top-1/2 -right-2 w-2 h-2 rounded-full bg-warning/60 animate-pulse"
                style={{ animationDelay: "0.25s" }}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
