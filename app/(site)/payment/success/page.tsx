"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react"

import { ButtonLink } from "@/components/ui/button"
import { getMyAppointments } from "@/lib/data"
import type { Appointment } from "@/lib/types"
import { formatDate, formatMoney } from "@/lib/format"

function SuccessContent() {
  const params = useSearchParams()
  const sessionId = params.get("session_id")
  const [checking, setChecking] = useState(true)
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    let active = true
    let attempts = 0

    async function poll() {
      try {
        const data = await getMyAppointments()
        if (!active) return
        const match = sessionId
          ? data.find((item) => item.stripeSessionId === sessionId)
          : data.find((item) => item.paymentStatus === "paid")
        if (match?.paymentStatus === "paid") {
          setAppointment(match)
          setChecking(false)
          return
        }
        if (match) setAppointment(match)
      } catch {
        /* payment is already complete; the webhook may still be landing */
      }
      attempts += 1
      if (attempts < 6 && active) {
        window.setTimeout(poll, 2500)
      } else if (active) {
        setChecking(false)
      }
    }

    void poll()
    return () => {
      active = false
    }
  }, [sessionId])

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-[1.8rem] border border-line bg-paper p-6 text-center sm:p-9">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-8" />
        </span>
        <p className="eyebrow mt-6 text-clay">Payment complete</p>
        <h1 className="mt-3 font-display text-[2rem] leading-tight font-bold">
          You&apos;re all set.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.85rem] leading-relaxed text-ink/55">
          Stripe has processed your payment. Your appointment is marked as paid
          once the verified webhook reaches the salon server.
        </p>

        {checking ? (
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-cream px-4 py-3 text-[0.75rem] text-ink/50">
            <Loader2 className="size-4 animate-spin text-clay" />
            Verifying the payment with the studio…
          </div>
        ) : appointment ? (
          <div className="mt-6 rounded-2xl border border-line bg-cream/60 p-4 text-left">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.82rem] font-semibold">
                  {appointment.serviceName}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-ink/45">
                  {formatDate(appointment.appointmentDate)} ·{" "}
                  {appointment.timeSlot}
                </p>
              </div>
              <span className="rounded-full bg-success/12 px-2.5 py-1 font-mono text-[0.55rem] font-semibold tracking-[0.12em] text-success uppercase">
                {appointment.paymentStatus}
              </span>
            </div>
            <p className="mt-3 border-t border-line pt-3 font-display text-lg font-bold">
              {formatMoney(appointment.servicePrice)}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-cream/60 px-4 py-3 text-left text-[0.72rem] leading-relaxed text-ink/50">
            The webhook may take a few seconds. Refresh your dashboard to see the
            updated payment status.
          </div>
        )}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink href="/dashboard/appointments">
            <ReceiptText />
            View my appointments
          </ButtonLink>
          <ButtonLink href="/services" variant="outline">
            Book another
            <ArrowRight />
          </ButtonLink>
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-[0.65rem] text-ink/35">
          <ShieldCheck className="size-3.5" />
          Payment status is updated only by a signature-verified Stripe webhook.
        </p>
        {sessionId && (
          <p className="mt-2 font-mono text-[0.55rem] tracking-[0.08em] text-ink/25">
            SESSION {sessionId.slice(0, 20)}…
          </p>
        )}
        <p className="mt-4 text-[0.65rem] text-ink/35">
          Questions?{" "}
          <Link href="/#visit" className="underline">
            Contact the studio
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="shell flex min-h-[70vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-clay" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
