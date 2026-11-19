"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
  Tag,
} from "lucide-react"
import { toast } from "sonner"

import { useAuth } from "@/components/providers/auth-provider"
import { EmptyState } from "@/components/site/empty-state"
import { Loader } from "@/components/site/loader"
import { StatusBadge } from "@/components/site/status-badge"
import { Button, ButtonLink } from "@/components/ui/button"
import { createAppointment, getServiceById } from "@/lib/data"
import { ApiError } from "@/lib/api"
import { durationLabel, formatMoney, todayISO } from "@/lib/format"
import { TIME_SLOTS } from "@/lib/constants"
import type { Service } from "@/lib/types"
import { cn } from "@/lib/utils"

const included = [
  "Consultation with your artist",
  "Premium products & tools",
  "Finishing and styling advice",
  "Aftercare notes in your dashboard",
]

export default function ServiceDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isAdmin, isPending } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [date, setDate] = useState(todayISO())
  const [slot, setSlot] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // Private route: unauthenticated visitors are sent to sign in and come back.
  useEffect(() => {
    if (!isPending && !user) {
      router.replace(
        `/sign-in?redirect=${encodeURIComponent(`/services/${id}`)}`
      )
    }
  }, [id, isPending, router, user])

  useEffect(() => {
    if (isPending || !user) return
    let active = true
    getServiceById(id)
      .then((data) => {
        if (active) {
          setService(data)
          setLoadError(null)
        }
      })
      .catch((err: unknown) => {
        if (!active) return
        if (err instanceof ApiError && err.status === 401) return
        setLoadError(
          err instanceof ApiError && err.status === 404
            ? "This service no longer exists. It may have been removed from the menu."
            : err instanceof Error
              ? err.message
              : "We could not load this service."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, isPending, user])

  const inactive = service?.status !== "active"
  const priceLabel = useMemo(
    () => (service ? formatMoney(service.price) : "—"),
    [service]
  )

  async function handleBook(event: React.FormEvent) {
    event.preventDefault()
    if (!service) return
    if (!date) {
      toast.error("Please choose an appointment date.")
      return
    }
    if (!slot) {
      toast.error("Please choose a time slot.")
      return
    }

    setSubmitting(true)
    try {
      await createAppointment({
        serviceId: service._id,
        appointmentDate: date,
        timeSlot: slot,
        message: message.trim() || undefined,
      })
      toast.success("Request sent — the studio will confirm shortly.")
      router.push("/dashboard/appointments")
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not create your request. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending || (!user && !loadError)) {
    return <Loader label="Checking your session…" />
  }

  if (loading) {
    return <Loader label="Loading service details…" />
  }

  if (loadError || !service) {
    return (
      <div className="shell py-16">
        <EmptyState
          icon={ShieldAlert}
          title="We could not open this service"
          description={loadError ?? "The service could not be found."}
          action={
            <div className="flex gap-2">
              <ButtonLink href="/services" variant="outline">
                <ArrowLeft />
                Back to services
              </ButtonLink>
              <ButtonLink href="/dashboard/appointments">
                My appointments
              </ButtonLink>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="shell py-8 sm:py-12">
      <Link
        href="/services"
        className="mb-6 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-ink/50 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        All services
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        {/* Info */}
        <div>
          <div className="relative aspect-[4/3.2] overflow-hidden rounded-[1.8rem] bg-sand">
            <Image
              src={service.image}
              alt={service.serviceName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-paper px-3 py-1.5 font-mono text-[0.58rem] font-semibold tracking-[0.13em] text-ink uppercase">
                {service.category}
              </span>
              <StatusBadge status={service.status} />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
              <div className="rounded-2xl border border-cream/20 bg-ink/55 px-4 py-3 text-cream backdrop-blur-md">
                <p className="font-mono text-[0.5rem] tracking-[0.16em] text-cream/55 uppercase">
                  Studio price
                </p>
                <p className="mt-0.5 font-display text-2xl font-bold">
                  {priceLabel}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-paper/95 px-3 py-1.5 text-[0.7rem] font-semibold text-ink backdrop-blur">
                <Clock3 className="size-3.5 text-clay" />
                {durationLabel(service.duration)}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <h1 className="font-display text-[2rem] leading-[1.04] font-bold sm:text-[2.6rem]">
              {service.serviceName}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.72rem] font-medium text-ink/65">
                <Tag className="size-3.5 text-clay" />
                {service.category}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.72rem] font-medium text-ink/65">
                <Clock3 className="size-3.5 text-clay" />
                {service.duration} minutes
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[0.72rem] font-medium text-ink/65">
                <Sparkles className="size-3.5 text-clay" />
                Consultation included
              </span>
            </div>

            <p className="mt-5 max-w-2xl text-[0.92rem] leading-relaxed text-ink/60">
              {service.description}
            </p>

            <div className="mt-7 rounded-2xl border border-line bg-paper p-5">
              <p className="eyebrow text-ink/45">What is included</p>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-[0.8rem] text-ink/65"
                  >
                    <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-success/12 text-success">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking panel */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative overflow-hidden rounded-[1.8rem] bg-ink p-5 text-cream sm:p-7">
            <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <p className="eyebrow text-sage">Request a chair</p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                Book this treatment
              </h2>
              <p className="mt-1.5 text-[0.8rem] leading-relaxed text-cream/50">
                Pick a date and a slot. The studio confirms every request before
                payment opens.
              </p>

              {inactive ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-[0.8rem] text-amber-100">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                  <p>
                    This service is currently <strong>inactive</strong> and is
                    not accepting new bookings. Explore the rest of the menu.
                  </p>
                </div>
              ) : isAdmin ? (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-[0.8rem] text-amber-100">
                  <ShieldAlert className="mt-0.5 size-5 shrink-0" />
                  <p>
                    Administrator accounts cannot submit customer appointment
                    requests.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBook} className="mt-6 space-y-5">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[0.58rem] tracking-[0.15em] text-cream/50 uppercase">
                      Appointment date
                    </span>
                    <input
                      type="date"
                      min={todayISO()}
                      value={date}
                      onChange={(event) => setDate(event.target.value)}
                      required
                      className="h-11 w-full rounded-xl border border-cream/15 bg-cream/[0.06] px-3.5 text-sm text-cream [color-scheme:dark] outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/25"
                    />
                  </label>

                  <fieldset>
                    <legend className="mb-2 flex w-full items-center justify-between font-mono text-[0.58rem] tracking-[0.15em] text-cream/50 uppercase">
                      <span>Time slot</span>
                      <span className="text-cream/30">30 min windows</span>
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSlot(time)}
                          className={cn(
                            "rounded-lg border px-1 py-2 font-mono text-[0.65rem] transition-all",
                            slot === time
                              ? "border-clay bg-clay text-paper"
                              : "border-cream/12 bg-cream/[0.04] text-cream/60 hover:border-cream/30 hover:text-cream"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block">
                    <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[0.58rem] tracking-[0.15em] text-cream/50 uppercase">
                      <MessageSquareText className="size-3.5" />
                      Message (optional)
                    </span>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Anything the artist should know? Allergies, inspiration, preferences…"
                      className="w-full resize-none rounded-xl border border-cream/15 bg-cream/[0.06] p-3.5 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:border-clay focus:ring-2 focus:ring-clay/25"
                    />
                  </label>

                  <div className="rounded-xl border border-cream/12 bg-cream/[0.04] px-4 py-3">
                    <div className="flex items-center justify-between text-[0.78rem] text-cream/55">
                      <span>{service.serviceName}</span>
                      <span>{durationLabel(service.duration)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-cream/10 pt-2.5">
                      <span className="text-[0.75rem] text-cream/50">
                        Due after confirmation
                      </span>
                      <span className="font-display text-xl font-bold text-cream">
                        {priceLabel}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="w-full"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin" />
                        Sending request…
                      </>
                    ) : (
                      <>
                        <CalendarDays />
                        Request appointment
                      </>
                    )}
                  </Button>
                  <p className="text-center text-[0.66rem] leading-relaxed text-cream/35">
                    No payment is taken now. Pay from your dashboard once the
                    appointment is confirmed.
                  </p>
                </form>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-line bg-paper px-4 py-3 text-[0.72rem] text-ink/50">
            <ShieldAlert className="size-3.5 text-sage" />
            Payment is handled securely by Stripe after confirmation.
          </div>
        </div>
      </div>
    </div>
  )
}
