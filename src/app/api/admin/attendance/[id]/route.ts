import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/admin-guard"
import { updateRecord } from "@/lib/firestore/attendance"

const timePattern = /^\d{2}:\d{2}$/

const updateSchema = z
  .object({
    checkInTime: z.string().regex(timePattern, "출근 시간을 확인해주세요").optional(),
    checkOutTime: z
      .union([z.string().regex(timePattern, "퇴근 시간을 확인해주세요"), z.null()])
      .optional(),
  })
  .refine((value) => value.checkInTime !== undefined || value.checkOutTime !== undefined, {
    message: "수정할 값을 입력해주세요",
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
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요" }, { status: 400 })
    }

    const updated = await updateRecord(id, parsed.data)

    if (!updated) {
      return NextResponse.json({ error: "출퇴근 기록을 찾을 수 없습니다" }, { status: 404 })
    }

    const { createdAt: _createdAt, updatedAt: _updatedAt, ...safeRecord } = updated

    return NextResponse.json(safeRecord)
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
