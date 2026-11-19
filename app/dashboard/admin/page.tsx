"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  Clock3,
  CreditCard,
  ReceiptText,
  RefreshCw,
  Scissors,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { useAuth } from "@/components/providers/auth-provider"
import { PageLoader } from "@/components/site/loader"
import { EmptyState } from "@/components/site/empty-state"
import { StatusBadge } from "@/components/site/status-badge"
import { StatCard } from "@/components/dashboard/dashboard-ui"
import { Button, ButtonLink } from "@/components/ui/button"
import { getAdminStats, getAllAppointments, getTransactions } from "@/lib/data"
import { formatDate, formatDateTime, formatMoney } from "@/lib/format"
import type { AdminStats, Appointment, Transaction } from "@/lib/types"

function AdminOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getAdminStats(), getAllAppointments(), getTransactions()])
      .then(([statsData, appointmentData, transactionData]) => {
        if (!active) return
        setStats(statsData)
        setAppointments(appointmentData)
        setTransactions(transactionData)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load the admin overview."
        setError(message)
        toast.error(message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading) return <PageLoader label="Loading the studio overview…" />

  const pending = appointments.filter((item) => item.status === "pending")
  const todays = appointments.filter(
    (item) => item.appointmentDate === new Date().toISOString().slice(0, 10)
  )
  const paid = transactions.filter((item) => item.status === "paid")

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-clay">Admin overview</p>
          <h1 className="font-display text-[1.8rem] leading-tight font-bold sm:text-[2.2rem]">
            The studio, at a glance.
          </h1>
          <p className="mt-1.5 text-[0.82rem] text-ink/50">
            {user?.name ? `${user.name} · ` : ""}Monitor requests, the live menu
            and verified payments.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/dashboard/admin/services/new" size="sm">
            <Scissors />
            Add service
          </ButtonLink>
          <ButtonLink
            href="/dashboard/admin/appointments"
            variant="outline"
            size="sm"
          >
            <CalendarDays />
            Appointments
          </ButtonLink>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.78rem] text-danger">
          <span>{error}</span>
          <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
            <RefreshCw />
            Reload
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard
          label="Customers"
          value={stats?.customers ?? 0}
          icon={Users}
          note="Registered accounts"
        />
        <StatCard
          label="Active services"
          value={stats?.activeServices ?? 0}
          icon={Scissors}
          tone="sage"
          note="Visible on the menu"
        />
        <StatCard
          label="Appointments"
          value={stats?.appointments ?? 0}
          icon={CalendarDays}
          note="All-time requests"
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={Clock3}
          tone="clay"
          note="Needs a decision"
        />
        <StatCard
          label="Confirmed"
          value={stats?.confirmed ?? 0}
          icon={CalendarCheck2}
          tone="sage"
          note="Upcoming & past"
        />
        <StatCard
          label="Payments"
          value={formatMoney(stats?.payments ?? 0)}
          icon={CreditCard}
          tone="ink"
          note={`${paid.length} verified transactions`}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Pending queue */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-clay" />
              <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
                Pending requests · {pending.length}
              </p>
            </div>
            <Link
              href="/dashboard/admin/appointments"
              className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-clay-deep hover:underline"
            >
              Manage all
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={CalendarCheck2}
                title="The queue is clear"
                description="No pending requests right now. New booking requests will appear here."
                className="border-0 bg-transparent py-8"
              />
            </div>
          ) : (
            <ul className="divide-y divide-line/70">
              {pending.slice(0, 5).map((item) => (
                <li
                  key={item._id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5"
                >
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-sand">
                    <Image
                      src={item.serviceImage}
                      alt={item.serviceName}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.82rem] font-semibold">
                      {item.serviceName}
                    </p>
                    <p className="truncate text-[0.68rem] text-ink/40">
                      {item.customerName} · {formatDate(item.appointmentDate)} ·{" "}
                      {item.timeSlot}
                    </p>
                  </div>
                  <span className="text-[0.78rem] font-semibold">
                    {formatMoney(item.servicePrice)}
                  </span>
                  <ButtonLink
                    href="/dashboard/admin/appointments"
                    size="sm"
                    variant="outline"
                  >
                    Review
                  </ButtonLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink p-5 text-cream">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-sage uppercase">
              Today at the studio
            </p>
            <p className="mt-2 font-display text-3xl font-bold">
              {todays.length}
            </p>
            <p className="mt-1 text-[0.7rem] text-cream/45">
              Appointment{todays.length === 1 ? "" : "s"} scheduled for{" "}
              {formatDate(new Date())}
            </p>
            <div className="mt-4 flex gap-2">
              <ButtonLink
                href="/dashboard/admin/appointments"
                size="sm"
                variant="light"
              >
                Open the list
              </ButtonLink>
            </div>
          </div>

          <div className="card p-5">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
              Revenue snapshot
            </p>
            <p className="mt-2 font-display text-2xl font-bold">
              {formatMoney(stats?.payments ?? 0)}
            </p>
            <p className="mt-1 text-[0.68rem] text-ink/40">
              Only webhook-verified payments are counted.
            </p>
            <Link
              href="/dashboard/admin/transactions"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-clay-deep hover:underline"
            >
              <ReceiptText className="size-3.5" />
              View transactions
            </Link>
          </div>

          <div className="card p-5">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
              Quick actions
            </p>
            <div className="mt-3 space-y-1">
              {[
                {
                  href: "/dashboard/admin/services",
                  label: "Manage the menu",
                  icon: Scissors,
                },
                {
                  href: "/dashboard/admin/users",
                  label: "Manage customers",
                  icon: Users,
                },
                {
                  href: "/dashboard/admin/appointments",
                  label: "Confirm appointments",
                  icon: CalendarCheck2,
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.78rem] text-ink/65 transition-colors hover:bg-cream hover:text-ink"
                >
                  <item.icon className="size-3.5 text-clay" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-5 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
            Latest requests
          </p>
          <Link
            href="/dashboard/admin/appointments"
            className="text-[0.7rem] font-semibold text-clay-deep hover:underline"
          >
            See all
          </Link>
        </div>
        {appointments.length === 0 ? (
          <p className="px-5 py-10 text-center text-[0.8rem] text-ink/45">
            No appointment requests yet.
          </p>
        ) : (
          <div className="table-wrap rounded-none border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Requested</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 5).map((item) => (
                  <tr key={item._id}>
                    <td>
                      <p className="font-semibold">{item.customerName}</p>
                      <p className="text-[0.65rem] text-ink/40">
                        {item.customerEmail}
                      </p>
                    </td>
                    <td className="text-ink/65">{item.serviceName}</td>
                    <td className="text-ink/55">
                      {formatDate(item.appointmentDate)}
                      <span className="block text-[0.65rem] text-ink/35">
                        {item.timeSlot}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <StatusBadge status={item.paymentStatus} />
                    </td>
                    <td className="text-[0.7rem] text-ink/45">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-[0.7rem] text-ink/45">
        <CalendarX2 className="size-4 text-clay" />
        Cancelled requests stay in the history for the customer but never
        re-enter the pending queue.
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <RequireRole role="admin">
      <AdminOverview />
    </RequireRole>
  )
}
