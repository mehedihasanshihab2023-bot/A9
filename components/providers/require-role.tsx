"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Ban, LogOut } from "lucide-react"

import { useAuth } from "@/components/providers/auth-provider"
import { PageLoader } from "@/components/site/loader"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/lib/api"
import { signOut } from "@/lib/auth-client"

export async function clientSignOut() {
  try {
    await signOut()
  } finally {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined)
    window.location.assign("/")
  }
}

function BlockedNotice() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-5">
      <div className="max-w-md rounded-3xl border border-line bg-paper p-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger/10 text-danger">
          <Ban className="size-6" />
        </span>
        <h1 className="mt-5 font-display text-2xl font-bold">
          This account is blocked
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Access to the salon dashboard has been suspended. Please contact the
          salon administration if you believe this is a mistake.
        </p>
        <Button className="mt-6" onClick={() => void clientSignOut()}>
          <LogOut />
          Sign out
        </Button>
      </div>
    </div>
  )
}

export function RequireRole({
  role,
  children,
}: {
  role?: "admin" | "customer"
  children: React.ReactNode
}) {
  const { user, isPending, isBlocked } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isPending) return
    if (!user) {
      router.replace(`/sign-in?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    if (role && user.role !== role) {
      router.replace(user.role === "admin" ? "/dashboard/admin" : "/dashboard")
    }
  }, [isPending, pathname, role, router, user])

  if (isPending) return <PageLoader label="Checking your session…" />
  if (!user)
    return <PageLoader label="Redirecting you to sign in…" />
  if (isBlocked) return <BlockedNotice />
  if (role && user.role !== role)
    return <PageLoader label="Redirecting to your dashboard…" />

  return <>{children}</>
}
