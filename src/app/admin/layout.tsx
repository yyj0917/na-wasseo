import { cookies } from "next/headers"
import { verifyToken, SESSION_COOKIE } from "@/lib/session"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminLoginForm } from "@/components/admin/admin-login-form"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  const payload = token ? await verifyToken(token) : null
  const isAdmin = payload?.role === "admin"

  if (!isAdmin) {
    return <AdminLoginForm />
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  )
}
