import { NextResponse } from "next/server"
import { z } from "zod"
import { updateTeam, deleteTeam } from "@/lib/firestore/teams"
import { requireAdmin } from "@/lib/admin-guard"

const updateSchema = z.object({
  name: z.string().min(1).max(50),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const body: unknown = await request.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "팀 이름을 입력해주세요" }, { status: 400 })
    }
    const team = await updateTeam(id, parsed.data.name)
    if (!team) {
      return NextResponse.json({ error: "팀을 찾을 수 없습니다" }, { status: 404 })
    }
    return NextResponse.json(team)
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const deleted = await deleteTeam(id)
    if (!deleted) {
      return NextResponse.json({ error: "팀을 찾을 수 없습니다" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
