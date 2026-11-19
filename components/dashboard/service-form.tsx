"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  Save,
  Trash2,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { Button, ButtonLink } from "@/components/ui/button"
import { createService, updateService } from "@/lib/data"
import { uploadImage } from "@/lib/api"
import { SERVICE_CATEGORIES } from "@/lib/constants"
import type { Service } from "@/lib/types"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const editing = Boolean(service)

  const [serviceName, setServiceName] = useState(service?.serviceName ?? "")
  const [category, setCategory] = useState(service?.category ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [price, setPrice] = useState(
    service ? String(service.price) : ""
  )
  const [duration, setDuration] = useState(
    service ? String(service.duration) : ""
  )
  const [status, setStatus] = useState<"active" | "inactive">(
    service?.status ?? "active"
  )
  const [imageUrl, setImageUrl] = useState(service?.image ?? "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(service?.image ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFile(file: File | null) {
    setError(null)
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPG, PNG or WebP).")
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("Service images must be smaller than 5 MB.")
      return
    }
    setImageFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError(null)

    const numericPrice = Number(price)
    const numericDuration = Number(duration)

    if (!serviceName.trim()) return setError("Service name is required.")
    if (!category) return setError("Please choose a category.")
    if (!description.trim()) return setError("Description is required.")
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return setError("Price must be a positive number.")
    }
    if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
      return setError("Duration must be a positive number of minutes.")
    }
    if (!editing && !imageFile) {
      return setError("Please upload a service image.")
    }

    setSaving(true)
    try {
      let image = imageUrl
      if (imageFile) {
        image = await uploadImage(imageFile)
      }

      const payload = {
        serviceName: serviceName.trim(),
        category,
        description: description.trim(),
        price: numericPrice,
        duration: Math.round(numericDuration),
        image,
        status,
      }

      if (service) {
        await updateService(service._id, payload)
        toast.success("Service updated.")
      } else {
        await createService(payload)
        toast.success("Service added to the menu.")
      }
      router.push("/dashboard/admin/services")
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We could not save the service. Please try again."
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-line pb-4">
          <span className="grid size-8 place-items-center rounded-lg bg-cream text-ink/60">
            <ImagePlus className="size-4" />
          </span>
          <div>
            <p className="text-[0.86rem] font-semibold">Service details</p>
            <p className="text-[0.68rem] text-ink/40">
              Everything shown on the public menu.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-[0.76rem] text-danger"
          >
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="label">Service name</span>
            <input
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="e.g. Signature Skin Fade"
              className="field"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="field"
                required
              >
                <option value="">Choose a category…</option>
                {SERVICE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="label">Status</span>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "active" | "inactive")
                }
                className="field"
              >
                <option value="active">Active — visible & bookable</option>
                <option value="inactive">Inactive — hidden</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="label">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              placeholder="Describe the treatment, what is included and who it suits…"
              className="field-area"
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="label">Price (USD)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="45"
                className="field"
                required
              />
              <span className="mt-1.5 block text-[0.64rem] text-ink/35">
                Must be a positive number.
              </span>
            </label>
            <label className="block">
              <span className="label">Estimated duration (minutes)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder="45"
                className="field"
                required
              />
              <span className="mt-1.5 block text-[0.64rem] text-ink/35">
                Rounded to the nearest minute.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <ButtonLink href="/dashboard/admin/services" variant="outline">
            <ArrowLeft />
            Back to services
          </ButtonLink>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save />
                {editing ? "Save changes" : "Publish service"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Image panel */}
      <div className="space-y-4">
        <div className="card p-4">
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
            Service image
          </p>
          <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-sand">
            {preview ? (
              <Image
                src={preview}
                alt="Service preview"
                fill
                sizes="(max-width: 1024px) 90vw, 35vw"
                className="object-cover"
              />
            ) : (
              <div className="grid h-full place-items-center text-center">
                <div>
                  <ImagePlus className="mx-auto size-7 text-ink/25" />
                  <p className="mt-2 text-[0.7rem] text-ink/35">
                    No image selected
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
          />

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
            >
              <Upload />
              {preview ? "Replace image" : "Upload image"}
            </Button>
            {imageFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-danger"
                onClick={() => {
                  setImageFile(null)
                  setImageUrl(service?.image ?? "")
                  setPreview(service?.image ?? null)
                  if (fileRef.current) fileRef.current.value = ""
                }}
              >
                <Trash2 />
              </Button>
            )}
          </div>
          <p className="mt-2.5 text-[0.64rem] leading-relaxed text-ink/35">
            Image uploads go through the salon server to ImgBB. JPG, PNG or
            WebP up to 5 MB. Image URLs are not accepted for services.
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-paper p-4 text-[0.7rem] leading-relaxed text-ink/45">
          <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-ink/65">
            <Check className="size-3.5 text-success" />
            Publishing checklist
          </p>
          <ul className="space-y-1.5">
            <li>· Price and duration must both be positive.</li>
            <li>· Active services appear immediately on the public menu.</li>
            <li>· Inactive services remain bookable only after reactivation.</li>
          </ul>
        </div>
      </div>
    </form>
  )
}
