"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react"
import type { Session } from "better-auth"

import { useSession } from "@/lib/auth-client"
import { API_URL } from "@/lib/api"
import type { SessionUser } from "@/lib/types"

type AuthContextValue = {
  user: SessionUser | null
  session: Session | null
  isPending: boolean
  isAdmin: boolean
  isBlocked: boolean
  refreshSession: () => Promise<unknown>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  isPending: true,
  isAdmin: false,
  isBlocked: false,
  refreshSession: async () => undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = useSession()
  const user = (data?.user as SessionUser | undefined) ?? null

  // Keep the Express JWT cookie in sync with the Better Auth session. The
  // API retries a 401 internally, but doing this eagerly avoids the extra
  // round-trip on the first protected request after a page load.
  const lastSessionId = useRef<string | null>(null)

  useEffect(() => {
    if (isPending) return
    const sessionId = data?.session?.id ?? null
    if (sessionId === lastSessionId.current) return
    lastSessionId.current = sessionId

    if (sessionId) {
      void fetch(`${API_URL}/auth/token`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {})
    } else {
      void fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {})
    }
  }, [data?.session?.id, isPending])

  const refreshSession = useCallback(() => refetch(), [refetch])

  return (
    <AuthContext.Provider
      value={{
        user,
        session: data?.session ?? null,
        isPending,
        isAdmin: user?.role === "admin",
        isBlocked: Boolean(user?.isBlocked),
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
