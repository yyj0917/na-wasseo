"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MonthNavigationProps {
  year: number;
  month: number;
  basePath?: string;
}

export function MonthNavigation({ year, month, basePath = "/team" }: MonthNavigationProps) {
  const router = useRouter();

  const navigate = (direction: "prev" | "next") => {
    let y = year;
    let m = month;
    if (direction === "prev") {
      m -= 1;
      if (m < 1) { m = 12; y -= 1; }
    } else {
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
    router.push(`${basePath}?month=${y}-${String(m).padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => navigate("prev")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium min-w-[100px] text-center">
        {year}년 {month}월
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => navigate("next")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
