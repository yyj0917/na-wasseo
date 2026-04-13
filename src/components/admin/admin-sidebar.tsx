"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, UserCircle, ClipboardList, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "대시보드" },
  { href: "/admin/teams", icon: Users, label: "팀 관리" },
  { href: "/admin/users", icon: UserCircle, label: "유저 관리" },
  { href: "/admin/attendance", icon: ClipboardList, label: "출퇴근 관리" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.refresh()
  }

  return (
    <aside className="w-60 bg-secondary text-secondary-foreground flex flex-col fixed h-full">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">나 왔어!</span>
          <span className="text-sm text-white/60">Admin</span>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="h-5 w-5" />
          로그아웃
        </button>
      </div>
    </aside>
  )
}
