"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CalendarDays, CreditCard, Loader2, XCircle } from "lucide-react"

import { ButtonLink } from "@/components/ui/button"

function CancelContent() {
  const params = useSearchParams()
  const appointmentId = params.get("appointmentId")

  return (
    <div className="shell flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-lg rounded-[1.8rem] border border-line bg-paper p-6 text-center sm:p-9">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-warning/12 text-warning">
          <XCircle className="size-8" />
        </span>
        <p className="eyebrow mt-6 text-clay">Checkout cancelled</p>
        <h1 className="mt-3 font-display text-[2rem] leading-tight font-bold">
          No payment was taken.
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[0.85rem] leading-relaxed text-ink/55">
          Your appointment is still confirmed and unpaid. You can return to your
          appointments whenever you are ready and start a fresh Stripe checkout.
        </p>

        <div className="mt-6 rounded-xl border border-line bg-cream/60 px-4 py-3 text-left text-[0.72rem] leading-relaxed text-ink/50">
          <p className="flex items-center gap-2 font-semibold text-ink/70">
            <CreditCard className="size-4 text-clay" />
            Payment is only collected after confirmation
          </p>
          <p className="mt-1.5">
            If you closed the checkout by mistake, simply press “Pay now” again
            from the appointment card.
          </p>
        </div>

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <ButtonLink href="/dashboard/appointments">
            <CalendarDays />
            Back to my appointments
          </ButtonLink>
          <ButtonLink href="/services" variant="outline">
            <ArrowLeft />
            Browse services
          </ButtonLink>
        </div>

        {appointmentId && (
          <p className="mt-4 font-mono text-[0.55rem] tracking-[0.08em] text-ink/25">
            APPOINTMENT {appointmentId.slice(-10)}
          </p>
        )}
        <p className="mt-3 text-[0.65rem] text-ink/35">
          Need help? Call{" "}
          <a href="tel:+8801712345678" className="underline">
            +880 1712 345 678
          </a>
        </p>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="shell flex min-h-[70vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-clay" />
        </div>
      }
    >
      <CancelContent />
    </Suspense>
  )
}
