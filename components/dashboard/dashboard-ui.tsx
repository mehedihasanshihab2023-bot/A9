"use client"

import Image from "next/image"
import type { LucideIcon } from "lucide-react"
import { CalendarDays, Clock3, Loader2, Mail, UserRound, X } from "lucide-react"

import { StatusBadge } from "@/components/site/status-badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"
import type { Appointment } from "@/lib/types"
import { cn } from "@/lib/utils"

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="eyebrow mb-2 text-clay">{eyebrow}</p>
        )}
        <h1 className="font-display text-[1.7rem] leading-tight font-bold sm:text-[2.1rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-xl text-[0.82rem] leading-relaxed text-ink/50">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function StatCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "default",
}: {
  label: string
  value: string | number
  note?: string
  icon: LucideIcon
  tone?: "default" | "clay" | "sage" | "ink"
}) {
  return (
    <div className="card relative overflow-hidden p-4.5 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
            {label}
          </p>
          <p className="mt-2.5 font-display text-[1.9rem] leading-none font-bold">
            {value}
          </p>
          {note && <p className="mt-2 text-[0.68rem] text-ink/40">{note}</p>}
        </div>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-xl",
            tone === "clay" && "bg-clay/12 text-clay-deep",
            tone === "sage" && "bg-sage/20 text-ink/70",
            tone === "ink" && "bg-ink text-cream",
            tone === "default" && "bg-cream text-ink/60"
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-clay/30 to-transparent" />
    </div>
  )
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Keep it",
  tone = "primary",
  loading = false,
  onConfirm,
  onClose,
}: {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "primary" | "danger"
  loading?: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center px-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-[0_40px_80px_-30px_rgba(16,25,21,0.5)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-ink/35 hover:bg-cream hover:text-ink"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
        <h3 className="font-display text-xl font-bold">{title}</h3>
        <p className="mt-2 text-[0.82rem] leading-relaxed text-ink/55">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={loading}
            className={tone === "danger" ? "bg-danger text-paper hover:bg-danger/90" : ""}
          >
            {loading && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppointmentDetails({
  appointment,
  open,
  onClose,
  footer,
  showCustomer = false,
}: {
  appointment: Appointment | null
  open: boolean
  onClose: () => void
  footer?: React.ReactNode
  showCustomer?: boolean
}) {
  if (!open || !appointment) return null

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center sm:px-4">
      <button
        type="button"
        aria-label="Close appointment details"
        onClick={onClose}
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Appointment details"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-paper shadow-[0_40px_80px_-30px_rgba(16,25,21,0.5)] sm:rounded-3xl"
      >
        <div className="relative h-40 overflow-hidden bg-sand">
          <Image
            src={appointment.serviceImage}
            alt={appointment.serviceName}
            fill
            sizes="512px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/10 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-paper/90 text-ink backdrop-blur"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
          <div className="absolute inset-x-4 bottom-3">
            <p className="font-mono text-[0.52rem] tracking-[0.15em] text-cream/65 uppercase">
              {appointment.serviceCategory}
            </p>
            <p className="font-display text-lg font-semibold text-cream">
              {appointment.serviceName}
            </p>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={appointment.status} />
            <StatusBadge status={appointment.paymentStatus} />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
            <Detail
              label="Appointment date"
              value={formatDate(appointment.appointmentDate)}
              icon={CalendarDays}
            />
            <Detail
              label="Time slot"
              value={appointment.timeSlot}
              icon={Clock3}
            />
            <Detail
              label="Service price"
              value={formatMoney(appointment.servicePrice)}
              icon={CalendarDays}
            />
            <Detail
              label="Requested on"
              value={formatDateTime(appointment.createdAt)}
              icon={Clock3}
            />
            {showCustomer && (
              <>
                <Detail
                  label="Customer"
                  value={appointment.customerName}
                  icon={UserRound}
                />
                <Detail
                  label="Email"
                  value={appointment.customerEmail}
                  icon={Mail}
                />
              </>
            )}
          </dl>

          <div className="mt-5 rounded-xl bg-cream/80 p-3.5">
            <p className="font-mono text-[0.52rem] tracking-[0.15em] text-ink/40 uppercase">
              Customer message
            </p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-ink/65">
              {appointment.message?.trim()
                ? appointment.message
                : "No additional message was left."}
            </p>
          </div>

          {footer && <div className="mt-5 flex flex-wrap justify-end gap-2">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

function Detail({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: LucideIcon
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 font-mono text-[0.52rem] tracking-[0.12em] text-ink/35 uppercase">
        <Icon className="size-3" />
        {label}
      </dt>
      <dd className="mt-1 text-[0.8rem] font-semibold text-ink">{value}</dd>
    </div>
  )
}
