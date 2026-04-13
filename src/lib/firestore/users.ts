import { FieldValue } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase-admin"
import { hashPassword } from "@/lib/auth"
import type { User } from "@/types/auth.types"
import type { TeamMemberBasic } from "@/types/calendar.types"

const COLLECTION = "users"

function generateRawKey(teamName: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  const random = Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
  return `team-${teamName}-${random}`
}

function docToUser(id: string, data: FirebaseFirestore.DocumentData): User {
  return {
    id,
    name: data.name as string,
    teamId: data.teamId as string,
    teamName: data.teamName as string,
    loginKey: data.loginKey as string,
    role: data.role as "user" | "admin",
    createdAt: data.createdAt,
  }
}

/** 팀 소속 유저 목록 조회 (가입일 오름차순) */
export async function getTeamMembers(teamId: string): Promise<TeamMemberBasic[]> {
  const db = getDb()
  const snap = await db
    .collection(COLLECTION)
    .where("teamId", "==", teamId)
    .orderBy("createdAt", "asc")
    .get()

  return snap.docs.map((doc) => ({
    id: doc.id,
    name: doc.data().name as string,
  }))
}

/** 전체 유저 조회 (teamId 필터 선택) */
export async function getAllUsers(teamId?: string): Promise<User[]> {
  const db = getDb()
  const col = db.collection(COLLECTION)
  const query = teamId
    ? col.where("teamId", "==", teamId).orderBy("createdAt", "asc")
    : col.orderBy("createdAt", "asc")
  const snap = await query.get()
  return snap.docs.map((doc) => docToUser(doc.id, doc.data()))
}

export interface CreateUserInput {
  name: string
  teamId: string
  teamName: string
}

export interface CreateUserResult {
  user: User
  rawLoginKey: string
}

/** 유저 생성 (loginKey 자동 생성 + bcrypt 해시) */
export async function createUser(input: CreateUserInput): Promise<CreateUserResult> {
  const db = getDb()
  const rawLoginKey = generateRawKey(input.teamName)
  const hashedKey = await hashPassword(rawLoginKey)
  const now = FieldValue.serverTimestamp()

  const docRef = await db.collection(COLLECTION).add({
    name: input.name,
    teamId: input.teamId,
    teamName: input.teamName,
    loginKey: hashedKey,
    role: "user",
    createdAt: now,
  })

  const snap = await docRef.get()
  return { user: docToUser(docRef.id, snap.data()!), rawLoginKey }
}

/** 유저 정보 수정 */
export async function updateUser(
  id: string,
  data: { name?: string }
): Promise<User | null> {
  const db = getDb()
  const docRef = db.collection(COLLECTION).doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return null
  await docRef.update(data)
  const updated = await docRef.get()
  return docToUser(id, updated.data()!)
}

/** 유저 삭제 */
export async function deleteUser(id: string): Promise<boolean> {
  const db = getDb()
  const docRef = db.collection(COLLECTION).doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return false
  await docRef.delete()
  return true
}

/** 로그인 키 재생성 */
export async function regenerateLoginKey(id: string): Promise<string | null> {
  const db = getDb()
  const docRef = db.collection(COLLECTION).doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return null
  const data = snap.data()!
  const rawLoginKey = generateRawKey(data.teamName as string)
  const hashedKey = await hashPassword(rawLoginKey)
  await docRef.update({ loginKey: hashedKey })
  return rawLoginKey
}
