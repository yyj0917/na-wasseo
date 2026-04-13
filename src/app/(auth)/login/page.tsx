"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  loginKey: z
    .string()
    .min(1, "팀 코드를 입력해주세요")
    .regex(/^team-.+-.+$/, "형식: team-팀이름-비밀번호"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loginKey: data.loginKey }),
    });

    if (res.ok) {
      router.push("/team");
      router.refresh();
      return;
    }

    const json = (await res.json()) as { error?: string };
    setServerError(json.error ?? "올바른 팀 코드를 입력해주세요");
  };

  const errorMessage = errors.loginKey?.message ?? serverError;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        <Card className="w-full shadow-sm border border-border/50 rounded-xl bg-card">
          <CardContent className="pt-10 pb-8 px-8 rounded-xl">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                나 왔어! <span className="inline-block animate-wave">👋</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                소마 팀 출퇴근 기록 서비스
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Input
                  {...register("loginKey")}
                  type="text"
                  placeholder="team-팀이름-비밀번호"
                  className="h-12 text-center bg-muted border border-border/50 rounded-lg placeholder:text-muted-foreground/70 focus-visible:ring-primary focus-visible:ring-2 focus-visible:border-primary"
                  disabled={isSubmitting}
                  autoComplete="off"
                  spellCheck={false}
                />
                {errorMessage && (
                  <p className="text-destructive text-sm text-center font-medium">
                    {errorMessage}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="h-4 w-4" />
                    확인 중...
                  </span>
                ) : (
                  "입장하기"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-xs text-muted-foreground">
          SW마에스트로 출퇴근 관리
        </p>
      </div>
    </main>
  );
}
