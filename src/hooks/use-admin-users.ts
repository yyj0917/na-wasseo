"use client"

import { useState, useEffect, useCallback } from "react"

export interface AdminTeam {
  id: string
  name: string
}

export interface AdminUser {
  id: string
  name: string
  teamId: string
  teamName: string
  role: "user" | "admin"
  createdAt: { _seconds: number } | null
}

export function useAdminUsers() {
  const [teams, setTeams] = useState<AdminTeam[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [teamsRes, usersRes] = await Promise.all([
        fetch("/api/teams"),
        fetch("/api/users"),
      ])
      if (teamsRes.ok) setTeams((await teamsRes.json()) as AdminTeam[])
      if (usersRes.ok) setUsers((await usersRes.json()) as AdminUser[])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const createUser = async (name: string, teamId: string, teamName: string) => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, teamId, teamName }),
    })
    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      throw new Error(json.error ?? "유저 생성에 실패했습니다")
    }
    const data = (await res.json()) as { rawLoginKey: string }
    await fetchData()
    return data.rawLoginKey
  }

  const updateUser = async (id: string, name: string) => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    if (!res.ok) {
      const json = (await res.json()) as { error?: string }
      throw new Error(json.error ?? "수정에 실패했습니다")
    }
    await fetchData()
  }

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (res.ok) await fetchData()
  }

  const regenerateKey = async (id: string): Promise<string> => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateKey: true }),
    })
    if (!res.ok) throw new Error("키 재생성에 실패했습니다")
    const data = (await res.json()) as { rawLoginKey?: string }
    return data.rawLoginKey ?? ""
  }

  return { teams, users, isLoading, createUser, updateUser, deleteUser, regenerateKey }
}
