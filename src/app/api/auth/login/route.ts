import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/firebase-admin";
import { comparePassword } from "@/lib/auth";
import { createToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import type { User } from "@/types/auth.types";

const loginSchema = z.object({
  loginKey: z
    .string()
    .min(1, "팀 코드를 입력해주세요")
    .regex(/^team-.+-.+$/, "올바른 팀 코드를 입력해주세요"),
});

// loginKey 형식: team-[팀이름]-[비밀번호]
// 팀이름에 하이픈이 포함될 수 있어서 마지막 세그먼트만 비밀번호로 처리
function parseTeamName(loginKey: string): string | null {
  const parts = loginKey.split("-");
  // 최소 "team", teamName, password → 3개 이상
  if (parts.length < 3 || parts[0] !== "team") return null;
  return parts.slice(1, -1).join("-");
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "올바른 팀 코드를 입력해주세요" },
        { status: 400 }
      );
    }

    const { loginKey } = parsed.data;
    const teamName = parseTeamName(loginKey);

    if (!teamName) {
      return NextResponse.json(
        { error: "올바른 팀 코드를 입력해주세요" },
        { status: 401 }
      );
    }

    // teamName으로 후보 유저 조회 (bcrypt 비교 범위 최소화)
    const db = getDb();
    const snapshot = await db
      .collection("users")
      .where("teamName", "==", teamName)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "올바른 팀 코드를 입력해주세요" },
        { status: 401 }
      );
    }

    // 각 유저의 loginKey 해시와 비교
    let matchedUser: User | null = null;
    for (const doc of snapshot.docs) {
      const userData = doc.data() as Omit<User, "id">;
      const isMatch = await comparePassword(loginKey, userData.loginKey);
      if (isMatch) {
        matchedUser = { ...userData, id: doc.id };
        break;
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: "올바른 팀 코드를 입력해주세요" },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: matchedUser.id,
      userName: matchedUser.name,
      teamId: matchedUser.teamId,
      teamName: matchedUser.teamName,
      role: matchedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        name: matchedUser.name,
        teamId: matchedUser.teamId,
        teamName: matchedUser.teamName,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
