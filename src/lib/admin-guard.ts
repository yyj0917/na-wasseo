import { cookies } from "next/headers"
import { SESSION_COOKIE, verifyToken } from "@/lib/session"
import type { SessionPayload } from "@/types/auth.types"

export async function requireAdmin(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)

  if (!payload || payload.role !== "admin") {
    return null
  }

  return payload
}
