"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Ban,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { RequireRole } from "@/components/providers/require-role"
import { EmptyState } from "@/components/site/empty-state"
import { PageLoader } from "@/components/site/loader"
import { StatusBadge } from "@/components/site/status-badge"
import { PageHeader, StatCard } from "@/components/dashboard/dashboard-ui"
import { ConfirmDialog } from "@/components/dashboard/dashboard-ui"
import { Button } from "@/components/ui/button"
import { getUsers, setUserBlocked } from "@/lib/data"
import { formatDate } from "@/lib/format"
import type { AppUser } from "@/lib/types"
import { cn, initials } from "@/lib/utils"

function ManageUsers() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"all" | "active" | "blocked">("all")
  const [selected, setSelected] = useState<AppUser | null>(null)
  const [blockTarget, setBlockTarget] = useState<AppUser | null>(null)
  const [working, setWorking] = useState(false)

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    getUsers()
      .then((data) => {
        if (active) setUsers(data)
      })
      .catch((err: unknown) => {
        if (!active) return
        const message =
          err instanceof Error ? err.message : "Could not load customers."
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

  const customers = useMemo(
    () => users.filter((user) => user.role === "customer"),
    [users]
  )

  const visible = useMemo(() => {
    let data = [...customers]
    const query = search.trim().toLowerCase()
    if (query) {
      data = data.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }
    if (status === "active") data = data.filter((user) => !user.isBlocked)
    if (status === "blocked") data = data.filter((user) => user.isBlocked)
    return data
  }, [customers, search, status])

  async function toggleBlock() {
    if (!blockTarget) return
    const next = !blockTarget.isBlocked
    setWorking(true)
    try {
      await setUserBlocked(blockTarget._id, next)
      setUsers((current) =>
        current.map((user) =>
          user._id === blockTarget._id ? { ...user, isBlocked: next } : user
        )
      )
      toast.success(
        next
          ? `${blockTarget.name} has been blocked and signed out.`
          : `${blockTarget.name} can access the platform again.`
      )
      setBlockTarget(null)
      if (selected?._id === blockTarget._id) {
        setSelected({ ...selected, isBlocked: next })
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update this customer."
      )
    } finally {
      setWorking(false)
    }
  }

  if (loading) return <PageLoader label="Loading registered customers…" />

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Manage customers"
        description="View every registered customer and suspend access when necessary. Blocking a customer also revokes their active sessions."
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
          label="Customers"
          value={customers.length}
          icon={Users}
          note="Registered customer accounts"
        />
        <StatCard
          label="Active"
          value={customers.filter((user) => !user.isBlocked).length}
          icon={CheckCircle2}
          tone="sage"
          note="Can book and pay"
        />
        <StatCard
          label="Blocked"
          value={customers.filter((user) => user.isBlocked).length}
          icon={Ban}
          tone="clay"
          note="Access suspended"
        />
      </div>

      <div className="mb-4 grid gap-2.5 rounded-2xl border border-line bg-paper p-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Search customers</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink/35" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email…"
            className="field pl-10"
          />
        </label>
        <div className="flex gap-1 rounded-xl bg-cream p-1">
          {(["all", "active", "blocked"] as const).map((key) => (
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
          icon={Users}
          title={
            customers.length === 0
              ? "No customers yet"
              : "No customers match your filters"
          }
          description={
            customers.length === 0
              ? "Customer accounts created through sign up will appear here."
              : "Try a different search term or status filter."
          }
        />
      ) : (
        <>
          <div className="table-wrap hidden md:block">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-[0.6rem] font-bold text-ink/50">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            initials(user.name)
                          )}
                        </span>
                        <div>
                          <p className="text-[0.8rem] font-semibold">{user.name}</p>
                          <p className="text-[0.66rem] text-ink/40">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-[0.75rem] text-ink/55">
                      {user.phoneNumber || "—"}
                    </td>
                    <td className="text-[0.72rem] text-ink/50">
                      {user.createdAt ? formatDate(user.createdAt) : "—"}
                    </td>
                    <td>
                      <StatusBadge status={user.role} />
                    </td>
                    <td>
                      {user.isBlocked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-danger/8 px-2.5 py-1 font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-danger uppercase">
                          <Ban className="size-3" />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-mono text-[0.58rem] font-semibold tracking-[0.1em] text-success uppercase">
                          <ShieldCheck className="size-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(user)}
                          className="grid size-8 place-items-center rounded-lg text-ink/45 hover:bg-cream hover:text-ink"
                          title="View customer details"
                        >
                          <Eye className="size-4" />
                        </button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className={
                            user.isBlocked ? "text-success" : "text-danger"
                          }
                          onClick={() => setBlockTarget(user)}
                        >
                          {user.isBlocked ? (
                            <>
                              <CheckCircle2 />
                              Unblock
                            </>
                          ) : (
                            <>
                              <Ban />
                              Block
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {visible.map((user) => (
              <article key={user._id} className="card p-3.5">
                <div className="flex items-start gap-3">
                  <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-[0.65rem] font-bold text-ink/50">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      initials(user.name)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.85rem] font-semibold">
                      {user.name}
                    </p>
                    <p className="truncate text-[0.68rem] text-ink/45">
                      {user.email}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <StatusBadge status={user.role} />
                      <StatusBadge
                        status={user.isBlocked ? "failed" : "active"}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-1.5 border-t border-line/70 pt-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(user)}
                  >
                    <Eye />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={user.isBlocked ? "text-success" : "text-danger"}
                    onClick={() => setBlockTarget(user)}
                  >
                    {user.isBlocked ? (
                      <>
                        <CheckCircle2 />
                        Unblock
                      </>
                    ) : (
                      <>
                        <Ban />
                        Block
                      </>
                    )}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Customer detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center sm:px-4">
          <button
            type="button"
            aria-label="Close customer details"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Customer details"
            className="relative w-full max-w-sm rounded-t-3xl border border-line bg-paper p-5 shadow-2xl sm:rounded-3xl"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 grid size-7 place-items-center rounded-full text-ink/35 hover:bg-cream"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-3">
              <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-sm font-bold text-ink/50">
                {selected.image ? (
                  <img
                    src={selected.image}
                    alt={selected.name}
                    className="size-full object-cover"
                  />
                ) : (
                  initials(selected.name)
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold">
                  {selected.name}
                </p>
                <div className="mt-1 flex gap-1.5">
                  <StatusBadge status={selected.role} />
                  <StatusBadge
                    status={selected.isBlocked ? "failed" : "active"}
                  />
                </div>
              </div>
            </div>

            <dl className="mt-5 space-y-3 border-t border-line pt-4 text-[0.78rem]">
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-clay" />
                <dt className="sr-only">Email</dt>
                <dd className="text-ink/65">{selected.email}</dd>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-clay" />
                <dt className="sr-only">Phone</dt>
                <dd className="text-ink/65">
                  {selected.phoneNumber || "No phone number"}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <UserRound className="size-4 text-clay" />
                <dt className="sr-only">Joined</dt>
                <dd className="text-ink/65">
                  Joined{" "}
                  {selected.createdAt ? formatDate(selected.createdAt) : "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className={selected.isBlocked ? "text-success" : "text-danger"}
                onClick={() => setBlockTarget(selected)}
              >
                {selected.isBlocked ? (
                  <>
                    <CheckCircle2 />
                    Unblock
                  </>
                ) : (
                  <>
                    <Ban />
                    Block
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(blockTarget)}
        title={
          blockTarget?.isBlocked
            ? "Unblock this customer?"
            : "Block this customer?"
        }
        description={
          blockTarget?.isBlocked
            ? `${blockTarget.name} will be able to sign in and use the platform again.`
            : `${blockTarget?.name} will be signed out immediately and blocked from all protected features. Existing appointment records are kept.`
        }
        confirmLabel={blockTarget?.isBlocked ? "Unblock customer" : "Block customer"}
        tone={blockTarget?.isBlocked ? "primary" : "danger"}
        loading={working}
        onConfirm={() => void toggleBlock()}
        onClose={() => setBlockTarget(null)}
      />
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <RequireRole role="admin">
      <ManageUsers />
    </RequireRole>
  )
}
