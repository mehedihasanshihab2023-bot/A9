"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck2,
  CalendarDays,
  CalendarX2,
  Clock3,
  CreditCard,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { useAuth } from "@/components/providers/auth-provider"
import { PageLoader } from "@/components/site/loader"
import { EmptyState } from "@/components/site/empty-state"
import { StatusBadge } from "@/components/site/status-badge"
import { StatCard } from "@/components/dashboard/dashboard-ui"
import { Button, ButtonLink } from "@/components/ui/button"
import { getMyAppointments, getMyStats, getMyTransactions } from "@/lib/data"
import { formatDate, formatMoney, todayISO } from "@/lib/format"
import type { Appointment, CustomerStats, Transaction } from "@/lib/types"

function CustomerOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState<CustomerStats | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([getMyStats(), getMyAppointments(), getMyTransactions()])
      .then(([statsData, appointmentData, transactionData]) => {
        if (!active) return
        setStats(statsData)
        setAppointments(appointmentData)
        setTransactions(transactionData)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load your dashboard."
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

  const nextAppointment = useMemo(() => {
    const today = todayISO()
    return (
      appointments
        .filter(
          (item) =>
            item.appointmentDate >= today &&
            (item.status === "confirmed" || item.status === "pending")
        )
        .sort((a, b) => {
          if (a.appointmentDate !== b.appointmentDate) {
            return a.appointmentDate.localeCompare(b.appointmentDate)
          }
          return a.timeSlot.localeCompare(b.timeSlot)
        })[0] ?? null
    )
  }, [appointments])

  const paidTotal = transactions
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0)

  if (loading) return <PageLoader label="Preparing your overview…" />

  return (
    <div>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-clay">Customer overview</p>
          <h1 className="font-display text-[1.8rem] leading-tight font-bold sm:text-[2.2rem]">
            Welcome back, {user?.name?.split(" ")[0] ?? "there"}.
          </h1>
          <p className="mt-1.5 text-[0.82rem] text-ink/50">
            Here is where things stand with your studio visits.
          </p>
        </div>
        <ButtonLink href="/services" size="sm">
          <Sparkles />
          Book a service
        </ButtonLink>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-[0.78rem] text-danger">
          <span>{error}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
          >
            <RefreshCw />
            Reload
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total requests"
          value={stats?.total ?? 0}
          icon={CalendarDays}
          note="All appointment requests"
        />
        <StatCard
          label="Pending"
          value={stats?.pending ?? 0}
          icon={Clock3}
          tone="clay"
          note="Awaiting studio review"
        />
        <StatCard
          label="Confirmed"
          value={stats?.confirmed ?? 0}
          icon={CalendarCheck2}
          tone="sage"
          note="Ready for your visit"
        />
        <StatCard
          label="Cancelled"
          value={stats?.cancelled ?? 0}
          icon={CalendarX2}
          note="Closed requests"
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Next appointment */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
              Next on the calendar
            </p>
            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-clay-deep hover:underline"
            >
              All appointments
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          {nextAppointment ? (
            <div className="grid gap-4 p-4 sm:grid-cols-[9.5rem_1fr] sm:p-5">
              <div className="relative aspect-[4/3.4] overflow-hidden rounded-xl bg-sand sm:aspect-square">
                <Image
                  src={nextAppointment.serviceImage}
                  alt={nextAppointment.serviceName}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={nextAppointment.status} />
                  <StatusBadge status={nextAppointment.paymentStatus} />
                </div>
                <h2 className="mt-2.5 font-display text-xl leading-tight font-bold">
                  {nextAppointment.serviceName}
                </h2>
                <p className="mt-1 text-[0.75rem] text-ink/45">
                  {nextAppointment.serviceCategory}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.78rem]">
                  <span className="inline-flex items-center gap-1.5 text-ink/65">
                    <CalendarDays className="size-3.5 text-clay" />
                    {formatDate(nextAppointment.appointmentDate)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-ink/65">
                    <Clock3 className="size-3.5 text-clay" />
                    {nextAppointment.timeSlot}
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                    <CreditCard className="size-3.5 text-clay" />
                    {formatMoney(nextAppointment.servicePrice)}
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <ButtonLink
                    href="/dashboard/appointments"
                    size="sm"
                    variant="outline"
                  >
                    Manage booking
                    <ArrowRight />
                  </ButtonLink>
                  {nextAppointment.status === "confirmed" &&
                    nextAppointment.paymentStatus === "unpaid" && (
                      <ButtonLink href="/dashboard/appointments" size="sm">
                        Pay now
                      </ButtonLink>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={CalendarDays}
                title="No upcoming appointment"
                description="Your calendar is clear. Browse the menu and request a slot that suits you."
                action={
                  <ButtonLink href="/services" size="sm">
                    Explore services
                  </ButtonLink>
                }
                className="border-0 bg-transparent py-8"
              />
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-ink p-5 text-cream">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-sage uppercase">
              Lifetime paid
            </p>
            <p className="mt-2 font-display text-3xl font-bold">
              {formatMoney(paidTotal)}
            </p>
            <p className="mt-1 text-[0.7rem] text-cream/45">
              Across {transactions.filter((t) => t.status === "paid").length}{" "}
              successful transaction
              {transactions.filter((t) => t.status === "paid").length === 1
                ? ""
                : "s"}
            </p>
            <Link
              href="/dashboard/appointments#payments"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-cream/15 px-3 py-1.5 text-[0.68rem] font-semibold text-cream/75 transition-colors hover:border-cream/35 hover:text-cream"
            >
              View payment history
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>

          <div className="card p-5">
            <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
              Quick links
            </p>
            <div className="mt-3 space-y-1.5">
              {[
                {
                  href: "/dashboard/appointments",
                  label: "My appointments",
                  icon: CalendarDays,
                },
                {
                  href: "/dashboard/profile",
                  label: "Update profile",
                  icon: Sparkles,
                },
                {
                  href: "/services",
                  label: "Browse the menu",
                  icon: ArrowUpRight,
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

      {/* Recent requests */}
      <div className="mt-5 card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="font-mono text-[0.55rem] tracking-[0.15em] text-ink/40 uppercase">
            Recent requests
          </p>
          <Link
            href="/dashboard/appointments"
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
          <ul className="divide-y divide-line/70">
            {appointments.slice(0, 4).map((item) => (
              <li
                key={item._id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
              >
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-sand">
                  <Image
                    src={item.serviceImage}
                    alt={item.serviceName}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.8rem] font-semibold">
                    {item.serviceName}
                  </p>
                  <p className="text-[0.68rem] text-ink/40">
                    {formatDate(item.appointmentDate)} · {item.timeSlot}
                  </p>
                </div>
                <StatusBadge status={item.status} />
                <span className="w-16 text-right text-[0.78rem] font-semibold">
                  {formatMoney(item.servicePrice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RequireRole role="customer">
      <CustomerOverview />
    </RequireRole>
  )
}
