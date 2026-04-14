"use client";

import { Badge } from "@/components/ui/badge";
import { MonthNavigation } from "@/components/MonthNavigation";

interface MentorHeaderProps {
  teamName: string;
  year: number;
  month: number;
}

export function MentorHeader({ teamName, year, month }: MentorHeaderProps) {
  return (
    <header className="bg-card border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">
            나 왔어!{" "}
            <span className="animate-wave inline-block">👋</span>
          </h1>
        </div>

        {/* Center: Team Name */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground"
          >
            팀 {teamName}
          </Badge>
        </div>

        {/* Right: Month Navigation only (no logout) */}
        <MonthNavigation
          year={year}
          month={month}
          basePath={`/mentor/${encodeURIComponent(teamName)}`}
        />
      </div>
    </header>
  );
}
