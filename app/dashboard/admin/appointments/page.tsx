"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  CalendarCheck2,
  CalendarDays,
  Check,
  Eye,
  RefreshCw,
  Search,
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
import { getAllAppointments, updateAppointmentStatus } from "@/lib/data"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"
import type { Appointment, AppointmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

type ActionState = {
  appointment: Appointment
  action: "confirmed" | "cancelled"
} | null

const filters: Array<{ key: "all" | AppointmentStatus; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "cancelled", label: "Cancelled" },
]

function ManageAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | AppointmentStatus>("all")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [action, setAction] = useState<ActionState>(null)
  const [working, setWorking] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    getAllAppointments()
      .then((data) => {
        if (active) setAppointments(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load appointments."
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
    let data = appointments
    if (filter !== "all") {
      data = data.filter((item) => item.status === filter)
    }
    const query = search.trim().toLowerCase()
    if (query) {
      data = data.filter(
        (item) =>
          item.customerName.toLowerCase().includes(query) ||
          item.customerEmail.toLowerCase().includes(query) ||
          item.serviceName.toLowerCase().includes(query)
      )
    }
    return data
  }, [appointments, filter, search])

  async function confirmAction() {
    if (!action) return
    setWorking(true)
    try {
      await updateAppointmentStatus(action.appointment._id, action.action)
      setAppointments((current) =>
        current.map((item) =>
          item._id === action.appointment._id
            ? { ...item, status: action.action }
            : item
        )
      )
      toast.success(
        action.action === "confirmed"
          ? "Appointment confirmed. The customer can now pay."
          : "Appointment cancelled."
      )
      setAction(null)
      if (selected?._id === action.appointment._id) {
        setSelected({ ...selected, status: action.action })
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update the appointment."
      )
    } finally {
      setWorking(false)
    }
  }

  if (loading) return <PageLoader label="Loading appointment requests…" />

  return (
    <div>
      <PageHeader
        eyebrow="Booking desk"
        title="Manage appointments"
        description="Confirm pending requests or cancel a booking. Only pending appointments can be confirmed; cancellation is always recorded."
        actions={
          <Button variant="outline" size="sm" onClick={reload}>
            <RefreshCw />
            Refresh
          </Button>
        }
      />

      {error && (
        <div className="mb-5 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.78rem] text-danger">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {filters.map((item) => {
            const count =
              item.key === "all"
                ? appointments.length
                : appointments.filter((a) => a.status === item.key).length
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
        <label className="relative ml-auto block w-full sm:w-72">
          <span className="sr-only">Search appointments</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer or service…"
            className="field pl-10"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No appointments here"
          description="New customer requests will appear in this queue as soon as they are submitted."
        />
      ) : (
        <>
          <div className="table-wrap hidden lg:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & time</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Requested</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <p className="font-semibold">{item.customerName}</p>
                      <p className="text-[0.65rem] text-ink/40">
                        {item.customerEmail}
                      </p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="relative size-9 shrink-0 overflow-hidden rounded-md bg-sand">
                          <Image
                            src={item.serviceImage}
                            alt={item.serviceName}
                            fill
                            sizes="36px"
                            className="object-cover"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="max-w-[11rem] truncate text-[0.78rem] font-medium">
                            {item.serviceName}
                          </p>
                          <p className="text-[0.63rem] text-ink/40">
                            {item.serviceCategory}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.75rem] text-ink/60">
                      {formatDate(item.appointmentDate)}
                      <span className="block text-[0.65rem] text-ink/40">
                        {item.timeSlot}
                      </span>
                    </td>
                    <td className="font-semibold">
                      {formatMoney(item.servicePrice)}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <StatusBadge status={item.paymentStatus} />
                    </td>
                    <td className="text-[0.68rem] text-ink/45">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="grid size-8 place-items-center rounded-lg text-ink/45 hover:bg-cream hover:text-ink"
                          title="View details"
                        >
                          <Eye className="size-4" />
                        </button>
                        {item.status === "pending" && (
                          <button
                            type="button"
                            onClick={() =>
                              setAction({ appointment: item, action: "confirmed" })
                            }
                            className="grid size-8 place-items-center rounded-lg text-success hover:bg-success/10"
                            title="Confirm appointment"
                          >
                            <Check className="size-4" />
                          </button>
                        )}
                        {(item.status === "pending" ||
                          item.status === "confirmed") && (
                          <button
                            type="button"
                            onClick={() =>
                              setAction({ appointment: item, action: "cancelled" })
                            }
                            className="grid size-8 place-items-center rounded-lg text-danger hover:bg-danger/8"
                            title="Cancel appointment"
                          >
                            <XCircle className="size-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 lg:hidden">
            {visible.map((item) => (
              <article key={item._id} className="card p-3.5">
                <div className="flex gap-3">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <Image
                      src={item.serviceImage}
                      alt={item.serviceName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={item.status} />
                      <StatusBadge status={item.paymentStatus} />
                    </div>
                    <p className="mt-1.5 truncate text-[0.82rem] font-semibold">
                      {item.serviceName}
                    </p>
                    <p className="truncate text-[0.68rem] text-ink/45">
                      {item.customerName} · {item.customerEmail}
                    </p>
                    <p className="mt-0.5 text-[0.68rem] text-ink/45">
                      {formatDate(item.appointmentDate)} · {item.timeSlot} ·{" "}
                      {formatMoney(item.servicePrice)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line/70 pt-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(item)}
                  >
                    <Eye />
                    Details
                  </Button>
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        setAction({ appointment: item, action: "confirmed" })
                      }
                    >
                      <Check />
                      Confirm
                    </Button>
                  )}
                  {(item.status === "pending" ||
                    item.status === "confirmed") && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() =>
                        setAction({ appointment: item, action: "cancelled" })
                      }
                    >
                      <XCircle />
                      Cancel
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-[0.7rem] text-ink/45">
        <span className="inline-flex items-center gap-2">
          <CalendarCheck2 className="size-4 text-clay" />
          Payment status is only updated by a verified Stripe webhook.
        </span>
        <ButtonLink href="/dashboard/admin/transactions" size="sm" variant="ghost">
          View transactions
        </ButtonLink>
      </div>

      <AppointmentDetails
        appointment={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        showCustomer
        footer={
          selected ? (
            <>
              {selected.status === "pending" && (
                <Button
                  size="sm"
                  onClick={() =>
                    setAction({ appointment: selected, action: "confirmed" })
                  }
                >
                  <Check />
                  Confirm appointment
                </Button>
              )}
              {(selected.status === "pending" ||
                selected.status === "confirmed") && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  onClick={() =>
                    setAction({ appointment: selected, action: "cancelled" })
                  }
                >
                  <XCircle />
                  Cancel appointment
                </Button>
              )}
            </>
          ) : null
        }
      />

      <ConfirmDialog
        open={Boolean(action)}
        title={
          action?.action === "confirmed"
            ? "Confirm this appointment?"
            : "Cancel this appointment?"
        }
        description={
          action?.action === "confirmed"
            ? `${action.appointment.customerName}'s request for ${
                action.appointment.serviceName
              } on ${formatDate(
                action.appointment.appointmentDate
              )} at ${action.appointment.timeSlot} will be confirmed. The customer can then pay.`
            : `${action?.appointment.customerName}'s booking for ${
                action?.appointment.serviceName ?? ""
              } will be cancelled. This action is final.`
        }
        confirmLabel={
          action?.action === "confirmed" ? "Confirm appointment" : "Cancel booking"
        }
        cancelLabel="Go back"
        tone={action?.action === "cancelled" ? "danger" : "primary"}
        loading={working}
        onConfirm={() => void confirmAction()}
        onClose={() => setAction(null)}
      />
    </div>
  )
}

export default function AdminAppointmentsPage() {
  return (
    <RequireRole role="admin">
      <ManageAppointments />
    </RequireRole>
  )
}
