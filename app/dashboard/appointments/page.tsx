"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Scissors,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { EmptyState } from "@/components/site/empty-state"
import { PageLoader } from "@/components/site/loader"
import { StatusBadge } from "@/components/site/status-badge"
import {
  AppointmentDetails,
  ConfirmDialog,
  PageHeader,
} from "@/components/dashboard/dashboard-ui"
import { Button, ButtonLink } from "@/components/ui/button"
import {
  cancelMyAppointment,
  getMyAppointments,
  getMyTransactions,
  payAppointment,
} from "@/lib/data"
import { formatDate, formatDateTime, formatMoney, shortRef } from "@/lib/format"
import type { Appointment, AppointmentStatus, Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

const filters: Array<{ key: "all" | AppointmentStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
]

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all")
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getMyAppointments(), getMyTransactions()])
      .then(([appointmentData, transactionData]) => {
        if (!active) return
        setAppointments(appointmentData)
        setTransactions(transactionData)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error
            ? err.message
            : "Could not load your appointments."
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  function reload() {
    setLoading(true)
    setError(null)
    setReloadKey((value) => value + 1)
  }

  const visible = useMemo(() => {
    if (filter === "all") return appointments
    return appointments.filter((item) => item.status === filter)
  }, [appointments, filter])

  async function handleCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      await cancelMyAppointment(cancelTarget._id)
      setAppointments((current) =>
        current.map((item) =>
          item._id === cancelTarget._id
            ? { ...item, status: "cancelled" as const }
            : item
        )
      )
      toast.success("Appointment request cancelled.")
      setCancelTarget(null)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "We could not cancel this request."
      )
    } finally {
      setCancelling(false)
    }
  }

  async function handlePay(appointment: Appointment) {
    setPayingId(appointment._id)
    try {
      const url = await payAppointment(appointment._id)
      if (!url) throw new Error("Stripe did not return a checkout URL.")
      window.location.assign(url)
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Payment could not be started. Please try again."
      )
      setPayingId(null)
    }
  }

  if (loading) return <PageLoader label="Loading your appointments…" />

  const counts = {
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }

  return (
    <div>
      <PageHeader
        eyebrow="Your bookings"
        title="My appointments"
        description="Every request you have made, with its confirmation and payment status. Cancel pending requests or pay for confirmed visits."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={reload}>
              <RefreshCw />
              Refresh
            </Button>
            <ButtonLink href="/services" size="sm">
              <Scissors />
              Book another
            </ButtonLink>
          </>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.78rem] text-danger">
          {error}
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {filters.map((item) => {
          const count =
            item.key === "all"
              ? appointments.length
              : counts[item.key as keyof typeof counts]
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[0.72rem] font-semibold transition-colors",
                filter === item.key
                  ? "bg-ink text-cream"
                  : "bg-paper text-ink/55 ring-1 ring-line hover:text-ink"
              )}
            >
              {item.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 font-mono text-[0.55rem]",
                  filter === item.key ? "bg-cream/15" : "bg-cream"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={
            appointments.length === 0
              ? "No appointment requests yet"
              : "Nothing in this filter"
          }
          description={
            appointments.length === 0
              ? "Browse the menu, open a service and request your first appointment."
              : "Try another status filter to see the rest of your requests."
          }
          action={
            <ButtonLink href="/services" size="sm">
              Browse services
            </ButtonLink>
          }
        />
      ) : (
        <div className="grid gap-3">
          {visible.map((appointment) => {
            const canCancel = appointment.status === "pending"
            const canPay =
              appointment.status === "confirmed" &&
              appointment.paymentStatus === "unpaid"
            return (
              <article
                key={appointment._id}
                className="card flex flex-col gap-4 p-3.5 sm:flex-row sm:items-center sm:p-4"
              >
                <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-sand sm:h-24 sm:w-32">
                  <Image
                    src={appointment.serviceImage}
                    alt={appointment.serviceName}
                    fill
                    sizes="(max-width: 640px) 90vw, 128px"
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={appointment.status} />
                    <StatusBadge status={appointment.paymentStatus} />
                    <span className="font-mono text-[0.55rem] tracking-[0.1em] text-ink/30 uppercase">
                      {appointment.serviceCategory}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-[1.05rem] leading-tight font-semibold">
                    {appointment.serviceName}
                  </h2>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-ink/50">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="size-3.5 text-clay" />
                      {formatDate(appointment.appointmentDate)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="size-3.5 text-clay" />
                      {appointment.timeSlot}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-ink/70">
                      <CreditCard className="size-3.5 text-clay" />
                      {formatMoney(appointment.servicePrice)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[0.63rem] text-ink/35">
                    Requested {formatDateTime(appointment.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(appointment)}
                  >
                    <Eye />
                    Details
                  </Button>
                  {canPay && (
                    <Button
                      size="sm"
                      onClick={() => void handlePay(appointment)}
                      disabled={payingId === appointment._id}
                    >
                      {payingId === appointment._id ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <CreditCard />
                      )}
                      {payingId === appointment._id ? "Opening…" : "Pay now"}
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger hover:bg-danger/8"
                      onClick={() => setCancelTarget(appointment)}
                    >
                      <XCircle />
                      Cancel
                    </Button>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Payment history */}
      <section id="payments" className="mt-10 scroll-mt-24">
        <PageHeader
          eyebrow="Receipts"
          title="Payment history"
          description="Transactions are written only after Stripe verifies a completed checkout."
        />
        {transactions.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No payments yet"
            description="Once a confirmed appointment is paid through Stripe, the receipt appears here."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Appointment</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Paid on</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id}>
                    <td className="font-semibold">{transaction.serviceName}</td>
                    <td className="text-ink/55">
                      {formatDate(transaction.appointmentDate)}
                    </td>
                    <td className="font-semibold">
                      {formatMoney(transaction.amount, transaction.currency)}
                    </td>
                    <td>
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="font-mono text-[0.68rem] text-ink/45">
                      {shortRef(transaction.stripeSessionId)}
                    </td>
                    <td className="text-ink/55">
                      {formatDateTime(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[0.68rem] text-ink/35">
          Need a copy of a receipt?{" "}
          <Link href="/dashboard/profile" className="underline">
            Check your profile
          </Link>{" "}
          or contact the studio.
        </p>
      </section>

      <AppointmentDetails
        appointment={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        footer={
          selected?.status === "confirmed" &&
          selected.paymentStatus === "unpaid" ? (
            <Button size="sm" onClick={() => selected && void handlePay(selected)}>
              <CreditCard />
              Pay now
            </Button>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Cancel this request?"
        description={`Your pending request for ${
          cancelTarget?.serviceName ?? "this service"
        } on ${
          cancelTarget ? formatDate(cancelTarget.appointmentDate) : ""
        } will be cancelled. Confirmed appointments cannot be cancelled here.`}
        confirmLabel="Cancel request"
        cancelLabel="Keep request"
        tone="danger"
        loading={cancelling}
        onConfirm={() => void handleCancel()}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  )
}

export default function MyAppointmentsPage() {
  return (
    <RequireRole role="customer">
      <MyAppointments />
    </RequireRole>
  )
}
