import { FieldValue } from "firebase-admin/firestore"
import { getDb } from "@/lib/firebase-admin"
import type { Team } from "@/types/auth.types"

const COLLECTION = "teams"

function docToTeam(id: string, data: FirebaseFirestore.DocumentData): Team {
  return {
    id,
    name: data.name as string,
    createdAt: data.createdAt,
  }
}

export async function getAllTeams(): Promise<Team[]> {
  const db = getDb()
  const snap = await db.collection(COLLECTION).orderBy("createdAt", "asc").get()
  return snap.docs.map((doc) => docToTeam(doc.id, doc.data()))
}

export async function createTeam(name: string): Promise<Team> {
  const db = getDb()
  const now = FieldValue.serverTimestamp()
  const docRef = await db.collection(COLLECTION).add({ name, createdAt: now })
  const snap = await docRef.get()
  return docToTeam(docRef.id, snap.data()!)
}

export async function updateTeam(id: string, name: string): Promise<Team | null> {
  const db = getDb()
  const docRef = db.collection(COLLECTION).doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return null
  await docRef.update({ name })
  const updated = await docRef.get()
  return docToTeam(id, updated.data()!)
}

export async function deleteTeam(id: string): Promise<boolean> {
  const db = getDb()
  const docRef = db.collection(COLLECTION).doc(id)
  const snap = await docRef.get()
  if (!snap.exists) return false
  await docRef.delete()
  return true
}
