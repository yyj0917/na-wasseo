import { NextResponse } from "next/server"
import { z } from "zod"
import { createToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session"

const schema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요"),
})

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "비밀번호를 입력해주세요" },
        { status: 400 }
      )
    }

    const { password } = parsed.data
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json(
        { error: "올바른 비밀번호를 입력해주세요" },
        { status: 401 }
      )
    }

    const token = await createToken({
      userId: "admin",
      userName: "어드민",
      teamId: "",
      teamName: "",
      role: "admin",
    })

    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    })

    return response
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
