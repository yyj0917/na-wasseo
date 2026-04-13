import { NextResponse } from "next/server"
import { z } from "zod"
import { getAllUsers, createUser } from "@/lib/firestore/users"
import { requireAdmin } from "@/lib/admin-guard"

export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get("teamId") ?? undefined
    const users = await getAllUsers(teamId)
    // loginKey(bcrypt 해시)는 클라이언트에 노출하지 않음
    const safeUsers = users.map(({ loginKey: _lk, ...rest }) => rest)
    return NextResponse.json(safeUsers)
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요").max(50),
  teamId: z.string().min(1, "팀을 선택해주세요"),
  teamName: z.string().min(1),
})

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "입력값을 확인해주세요" }, { status: 400 })
    }
    const { user, rawLoginKey } = await createUser(parsed.data)
    const { loginKey: _lk, ...safeUser } = user
    return NextResponse.json({ ...safeUser, rawLoginKey }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
