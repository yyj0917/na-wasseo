"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MentorError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 운영 환경에서는 에러 리포팅 서비스로 전송
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          데이터를 불러오는 중 오류가 발생했습니다
        </h2>
        <p className="text-sm text-muted-foreground">
          잠시 후 다시 시도해 주세요.
        </p>
        <Button variant="outline" onClick={reset}>
          다시 시도
        </Button>
      </div>
    </div>
  );
}
