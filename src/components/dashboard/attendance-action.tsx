"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  checkInAction,
  checkOutAction,
  markDoneAction,
} from "@/app/(dashboard)/team/actions";
import type { CalendarRecord } from "@/types/calendar.types";

interface AttendanceActionProps {
  currentUserName: string;
  todayRecord: CalendarRecord | null;
}

export function AttendanceAction({
  currentUserName,
  todayRecord,
}: AttendanceActionProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const state = todayRecord?.state ?? null;

  const handleCheckIn = () => {
    startTransition(async () => {
      await checkInAction();
    });
  };

  const handleCheckOut = () => {
    startTransition(async () => {
      await checkOutAction();
    });
  };

  const handleMarkDone = () => {
    alert("오늘 하루도 고생하셨습니다!");
    startTransition(async () => {
      await markDoneAction();
    });
  };

  return (
    <Card className="p-6 shadow-sm border border-border/50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Greeting */}
          <div>
            <p className="text-lg font-medium text-foreground">
              안녕하세요, <span className="font-bold">{currentUserName}</span>님!
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              오늘 출근: {todayRecord?.checkInTime ?? "-"} | 퇴근:{" "}
              {todayRecord?.checkOutTime ?? "-"}
            </p>
          </div>

          {/* Current Time */}
          <div className="text-2xl font-mono font-bold text-muted-foreground tabular-nums">
            {currentTime}
          </div>
        </div>

        {/* Attendance Button */}
        <div className="flex items-center gap-4">
          {(state === null || state === undefined) && (
            <Button
              onClick={handleCheckIn}
              disabled={isPending}
              size="lg"
              className="h-14 px-10 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {isPending ? "처리 중..." : "출석하기"}
            </Button>
          )}

          {state === "checked_in" && (
            <Button
              onClick={handleCheckOut}
              disabled={isPending}
              size="lg"
              className="h-14 px-10 text-lg font-bold bg-orange-400 hover:bg-orange-500 text-white rounded-lg shadow-md transition-all hover:scale-[1.02] disabled:opacity-60"
            >
              {isPending ? "처리 중..." : "퇴근하기"}
            </Button>
          )}

          {state === "checked_out" && (
            <div className="relative">
              <Button
                onClick={handleMarkDone}
                disabled={isPending}
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 disabled:opacity-60"
              >
                고생하셨습니다!
              </Button>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary/60 animate-pulse" />
              <div
                className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-green-500/60 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          )}

          {state === "done" && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <span className="text-2xl">🎉</span>
              <span className="font-medium">오늘도 수고하셨습니다!</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
