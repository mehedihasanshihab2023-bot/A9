"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlertCircle,
  ArrowRight,
  Check,
  Circle,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { signIn, signUp, updateUser } from "@/lib/auth-client"
import { API_URL, friendlyMessage, uploadImage } from "@/lib/api"
import { cn } from "@/lib/utils"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

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

function Rule({ passed, children }: { passed: boolean; children: React.ReactNode }) {
  return (
    <li
      className={cn(
        "flex items-center gap-1.5 text-[0.7rem]",
        passed ? "text-success" : "text-ink/40"
      )}
    >
      {passed ? (
        <Check className="size-3.5" strokeWidth={3} />
      ) : (
        <Circle className="size-3" />
      )}
      {children}
    </li>
  )
}

function SignUpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const rawRedirect = params.get("redirect")
  const redirect =
    rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : null

  const { user, isPending } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rules = useMemo(
    () => ({
      length: password.length >= 6,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
    }),
    [password]
  )
  const passwordValid = rules.length && rules.upper && rules.lower

  useEffect(() => {
    if (!isPending && user) {
      router.replace(redirect ?? "/dashboard")
    }
  }, [isPending, redirect, router, user])

  function handleFile(file: File | null) {
    setError(null)
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Profile images must be smaller than 5 MB.")
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    if (!passwordValid) {
      setError(
        "Password must be at least 6 characters and include an uppercase and a lowercase letter."
      )
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }
    if (imageMode === "url" && imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      setError("Image URL must start with http:// or https://")
      return
    }

    setSubmitting(true)
    try {
      const { error: signUpError } = await signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        ...(imageMode === "url" && imageUrl
          ? { image: imageUrl.trim() }
          : {}),
      })
      if (signUpError) {
        throw new Error(signUpError.message ?? "We could not create your account.")
      }

      // The account exists now — upload the chosen photo and attach it.
      if (imageMode === "upload" && imageFile) {
        try {
          await fetch(`${API_URL}/auth/token`, {
            method: "POST",
            credentials: "include",
          })
          const url = await uploadImage(imageFile)
          await updateUser({ image: url })
        } catch {
          toast.warning(
            "Account created, but the photo upload failed. You can add it from your profile."
          )
        }
      }

      toast.success("Welcome to SalonBook — your account is ready.")
      window.location.assign(redirect ?? "/dashboard")
    } catch (err) {
      const message = friendlyMessage(
        err,
        "Sign up failed. Please review your details and try again."
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
            "Google sign up is unavailable right now. Use email instead."
        )
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Google sign up failed."
      setError(message)
      toast.error(message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <p className="eyebrow flex items-center gap-2.5 text-clay">
        <span className="h-px w-7 bg-current" />
        Join the studio
      </p>
      <h1 className="mt-4 font-display text-[2.2rem] leading-[1.02] font-bold sm:text-[2.55rem]">
        A better chair
        <br />
        <span className="text-ink/35">starts here.</span>
      </h1>
      <p className="mt-3 text-[0.85rem] leading-relaxed text-ink/50">
        Create a free customer account to request appointments and pay securely
        after confirmation.
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
          <span className="label">Full name</span>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
            <input
              required
              minLength={3}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              className="field pl-10"
            />
          </span>
        </label>

        <label className="block">
          <span className="label">Email address</span>
          <span className="relative block">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="field pl-10"
            />
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
                className="field pr-10 pl-10"
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
          <label className="block">
            <span className="label">Confirm password</span>
            <span className="relative block">
              <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
                className="field pl-10"
              />
            </span>
          </label>
        </div>

        <ul className="grid gap-1.5 rounded-xl bg-cream/80 px-3 py-2.5 sm:grid-cols-3">
          <Rule passed={rules.length}>6+ characters</Rule>
          <Rule passed={rules.upper}>One uppercase</Rule>
          <Rule passed={rules.lower}>One lowercase</Rule>
        </ul>

        {/* Profile image */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="label mb-0">Profile image</span>
            <div className="flex rounded-full bg-cream p-0.5">
              {(["upload", "url"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setImageMode(mode)
                    setPreview(
                      mode === "url"
                        ? imageUrl || null
                        : imageFile
                          ? URL.createObjectURL(imageFile)
                          : null
                    )
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-mono text-[0.55rem] tracking-[0.1em] uppercase transition-colors",
                    imageMode === mode
                      ? "bg-paper text-ink shadow-sm"
                      : "text-ink/40"
                  )}
                >
                  {mode === "upload" ? "Upload" : "URL"}
                </button>
              ))}
            </div>
          </div>

          {imageMode === "upload" ? (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-paper p-2.5">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-ink/30">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <UserRound className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.75rem] font-medium">
                  {imageFile ? imageFile.name : "Optional — JPG, PNG or WebP"}
                </p>
                <p className="text-[0.65rem] text-ink/40">Up to 5 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
              {imageFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setPreview(null)
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                  className="grid size-8 place-items-center rounded-full bg-cream text-ink/50 hover:text-danger"
                  aria-label="Remove image"
                >
                  <X className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[0.68rem] font-semibold text-cream"
                >
                  <Upload className="size-3" />
                  Choose
                </button>
              )}
            </div>
          ) : (
            <label className="relative block">
              <ImagePlus className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/30" />
              <input
                type="url"
                value={imageUrl}
                onChange={(event) => {
                  setImageUrl(event.target.value)
                  setPreview(event.target.value || null)
                }}
                placeholder="https://example.com/photo.jpg"
                className="field pl-10"
              />
            </label>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={submitting || googleLoading}
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" />
              Creating your account…
            </>
          ) : (
            <>
              Create account
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
        {googleLoading ? "Opening Google…" : "Sign up with Google"}
      </Button>

      <p className="mt-5 text-center text-[0.8rem] text-ink/50">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-clay-deep underline decoration-clay/30 underline-offset-4 hover:decoration-clay"
        >
          Sign in
        </Link>
      </p>
      <p className="mt-4 text-center text-[0.65rem] leading-relaxed text-ink/35">
        By creating an account you agree to the studio&apos;s booking and
        cancellation policy. Admin accounts are never created from this form.
      </p>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-[34rem] animate-pulse rounded-2xl bg-sand/40" />}>
      <SignUpForm />
    </Suspense>
  )
}
