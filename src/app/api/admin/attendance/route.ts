import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-guard"
import { getByTeamAndMonth } from "@/lib/firestore/attendance"

const querySchema = z.object({
  teamId: z.string().min(1),
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
})

export async function GET(request: Request) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      teamId: searchParams.get("teamId"),
      year: searchParams.get("year"),
      month: searchParams.get("month"),
    })

    if (!parsed.success) {
      return NextResponse.json({ error: "조회 조건을 확인해주세요" }, { status: 400 })
    }

    const records = await getByTeamAndMonth(
      parsed.data.teamId,
      parsed.data.year,
      parsed.data.month
    )

    const safeRecords = records.map(({ createdAt: _createdAt, updatedAt: _updatedAt, ...rest }) => rest)

    return NextResponse.json(safeRecords)
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
