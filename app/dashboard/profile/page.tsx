"use client"

import { useRef, useState } from "react"
import {
  BadgeCheck,
  Camera,
  Check,
  Loader2,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { useAuth } from "@/components/providers/auth-provider"
import { PageHeader } from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { updateUser } from "@/lib/auth-client"
import { uploadImage } from "@/lib/api"
import { initials } from "@/lib/utils"
import { cn } from "@/lib/utils"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function ProfileForm() {
  const { user, isAdmin, refreshSession } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user?.name ?? "")
  const [phone, setPhone] = useState(user?.phoneNumber ?? "")
  const [imageMode, setImageMode] = useState<"keep" | "upload" | "url">("keep")
  const [imageUrl, setImageUrl] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(user?.image ?? null)
  const [saving, setSaving] = useState(false)

  function handleFile(file: File | null) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Profile images must be smaller than 5 MB.")
      return
    }
    setImageFile(file)
    setImageMode("upload")
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Please enter your full name (at least 3 characters).")
      return
    }
    if (imageMode === "url" && imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      toast.error("Image URL must start with http:// or https://")
      return
    }

    setSaving(true)
    try {
      let image = user?.image ?? undefined
      if (imageMode === "upload" && imageFile) {
        image = await uploadImage(imageFile)
      } else if (imageMode === "url" && imageUrl.trim()) {
        image = imageUrl.trim()
      }

      // Custom fields (phoneNumber) are declared as additionalFields on the
      // Better Auth server; the client type does not infer them automatically.
      const profileUpdate = {
        name: name.trim(),
        phoneNumber: phone.trim(),
        image,
      } as unknown as Parameters<typeof updateUser>[0]
      const { error } = await updateUser(profileUpdate)
      if (error) {
        throw new Error(error.message ?? "Profile update failed.")
      }

      await refreshSession()
      toast.success("Profile updated.")
      setImageMode("keep")
      setImageFile(null)
      setImageUrl("")
      setPreview(image ?? user?.image ?? null)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not update your profile. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Account settings"
        title="My profile"
        description="Update the details the studio uses to reach you. Your role and access status are managed by the salon and cannot be changed here."
      />

      <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        {/* Summary card */}
        <div className="card overflow-hidden">
          <div className="relative h-24 bg-ink">
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-9 flex items-end justify-between">
              <span className="relative grid size-20 place-items-center overflow-hidden rounded-2xl border-4 border-paper bg-sand text-xl font-bold text-ink/40">
                {preview ? (
                  <img
                    src={preview}
                    alt={name || "Profile"}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(name)
                )}
              </span>
              <span
                className={cn(
                  "mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.12em] uppercase",
                  isAdmin
                    ? "bg-clay/12 text-clay-deep"
                    : "bg-sage/20 text-ink/65"
                )}
              >
                <BadgeCheck className="size-3" />
                {isAdmin ? "Administrator" : "Customer"}
              </span>
            </div>
            <h2 className="mt-3 font-display text-xl font-bold">
              {name || "Your name"}
            </h2>
            <p className="mt-1 text-[0.78rem] text-ink/45">{user?.email}</p>

            <div className="mt-5 space-y-2.5 border-t border-line pt-4 text-[0.75rem]">
              <p className="flex items-center gap-2 text-ink/55">
                <Mail className="size-3.5 text-clay" />
                {user?.email}
              </p>
              <p className="flex items-center gap-2 text-ink/55">
                <Phone className="size-3.5 text-clay" />
                {phone || "No phone number added"}
              </p>
              <p className="flex items-center gap-2 text-ink/55">
                <ShieldCheck className="size-3.5 text-clay" />
                Account status: {user?.isBlocked ? "Blocked" : "Active"}
              </p>
              <p className="flex items-center gap-2 text-ink/55">
                <Lock className="size-3.5 text-clay" />
                Role changes are handled by the salon
              </p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSubmit} className="card p-5 sm:p-6">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <span className="grid size-8 place-items-center rounded-lg bg-cream text-ink/60">
              <UserRound className="size-4" />
            </span>
            <div>
              <p className="text-[0.86rem] font-semibold">Basic information</p>
              <p className="text-[0.68rem] text-ink/40">
                Only these fields are editable by you.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={3}
                className="field"
                placeholder="Your full name"
              />
            </label>
            <label className="block">
              <span className="label">Phone number</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="field"
                placeholder="+880 1XXX XXX XXX"
                inputMode="tel"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="label">Email address</span>
              <span className="relative block">
                <input
                  value={user?.email ?? ""}
                  readOnly
                  disabled
                  className="field cursor-not-allowed bg-cream/70 text-ink/45"
                />
                <Lock className="absolute top-1/2 right-3.5 size-3.5 -translate-y-1/2 text-ink/25" />
              </span>
              <span className="mt-1.5 block text-[0.64rem] text-ink/35">
                Email changes are managed by the studio for account security.
              </span>
            </label>
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.86rem] font-semibold">Profile image</p>
                <p className="mt-0.5 text-[0.68rem] text-ink/40">
                  Upload a fresh photo or paste an image URL.
                </p>
              </div>
              <div className="flex rounded-full bg-cream p-0.5">
                {(
                  [
                    { key: "upload", label: "Upload" },
                    { key: "url", label: "URL" },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setImageMode(mode.key)}
                    className={cn(
                      "rounded-full px-3 py-1 font-mono text-[0.55rem] tracking-[0.1em] uppercase transition-colors",
                      imageMode === mode.key
                        ? "bg-paper text-ink shadow-sm"
                        : "text-ink/40"
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3">
              {imageMode === "upload" ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line bg-cream/40 p-3">
                  <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-cream text-ink/30">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Camera className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.75rem] font-medium">
                      {imageFile ? imageFile.name : "No new image selected"}
                    </p>
                    <p className="text-[0.64rem] text-ink/40">
                      JPG, PNG or WebP · up to 5 MB
                    </p>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) =>
                      handleFile(event.target.files?.[0] ?? null)
                    }
                  />
                  {imageFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImageMode("keep")
                        setPreview(user?.image ?? null)
                        if (fileRef.current) fileRef.current.value = ""
                      }}
                      className="grid size-8 place-items-center rounded-full bg-cream text-ink/45 hover:text-danger"
                      aria-label="Remove selected image"
                    >
                      <X className="size-4" />
                    </button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload />
                      Choose
                    </Button>
                  )}
                </div>
              ) : (
                <label className="block">
                  <span className="sr-only">Image URL</span>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(event) => {
                      setImageUrl(event.target.value)
                      setPreview(event.target.value || user?.image || null)
                    }}
                    placeholder="https://example.com/photo.jpg"
                    className="field"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-[0.65rem] text-ink/35">
              Changes are saved to your Better Auth profile.
            </p>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <RequireRole>
      <ProfileForm />
    </RequireRole>
  )
}
