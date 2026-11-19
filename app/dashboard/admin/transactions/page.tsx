"use client"

import { useEffect, useMemo, useState } from "react"
import {
  CreditCard,
  Lock,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { EmptyState } from "@/components/site/empty-state"
import { PageLoader } from "@/components/site/loader"
import { StatusBadge } from "@/components/site/status-badge"
import { PageHeader, StatCard } from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { getTransactions } from "@/lib/data"
import { formatDate, formatDateTime, formatMoney, shortRef } from "@/lib/format"
import type { Transaction } from "@/lib/types"
import { cn } from "@/lib/utils"

function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "paid" | "failed">("all")

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    getTransactions()
      .then((data) => {
        if (active) setTransactions(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load transactions."
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
    let data = transactions
    if (status !== "all") {
      data = data.filter((item) => item.status === status)
    }
    const query = search.trim().toLowerCase()
    if (query) {
      data = data.filter(
        (item) =>
          item.customerName.toLowerCase().includes(query) ||
          item.serviceName.toLowerCase().includes(query) ||
          item.stripeSessionId.toLowerCase().includes(query)
      )
    }
    return data
  }, [search, status, transactions])

  const paid = transactions.filter((item) => item.status === "paid")
  const revenue = paid.reduce((sum, item) => sum + item.amount, 0)

  if (loading) return <PageLoader label="Loading verified transactions…" />

  return (
    <div>
      <PageHeader
        eyebrow="Payments"
        title="Transactions"
        description="A read-only ledger of Stripe checkouts. Records are created only by a verified webhook and cannot be edited from this dashboard."
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

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Verified revenue"
          value={formatMoney(revenue)}
          icon={CreditCard}
          tone="ink"
          note="Paid transactions only"
        />
        <StatCard
          label="Successful payments"
          value={paid.length}
          icon={ShieldCheck}
          tone="sage"
          note="Confirmed by Stripe webhook"
        />
        <StatCard
          label="Failed payments"
          value={transactions.filter((item) => item.status === "failed").length}
          icon={ReceiptText}
          note="Never counted as revenue"
        />
      </div>

      <div className="mb-4 grid gap-2.5 rounded-2xl border border-line bg-paper p-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search transactions</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search customer, service or session…"
            className="field pl-10"
          />
        </label>
        <div className="flex gap-1 rounded-xl bg-cream p-1">
          {(["all", "paid", "failed"] as const).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatus(key)}
              className={cn(
                "rounded-lg px-3.5 py-1.5 font-mono text-[0.58rem] tracking-[0.1em] uppercase transition-colors",
                status === key ? "bg-paper text-ink shadow-sm" : "text-ink/40"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title={
            transactions.length === 0
              ? "No transactions yet"
              : "No transactions match"
          }
          description={
            transactions.length === 0
              ? "Once a customer pays for a confirmed appointment, the verified Stripe transaction appears here."
              : "Try another status filter or clear the search."
          }
        />
      ) : (
        <>
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Appointment</th>
                  <th>Amount</th>
                  <th>Stripe reference</th>
                  <th>Status</th>
                  <th>Paid on</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <p className="text-[0.8rem] font-semibold">
                        {item.customerName}
                      </p>
                      <p className="text-[0.64rem] text-ink/35">
                        {item.customerId.slice(-8)}
                      </p>
                    </td>
                    <td className="text-[0.76rem] text-ink/65">
                      {item.serviceName}
                    </td>
                    <td className="text-[0.72rem] text-ink/50">
                      {formatDate(item.appointmentDate)}
                    </td>
                    <td className="font-semibold">
                      {formatMoney(item.amount, item.currency)}
                      <span className="block text-[0.6rem] font-normal text-ink/35">
                        {item.currency}
                      </span>
                    </td>
                    <td>
                      <span
                        className="rounded-md bg-cream px-2 py-1 font-mono text-[0.65rem] text-ink/50"
                        title={item.stripeSessionId}
                      >
                        {shortRef(item.stripeSessionId)}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="text-[0.7rem] text-ink/45">
                      {formatDateTime(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {visible.map((item) => (
              <article key={item._id} className="card p-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[0.84rem] font-semibold">
                      {item.customerName}
                    </p>
                    <p className="truncate text-[0.68rem] text-ink/45">
                      {item.serviceName}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] text-ink/50">
                  <span className="font-semibold text-ink">
                    {formatMoney(item.amount, item.currency)}
                  </span>
                  <span>{formatDate(item.appointmentDate)}</span>
                  <span className="font-mono text-[0.62rem]">
                    {shortRef(item.stripeSessionId)}
                  </span>
                </div>
                <p className="mt-1 text-[0.63rem] text-ink/35">
                  {formatDateTime(item.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-[0.7rem] leading-relaxed text-ink/45">
        <Lock className="mt-0.5 size-3.5 shrink-0 text-clay" />
        Transactions are append-only. There is no endpoint to mark a failed
        payment as successful — the payment status on an appointment changes only
        after a signature-verified Stripe webhook.
      </div>
    </div>
  )
}

export default function AdminTransactionsPage() {
  return (
    <RequireRole role="admin">
      <TransactionsView />
    </RequireRole>
  )
}
