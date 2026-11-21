"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { signIn } from "@/lib/auth-client"
import { API_URL, friendlyMessage } from "@/lib/api"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.56-5.17 3.56-8.65Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.32a7.2 7.2 0 0 1 0-4.6V6.64H1.3a12 12 0 0 0 0 10.75l4.01-3.07Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.64l4.01 3.08C6.25 6.85 8.89 4.75 12 4.75Z"
      />
    </svg>
  )
}

function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const rawRedirect = params.get("redirect")
  const redirect =
    rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : null

  const { user, isAdmin, isPending } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && user) {
      router.replace(redirect ?? (isAdmin ? "/dashboard/admin" : "/dashboard"))
    }
  }, [isAdmin, isPending, redirect, router, user])

  async function finishSignIn() {
    let target = redirect
    try {
      const res = await fetch(`${API_URL}/auth/token`, {
        method: "POST",
        credentials: "include",
      })
      if (res.ok) {
        const body = await res.json()
        const role = body?.data?.user?.role
        target = target ?? (role === "admin" ? "/dashboard/admin" : "/dashboard")
      }
    } catch {
      /* the API layer retries the token exchange on its own */
    }
    toast.success("Welcome back to SalonBook.")
    window.location.assign(target ?? "/dashboard")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const { error: signInError } = await signIn.email({ email, password })
      if (signInError) {
        throw new Error(signInError.message ?? "Invalid email or password.")
      }
      await finishSignIn()
    } catch (err) {
      const message = friendlyMessage(
        err,
        "Sign in failed. Please check your details."
      )
      setError(message)
      toast.error(message)
      setSubmitting(false)
    }
  }

  async function handleGoogle() {
    setError(null)
    setGoogleLoading(true)
    try {
      const { error: googleError } = await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}${redirect ?? "/dashboard"}`,
      })
      if (googleError) {
        throw new Error(
          googleError.message ??
            "Google sign in is unavailable right now. Use email instead."
        )
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google sign in failed."
      setError(message)
      toast.error(message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <p className="eyebrow flex items-center gap-2.5 text-clay">
        <span className="h-px w-7 bg-current" />
        Welcome back
      </p>
      <h1 className="mt-4 font-display text-[2.2rem] leading-[1.02] font-bold sm:text-[2.6rem]">
        Your chair is
        <br />
        <span className="text-ink/35">still warm.</span>
      </h1>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/50">
        Sign in to manage appointments, pay for confirmed visits and keep your
        grooming history in one place.
      </p>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-xl border border-danger/20 bg-danger/6 p-3.5 text-[0.78rem] text-danger"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="label">Email address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="field pl-10"
            />
          </span>
        </label>

        <label className="block">
          <span className="label">Password</span>
          <span className="relative block">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="field pr-11 pl-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink/40 hover:bg-cream hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || googleLoading}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="font-mono text-[0.55rem] tracking-[0.16em] text-ink/35 uppercase">
          or continue with
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full bg-paper"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
      >
        {googleLoading ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
        {googleLoading ? "Opening Google…" : "Sign in with Google"}
      </Button>

      <p className="mt-6 text-center text-[0.8rem] text-ink/50">
        New to SalonBook?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-clay-deep underline decoration-clay/30 underline-offset-4 hover:decoration-clay"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-4 rounded-xl bg-cream px-3 py-2.5 text-center text-[0.68rem] leading-relaxed text-ink/40">
        Demo customer: customer@salonbook.com · Customer123
        <br />
        Admin access is provisioned securely by the salon.
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand/40" />}>
      <SignInForm />
    </Suspense>
  )
}
