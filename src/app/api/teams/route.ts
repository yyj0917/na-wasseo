import { NextResponse } from "next/server"
import { z } from "zod"
import { getAllTeams, createTeam } from "@/lib/firestore/teams"
import { requireAdmin } from "@/lib/admin-guard"

export async function GET() {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const teams = await getAllTeams()
    return NextResponse.json(teams)
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1, "팀 이름을 입력해주세요").max(50),
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
      return NextResponse.json({ error: "팀 이름을 입력해주세요" }, { status: 400 })
    }
    const team = await createTeam(parsed.data.name)
    return NextResponse.json(team, { status: 201 })
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
