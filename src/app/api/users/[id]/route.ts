import { NextResponse } from "next/server"
import { z } from "zod"
import { updateUser, deleteUser, regenerateLoginKey } from "@/lib/firestore/users"
import { requireAdmin } from "@/lib/admin-guard"

const updateSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  regenerateKey: z.boolean().optional(),
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
      return NextResponse.json({ error: "입력값을 확인해주세요" }, { status: 400 })
    }

    let rawLoginKey: string | undefined

    if (parsed.data.regenerateKey) {
      const newKey = await regenerateLoginKey(id)
      if (!newKey) {
        return NextResponse.json({ error: "유저를 찾을 수 없습니다" }, { status: 404 })
      }
      rawLoginKey = newKey
    }

    if (parsed.data.name) {
      const user = await updateUser(id, { name: parsed.data.name })
      if (!user) {
        return NextResponse.json({ error: "유저를 찾을 수 없습니다" }, { status: 404 })
      }
      const { loginKey: _lk, ...safeUser } = user
      return NextResponse.json({ ...safeUser, ...(rawLoginKey ? { rawLoginKey } : {}) })
    }

    return NextResponse.json({ success: true, ...(rawLoginKey ? { rawLoginKey } : {}) })
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
    const deleted = await deleteUser(id)
    if (!deleted) {
      return NextResponse.json({ error: "유저를 찾을 수 없습니다" }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
